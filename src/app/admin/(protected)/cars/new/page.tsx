import { prisma } from "@/lib/prisma";
import CarForm from "@/components/admin/CarForm";

export default async function NewCarPage() {
  const sellers = await prisma.seller.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, phone: true },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Добавить автомобиль</h1>
      <div className="mt-4">
        <CarForm sellers={sellers} />
      </div>
    </div>
  );
}
