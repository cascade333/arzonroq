import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

/** GET /api/admin/sellers — список продавцов (для выбора при добавлении авто). */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const sellers = await prisma.seller.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cars: true } } },
  });
  return NextResponse.json({ sellers });
}

/**
 * POST /api/admin/sellers
 * Создаёт продавца, опционально с привязкой Telegram ID (ТЗ п.9, "Привязать Telegram ID продавца").
 */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.phone) {
    return NextResponse.json(
      { error: "Укажите имя и телефон продавца" },
      { status: 400 }
    );
  }

  const seller = await prisma.seller.create({
    data: {
      name: body.name,
      phone: body.phone,
      telegramId: body.telegramId || null,
    },
  });

  return NextResponse.json({ seller }, { status: 201 });
}
