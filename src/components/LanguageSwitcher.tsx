"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import { LOCALE_LABELS, Locale } from "@/lib/i18n/dictionaries";

const LOCALES: Locale[] = ["uz", "ru"];
const SHORT_CODE: Record<Locale, string> = { uz: "UZ", ru: "RU", en: "EN" };

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-50 sm:px-2.5"
        aria-label="Тилни танлаш / Выбор языка / Select language"
      >
        <Globe className="h-3.5 w-3.5 flex-shrink-0" />
        {SHORT_CODE[locale]}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-md">
            {LOCALES.map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 ${
                  l === locale ? "font-semibold text-[#2E8B2E]" : "text-slate-700"
                }`}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
