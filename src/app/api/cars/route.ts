import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listVisibleCars } from "@/lib/carRepository";
import { requireAdmin } from "@/lib/adminAuth";
import { sendTelegramMessage } from "@/lib/telegram";

/**
 * GET /api/cars?brand=&model=&yearFrom=&mileageMax=&region=&page=
 * Публичный список авто. Только AVAILABLE, сортировка по цене (ТЗ п.3-5),
 * пагинация по 30 штук на страницу.
 * Возвращает данные в формате фронтенда (русские лейблы коробки/топлива/статуса).
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const result = await listVisibleCars({
    brand: params.get("brand") || undefined,
    model: params.get("model") || undefined,
    yearFrom: params.get("yearFrom") ? Number(params.get("yearFrom")) : undefined,
    mileageMax: params.get("mileageMax") ? Number(params.get("mileageMax")) : undefined,
    region: params.get("region") || undefined,
    page: params.get("page") ? Number(params.get("page")) : undefined,
  });

  return NextResponse.json(result);
}

/**
 * POST /api/cars
 * Создаёт новое авто (только админка — ТЗ п.9 "Добавить авто").
 * При создании автоматически уведомляет продавца в Telegram, если у него
 * привязан telegramId (ТЗ п.8).
 */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const required = ["brand", "model", "year", "mileage", "region", "price", "transmission", "fuelType", "sellerId"];
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return NextResponse.json(
        { error: `Поле "${field}" обязательно` },
        { status: 400 }
      );
    }
  }

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
      description: body.description ?? null,
      sellerId: body.sellerId,
      images: body.images
        ? {
            create: body.images.map((url: string, i: number) => ({
              imageUrl: url,
              position: i,
            })),
          }
        : undefined,
    },
    include: { seller: true, images: true },
  });

  if (car.seller.telegramId) {
    await sendTelegramMessage(
      car.seller.telegramId,
      `Ваш автомобиль <b>${car.brand} ${car.model} ${car.year}</b> добавлен на Eng-arzon.uz`,
      [
        [
          { text: "Да, актуально", callback_data: `keep_${car.id}` },
          { text: "Продано", callback_data: `sold_${car.id}` },
        ],
        [{ text: "Снять с продажи", callback_data: `delist_${car.id}` }],
      ]
    );
  }

  return NextResponse.json({ car }, { status: 201 });
}
