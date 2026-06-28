import { NextRequest, NextResponse } from "next/server";
import { mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { isRateLimited } from "@/lib/rateLimit";

const PHOTO_DIR = path.join(process.cwd(), "public", "uploads", "cars");
const DOC_DIR = path.join(process.cwd(), "public", "uploads", "docs");

const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 МБ
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Заявка требует максимум 6 фото (2 техпаспорт + 4 авто) — лимит с запасом
// на повторные попытки/ошибки, но достаточно строгий против автоспама.
const UPLOAD_LIMIT = 20;
const UPLOAD_WINDOW_MS = 10 * 60 * 1000; // 10 минут

/**
 * POST /api/sell/upload
 * Публичный (без авторизации) роут загрузки фото для формы самоподачи
 * продавца: техпаспорт (перед/зад) и фото авто по фиксированным ракурсам.
 *
 * kind: "photo" | "doc" — определяет папку назначения.
 * Все фото сжимаются через sharp в WebP для экономии места на диске.
 */
export async function POST(req: NextRequest) {
  if (isRateLimited(req, "sell-upload", UPLOAD_LIMIT, UPLOAD_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Слишком много загрузок. Попробуйте через несколько минут." },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const kind = formData.get("kind");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
  }

  if (kind !== "photo" && kind !== "doc") {
    return NextResponse.json(
      { error: "Не указан тип файла (kind: photo | doc)" },
      { status: 400 }
    );
  }

  if (!PHOTO_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Поддерживаются только JPEG, PNG и WebP" },
      { status: 400 }
    );
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return NextResponse.json(
      { error: "Файл слишком большой (макс. 10 МБ)" },
      { status: 400 }
    );
  }

  const dir = kind === "doc" ? DOC_DIR : PHOTO_DIR;
  const urlPrefix = kind === "doc" ? "/uploads/docs" : "/uploads/cars";
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.webp`;

  try {
    await sharp(buffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(dir, filename));
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
  return NextResponse.json({ url: `${base}${urlPrefix}/${filename}` });
}

export const runtime = "nodejs";
