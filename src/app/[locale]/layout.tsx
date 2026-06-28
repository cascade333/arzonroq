import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { Locale } from "@/lib/i18n/dictionaries";
import { notFound } from "next/navigation";

const VALID_LOCALES = ["uz", "ru"];

const META_BY_LOCALE: Record<string, { title: string; description: string }> = {
  uz: {
    title: "Eng Arzon — Arzon avtomobillar bozori",
    description:
      "Eng arzon avtomobillarni toping — arzon narxda, tekshirilgan e'lonlar. " +
      "VIP eʼlonlarsiz, pullik ko'tarishlarsiz — eng arzon narx doim birinchi.",
  },
  ru: {
    title: "Eng Arzon — Купить авто дешево в Узбекистане",
    description:
      "Купить авто, продажа авто с пробегом по самым низким ценам в Узбекистане. " +
      "Без VIP, без накруток — самая дешёвая цена всегда первая.",
  },
};

// Временно скрываем сайт от поисковых систем, если DISABLE_INDEXING=true
// в .env — удобно выключить индексацию на этапе тестов/доработки без
// правок кода, затем включить обратно (убрать переменную или поставить
// false) перед реальным запуском в поиске.
const disableIndexing = process.env.DISABLE_INDEXING === "true";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = META_BY_LOCALE[locale] ?? META_BY_LOCALE.uz;
  const baseUrl = "https://eng-arzon.uz";
  const path = locale === "ru" ? "/ru" : "";

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${baseUrl}${path}`,
      languages: {
        "uz-UZ": baseUrl,
        "ru-RU": `${baseUrl}/ru`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${baseUrl}${path}`,
      siteName: "Eng Arzon",
      locale: locale === "ru" ? "ru_RU" : "uz_UZ",
      type: "website",
    },
    ...(disableIndexing
      ? { robots: { index: false, follow: false, nocache: true } }
      : {}),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!VALID_LOCALES.includes(locale)) {
    notFound();
  }

  return <I18nProvider locale={locale as Locale}>{children}</I18nProvider>;
}
