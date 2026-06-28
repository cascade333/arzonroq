"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FilterBar, { FilterState, ALL_BRANDS, ALL_MODELS } from "@/components/FilterBar";
import CarCard from "@/components/CarCard";
import Pagination from "@/components/Pagination";
import SeoTextBlock from "@/components/SeoTextBlock";
import { Car } from "@/lib/types";
import { ArrowUpDown } from "lucide-react";
import { useTranslation } from "@/lib/i18n/I18nProvider";

const DEFAULT_FILTERS: FilterState = {
  brand: ALL_BRANDS,
  model: ALL_MODELS,
  yearFrom: 0,
  yearTo: 2026,
  mileageMax: 0,
  region: "Весь Узбекистан",
};

export default function Home() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Смена фильтров всегда возвращает на первую страницу — иначе можно
  // оказаться на странице 5 для выборки, в которой теперь только 1 страница.
  function handleFiltersChange(next: FilterState) {
    setFilters(next);
    setPage(1);
  }

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.brand && filters.brand !== ALL_BRANDS) {
      params.set("brand", filters.brand);
    }
    if (filters.model && filters.model !== ALL_MODELS) {
      params.set("model", filters.model);
    }
    if (filters.yearFrom) params.set("yearFrom", String(filters.yearFrom));
    if (filters.mileageMax) params.set("mileageMax", String(filters.mileageMax));
    if (filters.region) params.set("region", filters.region);
    params.set("page", String(page));

    let cancelled = false;
    setLoading(true);

    fetch(`/api/cars?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setCars(data.cars ?? []);
          setTotal(data.total ?? 0);
          setTotalPages(data.totalPages ?? 1);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCars([]);
          setTotal(0);
          setTotalPages(1);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  function handlePageChange(next: number) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <FilterBar filters={filters} onChange={handleFiltersChange} />

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">
            {loading ? t("home.searching") : t("home.found", { count: total })}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <span className="hidden sm:inline">{t("home.sortLabel")}</span>
            <span className="sm:hidden">{t("home.sortLabelShort")}</span>
            <ArrowUpDown className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 sm:px-4">
          {!loading && cars.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              {t("home.empty")}
            </div>
          ) : (
            cars.map((car) => <CarCard key={car.id} car={car} />)
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />

        <SeoTextBlock />
      </main>
    </div>
  );
}
