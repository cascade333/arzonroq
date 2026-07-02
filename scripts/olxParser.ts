/**
 * Парсер самых дешёвых объявлений с Avtoelon.uz по целевым моделям.
 * (Раньше был OLX, но CloudFront блокирует IP дата-центра Timeweb.)
 *
 * Avtoelon встраивает в HTML структурированный JSON:
 *   listing.items.push({"unitPrice":3200,"url":"...","status":"live",...})
 * — парсим его, а не вёрстку. Сортировка ?sort_by=price-asc.
 *
 * Создаёт ТОЛЬКО черновики (PENDING_VERIFICATION, sourceUrl заполнен) —
 * менеджер проверяет, дозаполняет фото/VIN и одобряет вручную.
 *
 * Запуск:  npx tsx --env-file=.env scripts/olxParser.ts            — боевой
 *          npx tsx --env-file=.env scripts/olxParser.ts --dry-run  — без записи
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 2 });
const prisma = new PrismaClient({ adapter });
const DRY_RUN = process.argv.includes("--dry-run");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

type Target = {
  brand: string;
  model: string;
  slugs: string[];    // страницы моделей на avtoelon (вариантов может быть несколько)
  minPrice: number;   // минимальная реальная цена в у.е. — ниже считаем фейком
  transmission: "AUTOMATIC" | "MANUAL";
  defaultFuel: "PETROL" | "DIESEL" | "GAS" | "ELECTRIC" | "HYBRID";
};

const TARGETS: Target[] = [
  { brand: "Chevrolet", model: "Cobalt",  slugs: ["chevrolet/cobalt"],  minPrice: 3000, transmission: "AUTOMATIC", defaultFuel: "PETROL" },
  { brand: "Chevrolet", model: "Tracker", slugs: ["chevrolet/tracker"], minPrice: 7000, transmission: "AUTOMATIC", defaultFuel: "PETROL" },
  { brand: "BYD", model: "Song Plus", minPrice: 8000, transmission: "AUTOMATIC", defaultFuel: "HYBRID",
    slugs: ["byd/song-plus-dm-i", "byd/song-plus-ev", "byd/song-plus-champion-edition", "byd/song-plus-dm-i-champion", "byd/song-plus-ev-champion"] },
  { brand: "BYD", model: "Yuan Up", minPrice: 7000, transmission: "AUTOMATIC", defaultFuel: "ELECTRIC",
    slugs: ["byd/yuan-up", "byd/yuan-up-dm-i"] },
  { brand: "BYD", model: "Chazor", slugs: ["byd/chazor"], minPrice: 8000, transmission: "AUTOMATIC", defaultFuel: "HYBRID" },
];

// Топливо по slug: электро-версии содержат "ev", гибриды — "dm-i"
function fuelFromSlug(slug: string, fallback: Target["defaultFuel"]): Target["defaultFuel"] {
  if (/dm-i/.test(slug)) return "HYBRID";
  if (/(^|-)ev($|-)/.test(slug.split("/")[1] || "")) return "ELECTRIC";
  return fallback;
}

type Item = { price: number; url: string; slug: string; city: string };

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept": "text/html", "Accept-Language": "ru-RU,ru;q=0.9" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

// Вытаскивает объявления из listing.items.push({...}) на странице модели
async function fetchItems(slug: string): Promise<Item[]> {
  const html = await fetchHtml(`https://avtoelon.uz/avto/${slug}/?sort_by=price-asc`);
  const items: Item[] = [];
  const re = /listing\.items\.push\((\{[\s\S]*?\})\);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const o = JSON.parse(m[1]);
      if (o.status !== "live") continue;
      if (typeof o.unitPrice !== "number" || o.unitPrice <= 0) continue;
      if (!o.url) continue;
      items.push({ price: o.unitPrice, url: o.url, slug, city: o.city || "" });
    } catch { /* битый JSON — пропускаем */ }
  }
  return items;
}

