"use client";

import { createContext, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  DEFAULT_LOCALE,
  DICTS,
  Locale,
  REGION_TRANSLATIONS,
  TRANSMISSION_TRANSLATIONS,
  FUEL_TRANSLATIONS,
  translateValue,
} from "./dictionaries";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Переводит название региона/города (значение из БД на русском). */
  tRegion: (region: string) => string;
  /** Переводит значение коробки передач (значение из БД на русском). */
  tTransmission: (value: string) => string;
  /** Переводит значение типа топлива (значение из БД на русском). */
  tFuel: (value: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Локаль определяется через URL (/  → uz, /ru/... → ru) — это важно для
 * SEO: у каждого языка своя индексируемая страница, а не один URL с
 * переключением через cookie/JS, которое поисковики не видят как
 * отдельный контент. Сам провайдер получает locale как проп из
 * app/[locale]/layout.tsx (см. middleware.ts для логики роутинга).
 */
export function I18nProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Корневой <html> объявлен один раз в app/layout.tsx (App Router не
  // допускает повторный <html> во вложенных layouts) — поэтому атрибут
  // lang выставляем динамически на клиенте в зависимости от текущей
  // локали, полученной из URL через app/[locale]/layout.tsx.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Переключение языка — это навигация на другой URL, не запись cookie.
  // pathname здесь приходит уже без локального префикса (см. middleware,
  // который делает rewrite на /[locale]/..., а usePathname в Next.js
  // возвращает путь как он был запрошен браузером, с префиксом /ru —
  // поэтому вычисляем "путь без текущей локали" перед построением нового URL.
  function setLocale(next: Locale) {
    const currentPrefix = locale === "ru" ? "/ru" : "";
    const pathWithoutLocale = currentPrefix && pathname.startsWith(currentPrefix)
      ? pathname.slice(currentPrefix.length) || "/"
      : pathname;

    const nextPrefix = next === "ru" ? "/ru" : "";
    const nextPath = `${nextPrefix}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}` || "/";

    router.push(nextPath || "/");
  }

  function t(key: string, vars?: Record<string, string | number>): string {
    const dict = DICTS[locale];
    let text = dict[key] ?? DICTS[DEFAULT_LOCALE][key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }

  function tRegion(region: string): string {
    return translateValue(REGION_TRANSLATIONS, region, locale);
  }

  function tTransmission(value: string): string {
    return translateValue(TRANSMISSION_TRANSLATIONS, value, locale);
  }

  function tFuel(value: string): string {
    return translateValue(FUEL_TRANSLATIONS, value, locale);
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, tRegion, tTransmission, tFuel }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation должен использоваться внутри I18nProvider");
  }
  return ctx;
}

/**
 * Строит путь с учётом текущей локали — добавляет префикс /ru, если
 * активен русский язык. Используется во всех внутренних <Link href={...}>,
 * чтобы переходы между страницами сохраняли выбранный язык (а не
 * сбрасывали на узбекский при каждом клике).
 */
export function useLocalizedPath() {
  const { locale } = useTranslation();
  return function localizedPath(path: string): string {
    if (locale !== "ru") return path;
    return path === "/" ? "/ru" : `/ru${path}`;
  };
}
