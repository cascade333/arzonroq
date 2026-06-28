import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { sendTelegramMessage } from "@/lib/telegram";
import { BRANDS, MODELS_BY_BRAND } from "@/lib/types";

/**
 * POST /api/admin/cars/:id/approve
 * Менеджер одобряет заявку после сверки фото техпаспорта/авто и цены
 * с другими досками объявлений. Авто переходит в AVAILABLE и появляется
 * на сайте. marketReferencePrice — необязательная заметка менеджера
 * о цене, с которой он сравнивал (для прозрачности и истории решений).
 *
 * VIN вводит менеджер, глядя на фото техпаспорта (без OCR на этом этапе).
 * Перед публикацией проверяем, не выставлена ли уже машина с таким VIN
 * среди активных объявлений (AVAILABLE/PENDING_VERIFICATION) — это защита
 * от дублей и повторных объявлений уже проданных машин.
 *
 * Если продавец указал модель, которой нет во встроенном справочнике
 * (поле "своя модель" в форме /sell), при одобрении она сохраняется в
 * CustomModel и начинает отображаться в фильтрах/форме у всех — см. ТЗ.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.vin || typeof body.vin !== "string" || body.vin.trim().length < 11) {
    return NextResponse.json(
      { error: "Укажите корректный VIN-код (прочитайте с фото техпаспорта)" },
      { status: 400 }
    );
  }
  const vin = body.vin.trim().toUpperCase();

  const car = await prisma.car.findUnique({ where: { id }, include: { seller: true } });
  if (!car) {
    return NextResponse.json({ error: "Автомобиль не найден" }, { status: 404 });
  }
  if (car.status !== "PENDING_VERIFICATION") {
    return NextResponse.json(
      { error: "Заявка уже обработана" },
      { status: 409 }
    );
  }

  // Проверка дублей: тот же VIN уже среди опубликованных или ожидающих
  // проверки объявлений (не считая текущую заявку) — значит машина уже
  // выставлена, и это повторное/фейковое объявление.
  const duplicate = await prisma.car.findFirst({
    where: {
      vin,
      id: { not: id },
      status: { in: ["AVAILABLE", "PENDING_VERIFICATION"] },
    },
  });
  if (duplicate) {
    return NextResponse.json(
      {
        error: `Автомобиль с этим VIN уже выставлен на сайте (объявление ${duplicate.id}, статус: ${duplicate.status}). Возможный дубликат — отклоните заявку.`,
      },
      { status: 409 }
    );
  }

  const knownModels: string[] = (BRANDS as readonly string[]).includes(car.brand)
    ? MODELS_BY_BRAND[car.brand] ?? []
    : [];

  if (!knownModels.includes(car.model)) {
    await prisma.customModel.upsert({
      where: { brand_model: { brand: car.brand, model: car.model } },
      update: {},
      create: { brand: car.brand, model: car.model },
    });
  }

  const updated = await prisma.car.update({
    where: { id },
    data: {
      vin,
      status: "AVAILABLE",
      marketReferencePrice: body.marketReferencePrice
        ? Number(body.marketReferencePrice)
        : null,
      reviewedAt: new Date(),
      reviewedBy: body.reviewedBy ?? null,
      rejectionReason: null,
      lastConfirmedAt: new Date(),
    },
  });

  if (car.seller.telegramId) {
    await sendTelegramMessage(
      car.seller.telegramId,
      `✅ Ваш автомобиль <b>${car.brand} ${car.model} ${car.year}</b> прошёл проверку и опубликован на Eng-arzon.uz!`
    );
  }

  return NextResponse.json({ car: updated });
}