// Год и пробег берём со страницы самого объявления
async function fetchDetails(url: string): Promise<{ year: number | null; mileage: number; region: string }> {
  const raw = await fetchHtml(url);
  // &nbsp; в числах ("100&nbsp;000 км") ломает разбор пробега — заменяем на пробел
  const html = raw.replace(/&nbsp;/g, " ");
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const yearM = title.match(/\b(19[89]\d|20[0-2]\d)\b/);
  const kmM = html.match(/([\d][\d\s\u00a0]{0,9})\s*км/);
  const mileage = kmM ? Number(kmM[1].replace(/[^\d]/g, "")) : 0;
  const regionM = title.match(/ в ([А-ЯЁA-Z][а-яёa-z-]+)/);
  return {
    year: yearM ? Number(yearM[1]) : null,
    mileage: isFinite(mileage) ? mileage : 0,
    region: regionM ? normalizeRegion(regionM[1]) : "Ташкент",
  };
}

// Город из title приходит в предложном падеже ("в Фергане") — приводим к именительному
const REGION_MAP: Record<string, string> = {
  "Ташкенте": "Ташкент", "Фергане": "Фергана", "Андижане": "Андижан",
  "Намангане": "Наманган", "Самарканде": "Самарканд", "Бухаре": "Бухара",
  "Карши": "Карши", "Нукусе": "Нукус", "Ургенче": "Ургенч",
  "Джизаке": "Джизак", "Термезе": "Термез", "Навои": "Навои",
  "Гулистане": "Гулистан", "Коканде": "Коканд", "Ангрене": "Ангрен",
  "Чирчике": "Чирчик", "Алмалыке": "Алмалык", "Шахрисабзе": "Шахрисабз",
};
function normalizeRegion(r: string): string {
  return REGION_MAP[r] || r;
}

async function getSystemSeller() {
  const phone = "+998000000000";
  const existing = await prisma.seller.findUnique({ where: { phone } });
  if (existing) return existing;
  return prisma.seller.create({ data: { name: "Avtoelon Parser (черновики)", phone } });
}

async function main() {
  console.log(`\n=== Avtoelon парсер, ${new Date().toISOString()} | ${DRY_RUN ? "DRY-RUN" : "боевой"} ===`);
  const seller = DRY_RUN ? null : await getSystemSeller();

  for (const t of TARGETS) {
    try {
      // Собираем объявления со всех вариантов модели
      let all: Item[] = [];
      for (const slug of t.slugs) {
        try {
          all = all.concat(await fetchItems(slug));
        } catch (e: any) {
          console.log(`  (${slug}: ${e.message})`);
        }
      }
      // Фильтр фейков и сортировка по цене
      const candidates = all.filter((i) => i.price >= t.minPrice).sort((a, b) => a.price - b.price);
      if (!candidates.length) {
        console.log(`[${t.brand} ${t.model}] подходящих объявлений нет (всего собрано: ${all.length})`);
        continue;
      }

      // Идём от самого дешёвого, пропуская дубли и объявления без года
      let created = false;
      for (const c of candidates.slice(0, 5)) {
        const dup = await prisma.car.findFirst({ where: { sourceUrl: c.url } });
        if (dup) {
          console.log(`[${t.brand} ${t.model}] $${c.price} уже в базе, смотрю следующее`);
          continue;
        }
        const d = await fetchDetails(c.url);
        if (!d.year) {
          console.log(`[${t.brand} ${t.model}] $${c.price} — не удалось определить год, пропускаю`);
          continue;
        }
        console.log(`[${t.brand} ${t.model}] НАЙДЕНО: $${c.price}, ${d.year} г., ${d.mileage} км, ${d.region}\n  ${c.url}`);
        if (!DRY_RUN) {
          await prisma.car.create({
            data: {
              brand: t.brand,
              model: t.model,
              year: d.year,
              mileage: d.mileage,
              region: d.region,
              price: c.price,
              transmission: t.transmission,
              fuelType: fuelFromSlug(c.slug, t.defaultFuel),
              status: "PENDING_VERIFICATION",
              sellerId: seller!.id,
              sourceUrl: c.url,
              description:
                `[Автоматически найдено парсером Avtoelon]\n` +
                `Требует проверки менеджером: фото, VIN, связь с продавцом.`,
            },
          });
          console.log(`  → черновик создан (PENDING_VERIFICATION)`);
        }
        created = true;
        break;
      }
      if (!created) console.log(`[${t.brand} ${t.model}] новых объявлений для черновика нет`);
    } catch (e: any) {
      console.error(`[${t.brand} ${t.model}] ОШИБКА: ${e.message}`);
    }
  }

  await prisma.$disconnect();
  console.log("=== готово ===\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
