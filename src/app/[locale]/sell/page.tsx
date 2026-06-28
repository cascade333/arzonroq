"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { BRANDS, MODELS_BY_BRAND, REGIONS } from "@/lib/types";
import SinglePhotoSlot from "@/components/sell/SinglePhotoSlot";
import { useTranslation, useLocalizedPath } from "@/lib/i18n/I18nProvider";
import PhoneInput from "@/components/PhoneInput";

const TRANSMISSIONS = [
  { value: "AUTOMATIC", labelKey: "transmission.automatic" },
  { value: "MANUAL", labelKey: "transmission.manual" },
] as const;

const FUEL_TYPES = [
  { value: "PETROL", labelKey: "fuel.petrol" },
  { value: "DIESEL", labelKey: "fuel.diesel" },
  { value: "GAS", labelKey: "fuel.gas" },
  { value: "ELECTRIC", labelKey: "fuel.electric" },
  { value: "HYBRID", labelKey: "fuel.hybrid" },
] as const;

// Внутренние сентинелы для "своя марка/модель" — не зависят от языка интерфейса.
const CUSTOM_BRAND_OPTION = "__CUSTOM_BRAND__";
const CUSTOM_MODEL_OPTION = "__CUSTOM_MODEL__";

interface FormState {
  sellerName: string;
  sellerPhone: string;
  brand: string;
  customBrand: string;
  model: string;
  customModel: string;
  year: number;
  mileage: number;
  region: string;
  price: number;
  transmission: "AUTOMATIC" | "MANUAL";
  fuelType: "PETROL" | "DIESEL" | "GAS" | "ELECTRIC" | "HYBRID";
  description: string;
  isDamaged: boolean;
  agreedToTerms: boolean;
  damageDescription: string;
  registrationDocFrontUrl: string;
  registrationDocBackUrl: string;
  photoFrontUrl: string;
  photoBackUrl: string;
  photoLeftUrl: string;
  photoRightUrl: string;
}

const INITIAL: FormState = {
  sellerName: "",
  sellerPhone: "+998",
  brand: BRANDS[0],
  customBrand: "",
  model: MODELS_BY_BRAND[BRANDS[0]][0],
  customModel: "",
  year: new Date().getFullYear(),
  mileage: 0,
  region: "Ташкент",
  price: 0,
  transmission: "AUTOMATIC",
  fuelType: "PETROL",
  description: "",
  isDamaged: false,
  agreedToTerms: false,
  damageDescription: "",
  registrationDocFrontUrl: "",
  registrationDocBackUrl: "",
  photoFrontUrl: "",
  photoBackUrl: "",
  photoLeftUrl: "",
  photoRightUrl: "",
};

