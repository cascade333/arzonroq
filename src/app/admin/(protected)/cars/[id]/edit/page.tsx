import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CarForm from "@/components/admin/CarForm";

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [car, sellers] = await Promise.all([
    prisma.car.findUnique({ where: { id }, include: { images: true } }),
    prisma.seller.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, phone: true },
    }),
  ]);

  if (!car) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">
        Редактировать: {car.brand} {car.model}
      </h1>
      <div className="mt-4">
        <CarForm
          sellers={sellers}
          initial={{
            id: car.id,
            brand: car.brand,
            model: car.model,
            year: car.year,
            mileage: car.mileage,
            region: car.region,
            price: car.price,
            transmission: car.transmission,
            fuelType: car.fuelType,
            description: car.description ?? "",
            sellerId: car.sellerId,
            status: car.status,
            images: [...car.images]
              .sort((a, b) => a.position - b.position)
              .map((img) => img.imageUrl),
          }}
        />
      </div>
    </div>
  );
}
