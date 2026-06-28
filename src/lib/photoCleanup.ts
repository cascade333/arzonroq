import { unlink } from "fs/promises";
import path from "path";

/**
 * Удаляет физический файл с диска по его публичному URL (например,
 * "/uploads/cars/abc.webp"). Не выбрасывает ошибку, если файла уже нет —
 * просто логирует и продолжает (важно при архивации, чтобы один
 * отсутствующий файл не блокировал удаление остальных).
 */
async function deleteUploadedFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith("/uploads/")) return;

  const filePath = path.join(process.cwd(), "public", url);
  try {
    await unlink(filePath);
  } catch (err) {
    // ENOENT (файла нет) — это нормально, остальное логируем для диагностики.
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error(`Не удалось удалить файл ${filePath}:`, err);
    }
  }
}

/**
 * Удаляет с диска все фото авто (4 ракурса) и техпаспорта (2 стороны) —
 * вызывается при архивации объявления (см. ТЗ: "при удалении объявления
 * все фотки удаляются, места не занимают").
 */
export async function deleteCarPhotosFromDisk(car: {
  photoFrontUrl?: string | null;
  photoBackUrl?: string | null;
  photoLeftUrl?: string | null;
  photoRightUrl?: string | null;
  registrationDocFrontUrl?: string | null;
  registrationDocBackUrl?: string | null;
  images?: { imageUrl: string }[];
}): Promise<void> {
  const urls = [
    car.photoFrontUrl,
    car.photoBackUrl,
    car.photoLeftUrl,
    car.photoRightUrl,
    car.registrationDocFrontUrl,
    car.registrationDocBackUrl,
    ...(car.images?.map((img) => img.imageUrl) ?? []),
  ];

  // Удаляем дубликаты URL (CarImage и прямые поля часто указывают на одни
  // и те же файлы) — не пытаемся удалить один файл по два раза.
  const uniqueUrls = [...new Set(urls)];

  await Promise.all(uniqueUrls.map((url) => deleteUploadedFile(url)));
}
