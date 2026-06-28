import { getCarById } from "@/lib/carRepository";
import { notFound } from "next/navigation";
import CarDetailView from "@/components/CarDetailView";
import ArchivedCarView from "@/components/ArchivedCarView";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const car = await getCarById(id);

  if (!car || (car.status !== "available" && car.status !== "archived")) {
    return { title: "Автомобиль не найден — Eng Arzon" };
  }

  if (car.status === "archived") {
    return {
      title: `${car.brand} ${car.model} ${car.year} (продано) — Eng Arzon`,
      description:
        `${car.brand} ${car.model} ${car.year}, ${car.region}. ` +
        `Это объявление больше не активно — автомобиль уже продан или снят с продажи. ` +
        `Найдите похожие предложения на Eng Arzon.`,
    };
  }

  const title = `${car.brand} ${car.model} ${car.year} — ${car.price.toLocaleString("en-US")} у.е. | Eng Arzon`;
  const description =
    `${car.brand} ${car.model} ${car.year}, ${car.mileage.toLocaleString("ru-RU")} км, ` +
    `${car.region}. Цена ${car.price.toLocaleString("en-US")} у.е. ` +
    `Купить авто с пробегом по самой низкой цене — Eng Arzon, проверенные объявления.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: car.images[0] ? [car.images[0]] : undefined,
      type: "website",
    },
  };
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const car = await getCarById(id);

  if (!car || (car.status !== "available" && car.status !== "archived")) {
    notFound();
  }

  if (car.status === "archived") {
    return <ArchivedCarView car={car} />;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${car.brand} ${car.model} ${car.year}`,
    brand: car.brand,
    model: car.model,
    vehicleModelDate: String(car.year),
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: car.mileage,
      unitCode: "KMT",
    },
    image: car.images,
    offers: {
      "@type": "Offer",
      price: car.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      areaServed: car.region,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CarDetailView car={car} />
    </>
  );
}
