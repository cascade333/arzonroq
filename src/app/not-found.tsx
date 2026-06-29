import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 text-center">
      <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">
        ENG <span className="text-[#2E8B2E]">ARZON</span>
      </h1>

      <p className="mt-6 text-2xl font-bold text-slate-900">404</p>
      <p className="mt-2 text-slate-600">
        Sahifa topilmadi / Страница не найдена
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-[#2E8B2E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#267326]"
        >
          Bosh sahifa
        </Link>
        <Link
          href="/ru"
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Главная
        </Link>
      </div>
    </div>
  );
}
