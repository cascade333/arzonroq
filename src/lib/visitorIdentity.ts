import { NextRequest } from "next/server";
import { createHash, randomUUID } from "crypto";

export const VISITOR_COOKIE_NAME = "arzonroq_vid";

/**
 * Определяет реальный IP клиента, учитывая типичные заголовки прокси
 * (Nginx обычно прокидывает X-Forwarded-For).
 */
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Строит стабильный хэш "посетителя" из связки IP + анонимного cookie.
 * Используется, чтобы считать уникальные контакты по кнопке "Bog'lanish" —
 * один и тот же человек (тот же IP + тот же cookie) не считается повторно,
 * даже если нажмёт кнопку несколько раз.
 *
 * Возвращает hash и cookie-значение, которое нужно установить в ответе,
 * если его не было (новый посетитель).
 */
export function getVisitorIdentity(req: NextRequest): {
  hash: string;
  cookieValue: string;
  isNewCookie: boolean;
} {
  const ip = getClientIp(req);
  const existingCookie = req.cookies.get(VISITOR_COOKIE_NAME)?.value;
  const cookieValue = existingCookie ?? randomUUID();

  const hash = createHash("sha256").update(`${ip}:${cookieValue}`).digest("hex");

  return {
    hash,
    cookieValue,
    isNewCookie: !existingCookie,
  };
}
