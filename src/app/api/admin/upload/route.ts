import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "cars");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * POST /api/admin/upload
 * Принимает multipart/form-data с полем "file", сжимает изображение
 * (макс. ширина 1600px, конвертация в webp ~ -60% размера, как делалось
 * для changan.co.uz) и сохраняет на диск VPS. Возвращает публичный URL.
 */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Поддерживаются только JPEG, PNG и WebP" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Файл слишком большой (макс. 10 МБ)" },
      { status: 400 }
    );
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.webp`;
  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    await sharp(buffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(filePath);
  } catch (err) {
    console.error("Ошибка обработки изображения:", err);
    return NextResponse.json(
      { error: "Не удалось обработать изображение" },
      { status: 500 }
    );
  }

  // UPLOADS_BASE_URL нужен временно, пока /uploads раздаётся Nginx'ом на
  // отдельном порту (см. README) — после настройки домена с единым портом
  // эту переменную можно оставить пустой, и пути снова станут относительными.
  const base = process.env.UPLOADS_BASE_URL ?? "";
  return NextResponse.json({ url: `${base}/uploads/cars/${filename}` });
}

// Next.js по умолчанию ограничивает размер тела запроса для App Router —
// для multipart/form-data с фото эту настройку нужно поднять в next.config.ts
export const runtime = "nodejs";
