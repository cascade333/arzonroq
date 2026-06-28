"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/I18nProvider";

export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  // Показываем максимум 5 номеров страниц вокруг текущей, чтобы не
  // растягивать пагинацию при большом количестве страниц.
  const pages: number[] = [];
  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(totalPages, windowStart + 4);
  for (let p = windowStart; p <= windowEnd; p++) pages.push(p);

  return (
    <nav className="mt-4 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={t("pagination.prev")}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {windowStart > 1 && (
        <>
          <PageButton p={1} active={false} onClick={onChange} />
          {windowStart > 2 && <span className="px-1 text-slate-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <PageButton key={p} p={p} active={p === page} onClick={onChange} />
      ))}

      {windowEnd < totalPages && (
        <>
          {windowEnd < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
          <PageButton p={totalPages} active={false} onClick={onChange} />
        </>
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={t("pagination.next")}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function PageButton({
  p,
  active,
  onClick,
}: {
  p: number;
  active: boolean;
  onClick: (page: number) => void;
}) {
  return (
    <button
      onClick={() => onClick(p)}
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-[#2E8B2E] text-white"
          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      {p}
    </button>
  );
}
