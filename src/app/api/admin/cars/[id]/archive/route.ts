import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { deleteCarPhotosFromDisk } from "@/lib/photoCleanup";

/**
 * POST /api/admin/cars/:id/archive
 * Архивирует объявление вместо полного удаления (ТЗ: "при удалении все
 * фото удаляются, но объявление попадает в архив для SEO").
 *
 * 1. Удаляет все физические файлы фото/техпаспорта с диска.
 * 2. Удаляет связанные записи CarImage из БД.
 * 3. Очищает все URL-поля фото на самой машине (NULL).
 * 4. Переводит статус в ARCHIVED — текстовые данные (марка/модель/год/
 *    цена/регион) остаются навсегда для индексации поисковиками.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;

  const car = await prisma.car.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!car) {
    return NextResponse.json({ error: "Автомобиль не найден" }, { status: 404 });
  }
  if (car.status === "ARCHIVED") {
    return NextResponse.json({ error: "Уже в архиве" }, { status: 409 });
  }

  await deleteCarPhotosFromDisk(car);

  await prisma.$transaction([
    prisma.carImage.deleteMany({ where: { carId: id } }),
    prisma.car.update({
      where: { id },
      data: {
        status: "ARCHIVED",
        photoFrontUrl: null,
        photoBackUrl: null,
        photoLeftUrl: null,
        photoRightUrl: null,
        registrationDocFrontUrl: null,
        registrationDocBackUrl: null,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
