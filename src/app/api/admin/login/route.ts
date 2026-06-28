import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_MAX_AGE,
} from "@/lib/adminAuth";
import { isRateLimited } from "@/lib/rateLimit";

// Защита от перебора пароля — реальный админ не делает больше 10 попыток
// логина за 15 минут даже с опечатками.
const LOGIN_ATTEMPT_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

/**
 * POST /api/admin/login
 * Простой логин по username/password для админки (ТЗ п.9).
 */
export async function POST(req: NextRequest) {
  if (isRateLimited(req, "admin-login", LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Слишком много попыток входа. Попробуйте через 15 минут." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.username || !body?.password) {
    return NextResponse.json(
      { error: "Укажите логин и пароль" },
      { status: 400 }
    );
  }

  const admin = await prisma.admin.findUnique({
    where: { username: body.username },
  });

  if (!admin) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }

  const valid = await compare(body.password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }

  const token = createSessionToken(admin.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: ADMIN_COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
