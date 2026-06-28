"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Car } from "@/lib/types";
import { useTranslation, useLocalizedPath } from "@/lib/i18n/I18nProvider";

export default function ArchivedCarView({ car }: { car: Car }) {
  const { t, tRegion, tTransmission } = useTranslation();
  const localizedPath = useLocalizedPath();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        <Link
          href={localizedPath("/")}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("carDetail.back")}
        </Link>
      </div>

      <main className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            {t("archived.inactive")}
          </span>

          <h1 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
            {car.brand} {car.model} {car.year}
          </h1>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-4">
            <div>
              <div className="text-xs text-slate-500">{t("archived.price")}</div>
              <div className="mt-0.5 font-medium text-slate-700">
                {car.price.toLocaleString("en-US")} у.е.
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">{t("archived.mileage")}</div>
              <div className="mt-0.5 font-medium text-slate-700">
                {car.mileage.toLocaleString("ru-RU")} {t("units.km")}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">{t("archived.region")}</div>
              <div className="mt-0.5 font-medium text-slate-700">{tRegion(car.region)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">{t("archived.transmission")}</div>
              <div className="mt-0.5 font-medium text-slate-700">
                {tTransmission(car.transmission)}
              </div>
            </div>
          </div>

          <p className="mt-5 text-sm text-slate-500">{t("archived.description")}</p>

          <Link
            href={localizedPath("/")}
            className="mt-5 inline-block rounded-xl bg-[#2E8B2E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#267326]"
          >
            {t("archived.seeOthers")}
          </Link>
        </div>
      </main>
    </div>
  );
}
