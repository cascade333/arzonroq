import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { sendTelegramMessage } from "@/lib/telegram";

/**
 * POST /api/admin/cars/:id/reject
 * Менеджер отклоняет заявку (например, цена выше рыночной, VIN не виден
 * на видео, нечитаемый техпаспорт). Требует причину — она уходит продавцу.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.reason) {
    return NextResponse.json(
      { error: "Укажите причину отклонения для продавца" },
      { status: 400 }
    );
  }

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

  const updated = await prisma.car.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectionReason: body.reason,
      marketReferencePrice: body.marketReferencePrice
        ? Number(body.marketReferencePrice)
        : null,
      reviewedAt: new Date(),
      reviewedBy: body.reviewedBy ?? null,
    },
  });

  if (car.seller.telegramId) {
    await sendTelegramMessage(
      car.seller.telegramId,
      `❌ Заявка на <b>${car.brand} ${car.model} ${car.year}</b> отклонена.\n\nПричина: ${body.reason}`
    );
  }

  return NextResponse.json({ car: updated });
}
