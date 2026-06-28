import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

/** GET /api/cars/:id — публичная карточка авто. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const car = await prisma.car.findUnique({
    where: { id },
    include: { images: true, seller: true },
  });

  if (!car) {
    return NextResponse.json({ error: "Автомобиль не найден" }, { status: 404 });
  }
  return NextResponse.json({ car });
}

/**
 * PATCH /api/cars/:id
 * Редактирование авто из админки: цена, статус, поля, фото (ТЗ п.9).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const allowedFields = [
    "brand",
    "model",
    "year",
    "mileage",
    "region",
    "price",
    "transmission",
    "fuelType",
    "description",
    "status",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }

  try {
    const car = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.car.update({ where: { id }, data });

      // Если переданы images — полностью заменяем набор фото авто
      // (проще и надёжнее, чем считать diff между старым и новым списком).
      if (Array.isArray(body.images)) {
        await tx.carImage.deleteMany({ where: { carId: id } });
        if (body.images.length > 0) {
          await tx.carImage.createMany({
            data: body.images.map((url: string, i: number) => ({
              carId: id,
              imageUrl: url,
              position: i,
            })),
          });
        }
      }

      return updated;
    });

    return NextResponse.json({ car });
  } catch {
    return NextResponse.json({ error: "Автомобиль не найден" }, { status: 404 });
  }
}
