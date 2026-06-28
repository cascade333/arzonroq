"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ModerationCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  region: string;
  price: number;
  registrationDocFrontUrl: string | null;
  registrationDocBackUrl: string | null;
  photoFrontUrl: string | null;
  photoBackUrl: string | null;
  photoLeftUrl: string | null;
  photoRightUrl: string | null;
  isDamaged: boolean;
  damageDescription: string | null;
  description: string | null;
  createdAt: Date;
  seller: { name: string; phone: string };
}

export default function ModerationCard({ car }: { car: ModerationCar }) {
  const router = useRouter();
  const [vin, setVin] = useState("");
  const [marketPrice, setMarketPrice] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");

  async function handleApprove() {
    if (!vin.trim()) {
      setError("Укажите VIN-код, прочитанный с фото техпаспорта");
      return;
    }
    setError("");
    setLoading("approve");
    const res = await fetch(`/api/admin/cars/${car.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vin: vin.trim().toUpperCase(),
        marketReferencePrice: marketPrice ? Number(marketPrice) : undefined,
      }),
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Не удалось одобрить заявку");
      return;
    }
    router.refresh();
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      setError("Укажите причину отклонения");
      return;
    }
    setError("");
    setLoading("reject");
    const res = await fetch(`/api/admin/cars/${car.id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: rejectReason,
        marketReferencePrice: marketPrice ? Number(marketPrice) : undefined,
      }),
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Не удалось отклонить заявку");
      return;
    }
    router.refresh();
  }

  const priceIsHigh = marketPrice && car.price > Number(marketPrice);

  const carPhotos = [
    { label: "Спереди", url: car.photoFrontUrl },
    { label: "Сзади", url: car.photoBackUrl },
    { label: "Левый бок", url: car.photoLeftUrl },
    { label: "Правый бок", url: car.photoRightUrl },
  ];

  const docPhotos = [
    { label: "Техпаспорт (перед)", url: car.registrationDocFrontUrl },
    { label: "Техпаспорт (зад)", url: car.registrationDocBackUrl },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">
            {car.brand} {car.model} {car.year}
          </h3>
          <p className="text-sm text-slate-500">
            {car.seller.name} · {car.seller.phone} · {car.region}
          </p>
        </div>
        <div className="text-lg font-bold text-[#2E8B2E]">
          ${car.price.toLocaleString("en-US")}
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 p-3">
        <label className="text-sm text-slate-600">
          VIN-код (прочитайте на фото техпаспорта ниже)
          <input
            value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
            placeholder="JHMFA16586S000000"
            maxLength={17}
            className="form-input-vin mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono uppercase outline-none focus:border-[#2E8B2E]"
          />
        </label>
        <p className="mt-1 text-xs text-slate-500">
          Обязателен для одобрения — нужен для проверки на дубликаты
          (та же машина не может быть выставлена дважды).
        </p>
      </div>

      {car.isDamaged ? (
        <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          ⚠️ Продавец указал, что авто было в аварии: {car.damageDescription}
        </div>
      ) : (
        <div className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          ✅ Продавец указал, что авто не было в аварии
        </div>
      )}

      <div className="mt-3">
        <p className="text-xs font-medium text-slate-500">Техпаспорт</p>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {docPhotos.map((doc) => (
            <div key={doc.label}>
              {doc.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doc.url}
                  alt={doc.label}
                  className="h-28 w-full rounded-lg border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-xs text-red-500">
                  Не загружено
                </div>
              )}
              <p className="mt-1 text-center text-xs text-slate-500">{doc.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium text-slate-500">Фото автомобиля</p>
        <div className="mt-1 grid grid-cols-4 gap-2">
          {carPhotos.map((photo) => (
            <div key={photo.label}>
              {photo.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.url}
                  alt={photo.label}
                  className="h-20 w-full rounded-lg border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-20 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-[10px] text-red-500">
                  Нет фото
                </div>
              )}
              <p className="mt-1 text-center text-[11px] text-slate-500">{photo.label}</p>
            </div>
          ))}
        </div>
      </div>

      {car.description && (
        <p className="mt-3 text-sm text-slate-600">{car.description}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
        <div>Пробег: {car.mileage.toLocaleString("ru-RU")} км</div>
        <div>Подана: {new Date(car.createdAt).toLocaleString("ru-RU")}</div>
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-3">
        <label className="text-sm text-slate-600">
          Рыночная цена с других досок (OLX, Avto.uz) — для сверки
          <input
            type="number"
            value={marketPrice}
            onChange={(e) => setMarketPrice(e.target.value)}
            placeholder="Например, 13800"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#2E8B2E]"
          />
        </label>
        {priceIsHigh && (
          <p className="mt-1.5 text-sm text-amber-600">
            ⚠️ Цена продавца (${car.price.toLocaleString("en-US")}) выше указанной рыночной.
          </p>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {showRejectForm ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Причина отклонения (увидит продавец)"
            rows={2}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2E8B2E]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={loading !== null}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {loading === "reject" ? "Отклоняем..." : "Подтвердить отклонение"}
            </button>
            <button
              onClick={() => setShowRejectForm(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleApprove}
            disabled={loading !== null}
            className="rounded-lg bg-[#2E8B2E] px-4 py-2 text-sm font-medium text-white hover:bg-[#267326] disabled:opacity-60"
          >
            {loading === "approve" ? "Публикуем..." : "✅ Одобрить и опубликовать"}
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={loading !== null}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            ❌ Отклонить
          </button>
        </div>
      )}
    </div>
  );
}
