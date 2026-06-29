import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["ru"] as const; // uz — без префикса (основной язык)
const DEFAULT_LOCALE = "uz";

/**
 * Маршрутизация по языку через URL (важно для SEO — у каждого языка
 * своя индексируемая страница, а не один URL с переключением через
 * cookie/JS, которое поисковики не видят как отдельный контент):
 *
 * - eng-arzon.uz/...      → узбекский (без префикса, как основной язык)
 * - eng-arzon.uz/ru/...   → русский
 *
 * /admin/* и /api/* не локализуются — это служебные разделы.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/llms.txt" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const pathnameLocale = LOCALES.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameLocale) {
    const rest = pathname.slice(`/${pathnameLocale}`.length) || "/";
    const url = req.nextUrl.clone();
    url.pathname = `/${pathnameLocale}${rest}`;
    return NextResponse.rewrite(url);
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|api|admin|uploads|favicon.ico|robots.txt|sitemap.xml|llms.txt).*)"],
};
