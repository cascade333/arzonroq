import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/price-hint?brand=Chevrolet&model=Cobalt
 *
 * Публичный (без авторизации) роут для формы /sell. Возвращает текущую
 * минимальную цену среди опубликованных авто (AVAILABLE) той же
 * марки и модели — просто честная информация о рынке на самом сайте,
 * без рекомендаций и диапазонов. Решение по цене — за продавцом.
 */
export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get("brand");
  const model = req.nextUrl.searchParams.get("model");

  if (!brand || !model) {
    return NextResponse.json({ error: "Укажите brand и model" }, { status: 400 });
  }

  const cheapest = await prisma.car.findFirst({
    where: {
      brand,
      model,
      status: "AVAILABLE",
    },
    orderBy: { price: "asc" },
    select: { price: true },
  });

  return NextResponse.json({
    lowestPrice: cheapest?.price ?? null,
  });
}
