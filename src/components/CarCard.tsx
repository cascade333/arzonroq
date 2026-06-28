"use client";

import { Car } from "@/lib/types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslation, useLocalizedPath } from "@/lib/i18n/I18nProvider";

function formatPrice(price: number): string {
  return `${price.toLocaleString("en-US")} у.е.`;
}

function daysSince(iso: string): number {
  const created = new Date(iso);
  const now = new Date();
  const diff = Math.floor(
    (now.setHours(0, 0, 0, 0) - created.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );
  return diff;
}

export default function CarCard({ car }: { car: Car }) {
  const { t, tRegion, tTransmission, tFuel } = useTranslation();
  const localizedPath = useLocalizedPath();
  const days = daysSince(car.createdAt);
  const daysLabel =
    days === 0
      ? t("carCard.today")
      : days === 1
        ? t("carCard.yesterday")
        : t("carCard.daysAgo", { days });

  return (
    <Link
      href={localizedPath(`/cars/${car.id}`)}
      className="group flex items-stretch gap-4 border-b border-slate-200 py-4 px-4 -mx-4 transition-colors hover:bg-slate-50 sm:gap-5"
    >
      {/* Photo */}
      <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-24 sm:w-36">
        {car.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={car.images[0]}
            alt={`${car.brand} ${car.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400 sm:text-xs">
            {car.brand} {car.model}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-baseline gap-1.5 sm:gap-2">
            <h3 className="min-w-0 truncate font-semibold text-slate-900">
              {car.brand} {car.model}
            </h3>
            <span className="flex-shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
              {car.year}
            </span>
            {car.isDamaged && (
              <span className="flex-shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                {t("carCard.damaged")}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-slate-500">
            {car.mileage.toLocaleString("ru-RU")} {t("units.km")} ·{" "}
            {tTransmission(car.transmission)} · {tFuel(car.fuelType)}
          </p>
          <p className="mt-2 text-sm text-slate-500 sm:hidden">
            {tRegion(car.region)} · {daysLabel}
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <div className="text-right">
            <div className="text-lg font-bold text-[#2E8B2E] sm:text-xl">
              {formatPrice(car.price)}
            </div>
            <div className="hidden text-sm text-slate-500 sm:block">
              {tRegion(car.region)}
            </div>
            <div className="hidden text-sm text-slate-400 sm:block">
              {daysLabel}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400" />
        </div>
      </div>
    </Link>
  );
}
