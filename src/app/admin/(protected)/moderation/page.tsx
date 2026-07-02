import { prisma } from "@/lib/prisma";
import ModerationCard from "@/components/admin/ModerationCard";

export default async function ModerationPage() {
  const pending = await prisma.car.findMany({
    where: { status: "PENDING_VERIFICATION" },
    include: { seller: true, images: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Проверка заявок</h1>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
          {pending.length} на проверке
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Сверьте VIN, фото техпаспорта, фото авто и цену с другими досками
        объявлений перед публикацией.
      </p>

      <div className="mt-4 space-y-4">
        {pending.map((car) => (
          <ModerationCard key={car.id} car={car} />
        ))}
        {pending.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-400">
            Нет заявок на проверку.
          </div>
        )}
      </div>
    </div>
  );
}
