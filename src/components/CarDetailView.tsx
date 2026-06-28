"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CarGallery from "@/components/CarGallery";
import BookingActions from "@/components/BookingActions";
import { Car } from "@/lib/types";
import { useTranslation, useLocalizedPath } from "@/lib/i18n/I18nProvider";

function formatPrice(price: number): string {
  return `${price.toLocaleString("en-US")} у.е.`;
}

export default function CarDetailView({ car }: { car: Car }) {
  const { t, tRegion, tTransmission, tFuel } = useTranslation();
  const localizedPath = useLocalizedPath();

  const statusLabels: Record<string, string> = {
    pending_verification: t("carDetail.statusPending"),
    available: t("carDetail.statusAvailable"),
    sold: t("carDetail.statusSold"),
    delisted: t("carDetail.statusDelisted"),
    rejected: t("carDetail.statusRejected"),
  };

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

      <main className="mx-auto max-w-3xl px-4 pb-28 sm:px-6 sm:pb-10">
        <CarGallery
          images={car.images.length > 0 ? car.images : ["/cars/placeholder.jpg"]}
          label={`${car.brand} ${car.model}`}
        />

        <div className="mt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {car.brand} {car.model}
                </h1>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-sm text-slate-600">
                  {car.year}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{tRegion(car.region)}</p>
            </div>
            <div className="text-2xl font-bold text-[#2E8B2E] sm:text-3xl">
              {formatPrice(car.price)}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
            <Spec
              label={t("carDetail.mileage")}
              value={`${car.mileage.toLocaleString("ru-RU")} ${t("units.km")}`}
            />
            <Spec label={t("carDetail.transmission")} value={tTransmission(car.transmission)} />
            <Spec label={t("carDetail.fuel")} value={tFuel(car.fuelType)} />
            <Spec
              label={t("carDetail.status")}
              value={statusLabels[car.status]}
              valueClassName="text-[#2E8B2E]"
            />
          </div>

          {car.isDamaged ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-medium text-amber-700">
                🔧 {t("carDetail.damaged")}
              </p>
              {car.damageDescription && (
                <p className="mt-1 text-sm text-amber-700">{car.damageDescription}</p>
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm font-medium text-green-700">
                ✅ {t("carDetail.notDamaged")}
              </p>
            </div>
          )}

          {car.description && (
            <div className="mt-5">
              <h2 className="font-semibold text-slate-900">
                {t("carDetail.description")}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {car.description}
              </p>
            </div>
          )}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-4 sm:static sm:mx-auto sm:max-w-3xl sm:border-none sm:bg-transparent sm:px-6 sm:pb-10 sm:pt-0">
        <div className="mx-auto max-w-3xl sm:px-0">
          <BookingActions car={car} />
        </div>
      </div>
    </div>
  );
}

function Spec({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-0.5 font-medium text-slate-900 ${valueClassName ?? ""}`}>
        {value}
      </div>
    </div>
  );
}