export default function SellPage() {
  const { t, tRegion } = useTranslation();
  const localizedPath = useLocalizedPath();
  const [values, setValues] = useState<FormState>(INITIAL);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lowestPrice, setLowestPrice] = useState<number | null>(null);
  const [modelsByBrand, setModelsByBrand] = useState<Record<string, string[]>>(
    MODELS_BY_BRAND
  );

  // Подгружаем объединённый список марок/моделей (встроенный + одобренные
  // менеджером "свои модели" от других продавцов) — чтобы со временем
  // справочник расширялся сам, без правок кода.
  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => {
        if (data.modelsByBrand) setModelsByBrand(data.modelsByBrand);
      })
      .catch(() => {
        // Если запрос не удался — остаёмся со встроенным статическим списком.
      });
  }, []);

  const effectiveBrand =
    values.brand === CUSTOM_BRAND_OPTION ? values.customBrand.trim() : values.brand;
  const effectiveModel =
    values.model === CUSTOM_MODEL_OPTION ? values.customModel.trim() : values.model;

  // Подсказка о текущей минимальной цене на сайте для выбранной марки+модели —
  // просто информация, без давления и диапазонов (продавец сам решает цену).
  useEffect(() => {
    if (!effectiveModel || !effectiveBrand) {
      setLowestPrice(null);
      return;
    }

    let cancelled = false;
    const params = new URLSearchParams({ brand: effectiveBrand, model: effectiveModel });

    fetch(`/api/price-hint?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setLowestPrice(data.lowestPrice ?? null);
      })
      .catch(() => {
        if (!cancelled) setLowestPrice(null);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveBrand, effectiveModel]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!values.price || values.price <= 0) {
      setError(t("errors.priceRequired"));
      return;
    }
    if (!values.registrationDocFrontUrl || !values.registrationDocBackUrl) {
      setError(t("errors.docsRequired"));
      return;
    }
    if (
      !values.photoFrontUrl ||
      !values.photoBackUrl ||
      !values.photoLeftUrl ||
      !values.photoRightUrl
    ) {
      setError(t("errors.photosRequired"));
      return;
    }
    if (values.brand === CUSTOM_BRAND_OPTION && !values.customBrand.trim()) {
      setError(t("errors.customBrandRequired"));
      return;
    }
    if (values.model === CUSTOM_MODEL_OPTION && !values.customModel.trim()) {
      setError(t("errors.customModelRequired"));
      return;
    }
    if (values.isDamaged && !values.damageDescription.trim()) {
      setError(t("errors.damageDescriptionRequired"));
      return;
    }
    if (!values.agreedToTerms) {
      setError(t("errors.termsRequired"));
      return;
    }

    setLoading(true);
    const res = await fetch("/api/sell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, brand: effectiveBrand, model: effectiveModel }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || t("errors.submitFailed"));
      return;
    }

    setSubmitted(true);
  }

  const models = modelsByBrand[values.brand] ?? [];

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
        <div className="max-w-sm text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[#2E8B2E]" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            {t("sell.successTitle")}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {t("sell.successText", { phone: values.sellerPhone })}
          </p>
          <Link
            href={localizedPath("/")}
            className="mt-5 inline-block rounded-xl bg-[#2E8B2E] px-5 py-2.5 font-medium text-white hover:bg-[#267326]"
          >
            {t("sell.backHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-xl px-4 py-4 sm:px-6">
        <Link
          href={localizedPath("/")}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("sell.backHome")}
        </Link>
      </div>

      <main className="mx-auto max-w-xl px-4 pb-16 sm:px-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          {t("sell.title")}
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">{t("sell.intro")}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <Section title={t("sell.section1")}>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("sell.name")}>
                <input
                  required
                  value={values.sellerName}
                  onChange={(e) => set("sellerName", e.target.value)}
                  className="form-input"
                  placeholder="Alisher"
                />
              </Field>
              <Field label={t("sell.phone")}>
                <PhoneInput
                  value={values.sellerPhone}
                  onChange={(v) => set("sellerPhone", v)}
                  className="mt-1"
                />
              </Field>
            </div>
          </Section>

          <Section title={t("sell.section2")}>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("sell.brand")}>
                <select
                  value={values.brand}
                  onChange={(e) => {
                    const newBrand = e.target.value;
                    set("brand", newBrand);
                    set("customBrand", "");
                    if (newBrand === CUSTOM_BRAND_OPTION) {
                      // Для незнакомой марки нет статического списка моделей —
                      // сразу переключаем поле модели в режим свободного ввода.
                      set("model", CUSTOM_MODEL_OPTION);
                    } else {
                      set("model", modelsByBrand[newBrand]?.[0] ?? "");
                    }
                    set("customModel", "");
                  }}
                  className="form-input"
                >
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value={CUSTOM_BRAND_OPTION}>
                    {t("filters.otherBrand")}
                  </option>
                </select>
                {values.brand === CUSTOM_BRAND_OPTION && (
                  <input
                    required
                    value={values.customBrand}
                    onChange={(e) => set("customBrand", e.target.value)}
                    placeholder={t("sell.customBrandInput")}
                    className="form-input mt-2"
                  />
                )}
              </Field>
              <Field label={t("sell.model")}>
                {values.brand === CUSTOM_BRAND_OPTION ? (
                  <input
                    required
                    value={values.customModel}
                    onChange={(e) => set("customModel", e.target.value)}
                    placeholder={t("sell.customModelInput")}
                    className="form-input"
                  />
                ) : (
                  <>
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
                      <option value={CUSTOM_MODEL_OPTION}>
                        {t("filters.otherModel")}
                      </option>
                    </select>
                    {values.model === CUSTOM_MODEL_OPTION && (
                      <input
                        required
                        value={values.customModel}
                        onChange={(e) => set("customModel", e.target.value)}
                        placeholder={t("sell.customModelInput")}
                        className="form-input mt-2"
                      />
                    )}
                  </>
                )}
              </Field>
              <Field label={t("sell.year")}>
                <input
                  type="number"
                  required
                  value={values.year}
                  onChange={(e) => set("year", Number(e.target.value))}
                  className="form-input"
                />
              </Field>
              <Field label={t("sell.mileage")}>
                <input
                  type="number"
                  required
                  value={values.mileage === 0 ? "" : values.mileage}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/^0+(?=\d)/, "");
                    set("mileage", raw === "" ? 0 : Number(raw));
                  }}
                  className="form-input"
                />
              </Field>
              <Field label={t("sell.region")}>
                <select
                  value={values.region}
                  onChange={(e) => set("region", e.target.value)}
                  className="form-input"
                >
                  {REGIONS.filter((r) => r !== "Весь Узбекистан").map((r) => (
                    <option key={r} value={r}>
                      {tRegion(r)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("sell.transmission")}>
                <select
                  value={values.transmission}
                  onChange={(e) =>
                    set("transmission", e.target.value as FormState["transmission"])
                  }
                  className="form-input"
                >
                  {TRANSMISSIONS.map((tr) => (
                    <option key={tr.value} value={tr.value}>
                      {t(tr.labelKey)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("sell.fuel")}>
                <select
                  value={values.fuelType}
                  onChange={(e) => set("fuelType", e.target.value as FormState["fuelType"])}
                  className="form-input"
                >
                  {FUEL_TYPES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {t(f.labelKey)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("sell.price")}>
                <input
                  type="number"
                  required
                  min={1}
                  value={values.price === 0 ? "" : values.price}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/^0+(?=\d)/, "");
                    set("price", raw === "" ? 0 : Number(raw));
                  }}
                  placeholder={t("sell.pricePlaceholder")}
                  className="form-input"
                />
              </Field>
            </div>

            {lowestPrice !== null && (
              <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                💡{" "}
                {t("sell.lowestPriceNotice", {
                  brand: effectiveBrand,
                  model: effectiveModel,
                  price: lowestPrice.toLocaleString("en-US"),
                })}
              </div>
            )}

            <p className="mt-2 text-xs text-slate-500">{t("sell.priceHint")}</p>

            <div className="mt-3">
              <p className="text-sm text-slate-600">{t("sell.damagedQuestion")}</p>
              <div className="mt-1.5 flex gap-2">
                <button
                  type="button"
                  onClick={() => set("isDamaged", false)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    !values.isDamaged
                      ? "border-[#2E8B2E] bg-green-50 text-[#2E8B2E]"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  {t("sell.notDamaged")}
                </button>
                <button
                  type="button"
                  onClick={() => set("isDamaged", true)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    values.isDamaged
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  {t("sell.wasDamaged")}
                </button>
              </div>
              {values.isDamaged && (
                <div className="mt-2">
                  <Field label={t("sell.damageDescription")}>
                    <textarea
                      required
                      rows={2}
                      value={values.damageDescription}
                      onChange={(e) => set("damageDescription", e.target.value)}
                      className="form-input"
                      placeholder={t("sell.damageDescriptionPlaceholder")}
                    />
                  </Field>
                </div>
              )}
            </div>

            <div className="mt-3">
              <Field label={t("sell.descriptionOptional")}>
                <textarea
                  rows={3}
                  value={values.description}
                  onChange={(e) => set("description", e.target.value)}
                  className="form-input"
                  placeholder={t("sell.descriptionPlaceholder")}
                />
              </Field>
            </div>
          </Section>

          <Section title={t("sell.section3")}>
            <p className="mb-2 text-xs text-slate-500">{t("sell.docsHint")}</p>
            <div className="grid grid-cols-2 gap-3">
              <SinglePhotoSlot
                label={t("sell.docFront")}
                value={values.registrationDocFrontUrl}
                onChange={(url) => set("registrationDocFrontUrl", url)}
              />
              <SinglePhotoSlot
                label={t("sell.docBack")}
                value={values.registrationDocBackUrl}
                onChange={(url) => set("registrationDocBackUrl", url)}
              />
            </div>
          </Section>

          <Section title={t("sell.section4")}>
            <p className="mb-2 text-xs text-slate-500">{t("sell.photosHint")}</p>
            <div className="grid grid-cols-2 gap-3">
              <SinglePhotoSlot
                label={t("sell.photoFront")}
                value={values.photoFrontUrl}
                onChange={(url) => set("photoFrontUrl", url)}
              />
              <SinglePhotoSlot
                label={t("sell.photoBack")}
                value={values.photoBackUrl}
                onChange={(url) => set("photoBackUrl", url)}
              />
              <SinglePhotoSlot
                label={t("sell.photoLeft")}
                value={values.photoLeftUrl}
                onChange={(url) => set("photoLeftUrl", url)}
              />
              <SinglePhotoSlot
                label={t("sell.photoRight")}
                value={values.photoRightUrl}
                onChange={(url) => set("photoRightUrl", url)}
              />
            </div>
          </Section>

          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={values.agreedToTerms}
              onChange={(e) => set("agreedToTerms", e.target.checked)}
              className="mt-0.5"
            />
            <span>
              {t("sell.agreeTermsPrefix")}{" "}
              <Link
                href={localizedPath("/terms")}
                target="_blank"
                className="text-[#2E8B2E] underline"
              >
                {t("sell.agreeTermsLink")}
              </Link>
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2E8B2E] py-3 font-medium text-white hover:bg-[#267326] disabled:opacity-60"
          >
            {loading ? t("sell.submitting") : t("sell.submit")}
          </button>
        </form>
      </main>

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
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-3 font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
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
