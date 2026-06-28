import { prisma } from "@/lib/prisma";
import AddSellerForm from "@/components/admin/AddSellerForm";

export default async function AdminSellersPage() {
  const sellers = await prisma.seller.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cars: true } } },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Продавцы</h1>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Телефон</th>
                <th className="px-4 py-3 font-medium">Telegram ID</th>
                <th className="px-4 py-3 font-medium">Авто</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.phone}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.telegramId || <span className="text-slate-400">не привязан</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s._count.cars}</td>
                </tr>
              ))}
              {sellers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    Пока нет продавцов.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Новый продавец</h2>
          <p className="mt-1 text-xs text-slate-500">
            Telegram ID продавец может узнать у бота{" "}
            <a
              href="https://t.me/userinfobot"
              target="_blank"
              className="text-[#2E8B2E] underline"
            >
              @userinfobot
            </a>
          </p>
          <div className="mt-3">
            <AddSellerForm />
          </div>
        </div>
      </div>
    </div>
  );
}
