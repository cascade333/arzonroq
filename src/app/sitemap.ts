import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://eng-arzon.uz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cars = await prisma.car.findMany({
    where: { status: { in: ["AVAILABLE", "ARCHIVED"] } },
    select: { id: true, updatedAt: true, status: true },
    orderBy: { updatedAt: "desc" },
    take: 1000, // разумный потолок, чтобы sitemap не разрастался бесконечно
  });

  // Каждая страница авто индексируется в обоих языках — узбекский (без
  // префикса) и русский (/ru/) — это две отдельные URL для одного и того
  // же объявления, что и нужно для корректной двуязычной индексации.
  const carEntries: MetadataRoute.Sitemap = cars.flatMap((car) => {
    const changeFrequency = car.status === "ARCHIVED" ? "monthly" as const : "daily" as const;
    const priority = car.status === "ARCHIVED" ? 0.3 : 0.7;
    return [
      {
        url: `${BASE_URL}/cars/${car.id}`,
        lastModified: car.updatedAt,
        changeFrequency,
        priority,
      },
      {
        url: `${BASE_URL}/ru/cars/${car.id}`,
        lastModified: car.updatedAt,
        changeFrequency,
        priority,
      },
    ];
  });

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${BASE_URL}/ru`, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${BASE_URL}/sell`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/ru/sell`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/ru/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    ...carEntries,
  ];
}
