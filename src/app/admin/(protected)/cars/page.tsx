import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/admin/StatusBadge";
import DeleteCarButton from "@/components/admin/DeleteCarButton";

export default async function AdminCarsPage() {
  const cars = await prisma.car.findMany({
    include: { seller: true, images: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Автомобили</h1>
        <Link
          href="/admin/cars/new"
          className="rounded-lg bg-[#2E8B2E] px-4 py-2 text-sm font-medium text-white hover:bg-[#267326]"
        >
          + Добавить авто
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-3 font-medium">Авто</th>
              <th className="px-4 py-3 font-medium">Цена</th>
              <th className="px-4 py-3 font-medium">Регион</th>
              <th className="px-4 py-3 font-medium">Продавец</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">
                    {car.brand} {car.model}
                  </div>
                  <div className="text-slate-500">
                    {car.year} · {car.mileage.toLocaleString("ru-RU")} км
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-[#2E8B2E]">
                  ${car.price.toLocaleString("en-US")}
                </td>
                <td className="px-4 py-3 text-slate-600">{car.region}</td>
                <td className="px-4 py-3 text-slate-600">{car.seller.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={car.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/cars/${car.id}/edit`}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      Изменить
                    </Link>
                    <DeleteCarButton carId={car.id} />
                  </div>
                </td>
              </tr>
            ))}
            {cars.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Пока нет добавленных автомобилей.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
