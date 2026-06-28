"use client";

import { BRANDS, MODELS_BY_BRAND, REGIONS } from "@/lib/types";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/I18nProvider";

export interface FilterState {
  brand: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  mileageMax: number;
  region: string;
}

// Внутренние сентинел-значения для "не выбрано" — всегда одинаковые,
// независимо от языка интерфейса (иначе смена языка сломает сравнения
// в стейте). Видимый текст этих опций берётся из словаря через t().
export const ALL_BRANDS = "__ALL_BRANDS__";
export const ALL_MODELS = "__ALL_MODELS__";
export const ALL_YEARS = "__ALL_YEARS__";
export const ALL_MILEAGE = "__ALL_MILEAGE__";

const YEAR_OPTIONS = Array.from({ length: 30 }, (_, i) => 2026 - i);
const MILEAGE_OPTIONS = [50000, 100000, 150000, 200000, 500000];

function Select({
  label,
  value,
  displayValue,
  onChange,
  options,
}: {
  label: string;
  value: string;
  displayValue: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 transition-colors hover:border-slate-300 has-[select:focus]:border-[#2E8B2E]">
      <span className="block text-xs text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="truncate font-medium text-slate-900">{displayValue}</span>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
      </div>
      {/* select растянут на весь блок и прозрачен — кликабельна вся área, не только текст */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
        aria-label={label}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function FilterBar({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}) {
  const { t, tRegion } = useTranslation();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [brands, setBrands] = useState<string[]>([...BRANDS]);
  const [modelsByBrand, setModelsByBrand] = useState<Record<string, string[]>>(
    MODELS_BY_BRAND
  );

  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => {
        if (data.modelsByBrand) setModelsByBrand(data.modelsByBrand);
        if (data.brands) setBrands(data.brands);
      })
      .catch(() => {
        // Остаёмся со встроенным статическим списком при сбое запроса.
      });
  }, []);

  const models =
    filters.brand === ALL_BRANDS ? [] : modelsByBrand[filters.brand] ?? [];

  const brandOptions = [
    { value: ALL_BRANDS, label: t("filters.allBrands") },
    ...brands.map((b) => ({ value: b, label: b })),
  ];
  const modelOptions = [
    { value: ALL_MODELS, label: t("filters.allModels") },
    ...models.map((m) => ({ value: m, label: m })),
  ];

  function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    onChange({ ...filters, [key]: value });
  }

  function handleBrandChange(v: string) {
    onChange({ ...filters, brand: v, model: ALL_MODELS });
  }

  function handleYearChange(v: string) {
    set("yearFrom", v === ALL_YEARS ? 0 : Number(v));
  }

  const yearValue = filters.yearFrom === 0 ? ALL_YEARS : String(filters.yearFrom);
  const yearOptions = [
    { value: ALL_YEARS, label: t("filters.anyYear") },
    ...YEAR_OPTIONS.map((y) => ({ value: String(y), label: String(y) })),
  ];

  const mileageKey = (m: number) => `mileage_${m}`;
  const mileageLabel = (m: number) => `0 - ${m.toLocaleString("ru-RU")} км`;
  const mileageValue =
    filters.mileageMax === 0 ? ALL_MILEAGE : mileageKey(filters.mileageMax);
  const mileageOptions = [
    { value: ALL_MILEAGE, label: t("filters.anyMileage") },
    ...MILEAGE_OPTIONS.map((m) => ({ value: mileageKey(m), label: mileageLabel(m) })),
  ];

  function handleMileageSelect(v: string) {
    if (v === ALL_MILEAGE) {
      set("mileageMax", 0);
      return;
    }
    const match = MILEAGE_OPTIONS.find((m) => mileageKey(m) === v);
    set("mileageMax", match ?? 0);
  }

  const regionOptions = (REGIONS as unknown as string[]).map((r) => ({
    value: r,
    label: tRegion(r),
  }));

  function findLabel(options: { value: string; label: string }[], value: string): string {
    return options.find((o) => o.value === value)?.label ?? value;
  }

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        {/* Desktop: full row */}
        <div className="hidden items-stretch gap-3 lg:flex">
          <Select
            label={t("filters.brand")}
            value={filters.brand}
            displayValue={findLabel(brandOptions, filters.brand)}
            onChange={handleBrandChange}
            options={brandOptions}
          />
          <Select
            label={t("filters.model")}
            value={filters.model}
            displayValue={findLabel(modelOptions, filters.model)}
            onChange={(v) => set("model", v)}
            options={modelOptions}
          />
          <Select
            label={t("filters.year")}
            value={yearValue}
            displayValue={findLabel(yearOptions, yearValue)}
            onChange={handleYearChange}
            options={yearOptions}
          />
          <Select
            label={t("filters.mileage")}
            value={mileageValue}
            displayValue={findLabel(mileageOptions, mileageValue)}
            onChange={handleMileageSelect}
            options={mileageOptions}
          />
          <Select
            label={t("filters.region")}
            value={filters.region}
            displayValue={findLabel(regionOptions, filters.region)}
            onChange={(v) => set("region", v)}
            options={regionOptions}
          />
          <button className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-[#2E8B2E] px-6 font-medium text-white transition-colors hover:bg-[#267326]">
            <Search className="h-4 w-4" />
            {t("filters.search")}
          </button>
        </div>

        {/* Mobile / tablet: compact grid + filter icon */}
        <div className="flex items-stretch gap-2 lg:hidden">
          <div className="grid flex-1 grid-cols-2 gap-2">
            <Select
              label={t("filters.brand")}
              value={filters.brand}
              displayValue={findLabel(brandOptions, filters.brand)}
              onChange={handleBrandChange}
              options={brandOptions}
            />
            <Select
              label={t("filters.model")}
              value={filters.model}
              displayValue={findLabel(modelOptions, filters.model)}
              onChange={(v) => set("model", v)}
              options={modelOptions}
            />
          </div>
          <button
            onClick={() => setShowMobileFilters((s) => !s)}
            className="flex flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5"
            aria-label={t("filters.moreFilters")}
          >
            <SlidersHorizontal className="h-5 w-5 text-slate-700" />
          </button>
        </div>

        {showMobileFilters && (
          <div className="mt-2 grid grid-cols-2 gap-2 lg:hidden">
            <Select
              label={t("filters.year")}
              value={yearValue}
              displayValue={findLabel(yearOptions, yearValue)}
              onChange={handleYearChange}
              options={yearOptions}
            />
            <Select
              label={t("filters.mileage")}
              value={mileageValue}
              displayValue={findLabel(mileageOptions, mileageValue)}
              onChange={handleMileageSelect}
              options={mileageOptions}
            />
            <div className="col-span-2">
              <Select
                label={t("filters.region")}
                value={filters.region}
                displayValue={findLabel(regionOptions, filters.region)}
                onChange={(v) => set("region", v)}
                options={regionOptions}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
