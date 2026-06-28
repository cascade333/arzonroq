"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BRANDS, MODELS_BY_BRAND, REGIONS } from "@/lib/types";
import ImageUploader from "./ImageUploader";

export interface SellerOption {
  id: string;
  name: string;
  phone: string;
}

export interface CarFormValues {
  id?: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  region: string;
  price: number;
  transmission: "AUTOMATIC" | "MANUAL";
  fuelType: "PETROL" | "DIESEL" | "GAS" | "ELECTRIC" | "HYBRID";
  description: string;
  sellerId: string;
  status?: "PENDING_VERIFICATION" | "AVAILABLE" | "SOLD" | "DELISTED" | "REJECTED" | "ARCHIVED";
  images: string[];
}

const TRANSMISSIONS = [
  { value: "AUTOMATIC", label: "Автомат" },
  { value: "MANUAL", label: "Механика" },
] as const;

const FUEL_TYPES = [
  { value: "PETROL", label: "Бензин" },
  { value: "DIESEL", label: "Дизель" },
  { value: "GAS", label: "Газ" },
  { value: "ELECTRIC", label: "Электро" },
  { value: "HYBRID", label: "Гибрид" },
] as const;

const STATUSES = [
  { value: "PENDING_VERIFICATION", label: "На проверке" },
  { value: "AVAILABLE", label: "В продаже" },
  { value: "SOLD", label: "Продано" },
  { value: "DELISTED", label: "Снято с продажи" },
  { value: "REJECTED", label: "Отклонено" },
  { value: "ARCHIVED", label: "В архиве" },
] as const;

export default function CarForm({
  initial,
  sellers,
}: {
  initial?: Partial<CarFormValues>;
  sellers: SellerOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [values, setValues] = useState<CarFormValues>({
    brand: initial?.brand ?? BRANDS[0],
    model: initial?.model ?? MODELS_BY_BRAND[BRANDS[0]][0],
    year: initial?.year ?? new Date().getFullYear(),
    mileage: initial?.mileage ?? 0,
    region: initial?.region ?? "Ташкент",
    price: initial?.price ?? 0,
    transmission: initial?.transmission ?? "AUTOMATIC",
    fuelType: initial?.fuelType ?? "PETROL",
    description: initial?.description ?? "",
    sellerId: initial?.sellerId ?? sellers[0]?.id ?? "",
    status: initial?.status,
    images: initial?.images ?? [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof CarFormValues>(key: K, value: CarFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!values.sellerId) {
      setError("Сначала добавьте продавца на странице «Продавцы»");
      return;
    }

    setLoading(true);
    const url = isEdit ? `/api/cars/${initial!.id}` : "/api/cars";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Не удалось сохранить");
      return;
    }

    router.push("/admin/cars");
    router.refresh();
  }

  const models = MODELS_BY_BRAND[values.brand] ?? [];

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Марка">
          <select
            value={values.brand}
            onChange={(e) => {
              set("brand", e.target.value);
              set("model", MODELS_BY_BRAND[e.target.value]?.[0] ?? "");
            }}
            className="form-input"
          >
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Модель">
          <select
            value={values.model}
            onChange={(e) => set("model", e.target.value)}
            className="form-input"
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Год выпуска">
          <input
            type="number"
            required
            value={values.year}
            onChange={(e) => set("year", Number(e.target.value))}
            className="form-input"
          />
        </Field>
        <Field label="Пробег (км)">
          <input
            type="number"
            required
            value={values.mileage}
            onChange={(e) => set("mileage", Number(e.target.value))}
            className="form-input"
          />
        </Field>
        <Field label="Цена ($)">
          <input
            type="number"
            required
            min={1}
            value={values.price === 0 ? "" : values.price}
            onChange={(e) =>
              set("price", e.target.value === "" ? 0 : Number(e.target.value))
            }
            placeholder="Например, 12000"
            className="form-input"
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Регион">
          <select
            value={values.region}
            onChange={(e) => set("region", e.target.value)}
            className="form-input"
          >
            {REGIONS.filter((r) => r !== "Весь Узбекистан").map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Коробка">
          <select
            value={values.transmission}
            onChange={(e) => set("transmission", e.target.value as CarFormValues["transmission"])}
            className="form-input"
          >
            {TRANSMISSIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Топливо">
          <select
            value={values.fuelType}
            onChange={(e) => set("fuelType", e.target.value as CarFormValues["fuelType"])}
            className="form-input"
          >
            {FUEL_TYPES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Продавец">
        <select
          value={values.sellerId}
          onChange={(e) => set("sellerId", e.target.value)}
          className="form-input"
        >
          {sellers.length === 0 && <option value="">Нет продавцов</option>}
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.phone}
            </option>
          ))}
        </select>
      </Field>

      {isEdit && (
        <Field label="Статус">
          <select
            value={values.status}
            onChange={(e) => set("status", e.target.value as CarFormValues["status"])}
            className="form-input"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Фотографии">
        <div className="mt-1">
          <ImageUploader
            images={values.images}
            onChange={(urls) => set("images", urls)}
          />
        </div>
      </Field>

      <Field label="Описание">
        <textarea
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className="form-input"
          placeholder="Один владелец, без аварий..."
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#2E8B2E] px-5 py-2.5 font-medium text-white hover:bg-[#267326] disabled:opacity-60"
        >
          {loading ? "Сохраняем..." : isEdit ? "Сохранить изменения" : "Добавить авто"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/cars")}
          className="rounded-xl border border-slate-200 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        >
          Отмена
        </button>
      </div>

      <style jsx global>{`
        .form-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          margin-top: 0.25rem;
          outline: none;
        }
        .form-input:focus {
          border-color: #2e8b2e;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-slate-600">
      {label}
      {children}
    </label>
  );
}
