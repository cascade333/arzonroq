import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "arzonroq_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 часов

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET не задан в .env");
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

/** Создаёт подписанный токен сессии для cookie. */
export function createSessionToken(adminId: string): string {
  const payload = `${adminId}.${Date.now() + SESSION_MAX_AGE_SECONDS * 1000}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function verifySessionToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [adminId, expiresAtStr, signature] = parts;
  const payload = `${adminId}.${expiresAtStr}`;
  const expected = sign(payload);

  if (expected.length !== signature.length) return null;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return null;
  }

  const expiresAt = Number(expiresAtStr);
  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) return null;

  return adminId;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;

/**
 * Проверяет сессию из cookies() в Server Component / Server Action контексте.
 * Возвращает adminId, если сессия валидна, иначе null.
 */
export function verifyAdminToken(token: string | undefined): string | null {
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Проверяет, что запрос пришёл от залогиненного админа.
 * Возвращает NextResponse с ошибкой 401, если нет — иначе null (доступ разрешён).
 */
export async function requireAdmin(
  req: NextRequest
): Promise<NextResponse | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }
  const adminId = verifySessionToken(token);
  if (!adminId) {
    return NextResponse.json({ error: "Сессия истекла, войдите снова" }, { status: 401 });
  }
  return null;
}
