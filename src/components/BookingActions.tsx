"use client";

import { Phone } from "lucide-react";
import { Car } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/I18nProvider";

export default function BookingActions({ car }: { car: Car }) {
  const { t } = useTranslation();

  function handleCallClick() {
    // Регистрируем уникальный контакт в фоне — не блокируем сам звонок.
    // Если посетитель уже звонил по этому авто ранее, повторно не считается.
    fetch(`/api/cars/${car.id}/contact`, { method: "POST" }).catch(() => {
      // Тихо игнорируем сетевые ошибки — звонок важнее счётчика.
    });
  }

  return (
    <a
      href={`tel:${car.sellerPhone}`}
      onClick={handleCallClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E8B2E] py-3 font-medium text-white transition-colors hover:bg-[#267326]"
    >
      <Phone className="h-4 w-4" />
      {t("carDetail.call")}
    </a>
  );
}
