import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVisitorIdentity, VISITOR_COOKIE_NAME } from "@/lib/visitorIdentity";
import { sendTelegramMessage } from "@/lib/telegram";
import { isRateLimited } from "@/lib/rateLimit";

const CONTACT_LIMIT = 50;
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 год

// Лимит по IP (не привязан к конкретному авто) — иначе можно было бы
// обойти ограничение, перебирая разные carId с одного источника.
// 30 за 10 минут с запасом покрывает реального человека, звонящего по
// нескольким объявлениям, но блокирует скриптовый перебор.
const CONTACT_IP_LIMIT = 30;
const CONTACT_IP_WINDOW_MS = 10 * 60 * 1000;

/**
 * POST /api/cars/:id/contact
 * Регистрирует нажатие кнопки "Bog'lanish" на странице авто.
 *
 * Считает только уникальных посетителей (по связке IP + анонимный cookie) —
 * повторные нажатия одного и того же человека не увеличивают счётчик.
 * При достижении 50 уникальных обращений авто автоматически снимается
 * с продажи (DELISTED) — это сигнал, что объявление, скорее всего,
 * неактуально, раз столько людей уже звонили без результата.
 * Продавец получает уведомление в Telegram постфактум, без возможности
 * как-то это предотвратить или отложить.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isRateLimited(req, "car-contact", CONTACT_IP_LIMIT, CONTACT_IP_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      { status: 429 }
    );
  }

  const { id } = await params;
  const { hash, cookieValue, isNewCookie } = getVisitorIdentity(req);

  const car = await prisma.car.findUnique({
    where: { id },
    include: { seller: true },
  });

  if (!car) {
    return NextResponse.json({ error: "Автомобиль не найден" }, { status: 404 });
  }

  // Пытаемся создать запись о контакте — уникальный индекс (carId, visitorHash)
  // не даст создать дубликат, если этот посетитель уже нажимал кнопку ранее.
  let isNewContact = false;
  try {
    await prisma.contactClick.create({
      data: { carId: id, visitorHash: hash },
    });
    isNewContact = true;
  } catch {
    // Уже было обращение от этого посетителя — не считаем повторно.
    isNewContact = false;
  }

  let delisted = false;

  if (isNewContact) {
    const updated = await prisma.car.update({
      where: { id },
      data: { contactCount: { increment: 1 } },
    });

    if (updated.contactCount >= CONTACT_LIMIT && updated.status === "AVAILABLE") {
      await prisma.car.update({
        where: { id },
        data: { status: "DELISTED" },
      });
      delisted = true;

      if (car.seller.telegramId) {
        await sendTelegramMessage(
          car.seller.telegramId,
          `ℹ️ Объявление <b>${car.brand} ${car.model} ${car.year}</b> снято с продажи: ` +
            `достигнут лимит ${CONTACT_LIMIT} обращений без подтверждения продажи.\n\n` +
            `Если автомобиль ещё актуален, опубликуйте новое объявление на Eng-arzon.uz.`
        );
      }
    }
  }

  const res = NextResponse.json({ ok: true, delisted });

  if (isNewCookie) {
    res.cookies.set(VISITOR_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: VISITOR_COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return res;
}
