import { prisma } from "./prisma";
import { Car as PrismaCar, CarImage, Seller, CarStatus as PrismaCarStatus } from "@prisma/client";
import { Car, CarStatus } from "./types";

function mapStatus(status: PrismaCarStatus): CarStatus {
  switch (status) {
    case "PENDING_VERIFICATION":
      return "pending_verification";
    case "AVAILABLE":
      return "available";
    case "SOLD":
      return "sold";
    case "DELISTED":
      return "delisted";
    case "REJECTED":
      return "rejected";
    case "ARCHIVED":
      return "archived";
    default:
      return "delisted";
  }
}

function mapTransmission(t: string): Car["transmission"] {
  return t === "AUTOMATIC" ? "Автомат" : "Механика";
}

function mapFuelType(f: string): Car["fuelType"] {
  const map: Record<string, Car["fuelType"]> = {
    PETROL: "Бензин",
    DIESEL: "Дизель",
    GAS: "Газ",
    ELECTRIC: "Электро",
    HYBRID: "Гибрид",
  };
  return map[f] ?? "Бензин";
}

function toCar(row: PrismaCar & { images: CarImage[]; seller: Seller }): Car {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    mileage: row.mileage,
    region: row.region,
    price: row.price,
    transmission: mapTransmission(row.transmission),
    fuelType: mapFuelType(row.fuelType),
    description: row.description ?? undefined,
    status: mapStatus(row.status),
    images: [...row.images]
      .sort((a: CarImage, b: CarImage) => a.position - b.position)
      .map((img: CarImage) => img.imageUrl),
    createdAt: row.createdAt.toISOString(),
    sellerPhone: row.seller.phone,
    isDamaged: row.isDamaged,
    damageDescription: row.damageDescription ?? undefined,
  };
}

export interface CarFilters {
  brand?: string;
  model?: string;
  yearFrom?: number;
  mileageMax?: number;
  region?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedCars {
  cars: Car[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 30;

/**
 * Возвращает автомобили со статусом "В продаже", отсортированные по цене
 * от дешёвых к дорогим (правило проекта — см. ТЗ п.5,15), с пагинацией
 * по 30 штук на страницу (см. ТЗ).
 */
export async function listVisibleCars(filters: CarFilters): Promise<PaginatedCars> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;

  const where = {
    status: "AVAILABLE" as const,
    ...(filters.brand ? { brand: filters.brand } : {}),
    ...(filters.model ? { model: filters.model } : {}),
    ...(filters.yearFrom ? { year: { gte: filters.yearFrom } } : {}),
    ...(filters.mileageMax ? { mileage: { lte: filters.mileageMax } } : {}),
    ...(filters.region && filters.region !== "Весь Узбекистан"
      ? { region: filters.region }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.car.findMany({
      where,
      include: { images: true, seller: true },
      orderBy: { price: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.car.count({ where }),
  ]);

  return {
    cars: rows.map(toCar),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getCarById(id: string): Promise<Car | null> {
  const row = await prisma.car.findUnique({
    where: { id },
    include: { images: true, seller: true },
  });
  return row ? toCar(row) : null;
}
