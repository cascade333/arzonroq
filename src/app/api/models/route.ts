import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BRANDS, MODELS_BY_BRAND } from "@/lib/types";

/**
 * GET /api/models
 * Возвращает объединённый справочник марок и моделей: встроенный
 * статический список (src/lib/types.ts) плюс марки/модели, которые были
 * одобрены менеджером из заявок продавцов, указавших "другую марку/модель"
 * вручную (см. CustomModel в схеме).
 */
export async function GET() {
  const customModels = await prisma.customModel.findMany({
    orderBy: [{ brand: "asc" }, { model: "asc" }],
  });

  const merged: Record<string, string[]> = {};
  for (const brand of BRANDS) {
    merged[brand] = [...MODELS_BY_BRAND[brand]];
  }

  for (const cm of customModels) {
    if (!merged[cm.brand]) merged[cm.brand] = [];
    if (!merged[cm.brand].includes(cm.model)) {
      merged[cm.brand].push(cm.model);
    }
  }

  const brands = Object.keys(merged);

  return NextResponse.json({ brands, modelsByBrand: merged });
}
