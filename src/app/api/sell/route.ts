import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rateLimit";
import { sendTelegramMessage } from "@/lib/telegram";

// Реальный продавец не подаёт больше пары заявок за раз — лимит защищает
// очередь модерации от спама фейковыми объявлениями.
const SELL_LIMIT = 5;
const SELL_WINDOW_MS = 60 * 60 * 1000; // 1 час

interface SellSubmission {
  sellerName: string;
  sellerPhone: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  region: string;
  price: number;
  transmission: "AUTOMATIC" | "MANUAL";
  fuelType: "PETROL" | "DIESEL" | "GAS" | "ELECTRIC" | "HYBRID";
  description?: string;
  isDamaged: boolean;
  damageDescription?: string;
  registrationDocFrontUrl: string;
  registrationDocBackUrl: string;
  photoFrontUrl: string;
  photoBackUrl: string;
  photoLeftUrl: string;
  photoRightUrl: string;
}

const REQUIRED_FIELDS: (keyof SellSubmission)[] = [
  "sellerName",
  "sellerPhone",
  "brand",
  "model",
  "year",
  "mileage",
  "region",
  "price",
  "transmission",
  "fuelType",
  "registrationDocFrontUrl",
  "registrationDocBackUrl",
  "photoFrontUrl",
  "photoBackUrl",
  "photoLeftUrl",
  "photoRightUrl",
];

/**
 * POST /api/sell
 * Публичная подача заявки продавцом (без логина — самоподача через сайт).
 *
 * Требует 2 фото техпаспорта (перед/зад) и 4 фото авто по строго заданным
 * ракурсам (перед/зад/левый бок/правый бок) — без этого заявка не создаётся.
 * VIN отдельно не запрашивается — он виден на фото техпаспорта, менеджер
 * считывает его оттуда при модерации. Цена, которую указывает продавец,
 * сохраняется как есть; менеджер сверяет её с досками объявлений вручную
 * в админке и решает, публиковать или отклонить (см. ТЗ).
 *
 * Авто получает статус PENDING_VERIFICATION и НЕ показывается на сайте,
 * пока менеджер не одобрит через /api/admin/cars/:id/approve.
 */
export async function POST(req: NextRequest) {
  if (isRateLimited(req, "sell-submit", SELL_LIMIT, SELL_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Слишком много заявок. Попробуйте через час." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return NextResponse.json(
        { error: `Поле "${field}" обязательно` },
        { status: 400 }
      );
    }
  }

  if (!body.price || Number(body.price) <= 0) {
    return NextResponse.json(
      { error: "Цена автомобиля должна быть больше 0" },
      { status: 400 }
    );
  }

  if (body.isDamaged && !body.damageDescription?.trim()) {
    return NextResponse.json(
      { error: "Опишите повреждения автомобиля" },
      { status: 400 }
    );
  }

  // Находим существующего продавца по телефону или создаём нового —
  // продавцу не нужен пароль, телефон выступает идентификатором (MVP).
  const phone = String(body.sellerPhone).trim();
  let seller = await prisma.seller.findFirst({ where: { phone } });
  if (!seller) {
    seller = await prisma.seller.create({
      data: { name: body.sellerName, phone },
    });
  }

  // Четыре фото авто с фиксированными ракурсами становятся CarImage
  // в заданном порядке — на сайте они показываются именно в этой
  // последовательности (перед, зад, левый бок, правый бок).
  const carPhotos = [
    body.photoFrontUrl,
    body.photoBackUrl,
    body.photoLeftUrl,
    body.photoRightUrl,
  ];

  const car = await prisma.car.create({
    data: {
      brand: body.brand,
      model: body.model,
      year: Number(body.year),
      mileage: Number(body.mileage),
      region: body.region,
      price: Number(body.price),
      transmission: body.transmission,
      fuelType: body.fuelType,
      description: body.description || null,
      sellerId: seller.id,
      status: "PENDING_VERIFICATION",
      isDamaged: Boolean(body.isDamaged),
      damageDescription: body.isDamaged ? body.damageDescription : null,
      registrationDocFrontUrl: body.registrationDocFrontUrl,
      registrationDocBackUrl: body.registrationDocBackUrl,
      photoFrontUrl: body.photoFrontUrl,
      photoBackUrl: body.photoBackUrl,
      photoLeftUrl: body.photoLeftUrl,
      photoRightUrl: body.photoRightUrl,
      images: {
        create: carPhotos.map((url: string, i: number) => ({
          imageUrl: url,
          position: i,
        })),
      },
    },
  });

  // Уведомляем менеджера в Telegram о новой заявке — со ссылкой прямо
  // на страницу проверки в админке, чтобы можно было одобрить/отклонить
  // с телефона, не выискивая заявку в общем списке.
  const managerChatId = process.env.MANAGER_TELEGRAM_CHAT_ID;
  if (managerChatId) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://eng-arzon.uz";
    await sendTelegramMessage(
      managerChatId,
      `🆕 Новая заявка на проверку\n\n` +
        `<b>${car.brand} ${car.model} ${car.year}</b>\n` +
        `Цена: $${car.price.toLocaleString("en-US")}\n` +
        `Продавец: ${seller.name}, ${seller.phone}\n\n` +
        `Проверить: ${baseUrl}/admin/moderation`
    ).catch(() => {
      // Не блокируем создание заявки, если уведомление не отправилось.
    });
  }

  return NextResponse.json(
    {
      carId: car.id,
      message: "Заявка отправлена на проверку. Мы свяжемся с вами после модерации.",
    },
    { status: 201 }
  );
}
