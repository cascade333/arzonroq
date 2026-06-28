"use client";

import Link from "next/link";
import { useTranslation, useLocalizedPath } from "@/lib/i18n/I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:py-5 sm:px-6">
        <Link href={localizedPath("/")} className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
            ENG <span className="text-[#2E8B2E]">ARZON</span>
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            {t("header.tagline")}
          </p>
        </Link>
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <Link
            href={localizedPath("/sell")}
            className="whitespace-nowrap rounded-xl bg-[#2E8B2E] px-3 py-2 text-sm font-medium text-white hover:bg-[#267326] sm:px-4 sm:py-2.5"
          >
            {t("header.sell")}
          </Link>
        </div>
      </div>
    </header>
  );
}
