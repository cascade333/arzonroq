/**
 * Парсер самых дешёвых объявлений с Avtoelon.uz по целевым моделям.
 * Создаёт черновики (PENDING_VERIFICATION) с sourceUrl и фото из объявления.
 *
 * Фото скачиваются в public/uploads/cars (как admin/upload: sharp -> webp
 * 1600px) и привязываются через CarImage. Это референс для модерации —
 * при одобрении желательно заменить на реальные фото от продавца.
 *
 * Запуск:
 *   npx tsx --env-file=.env scripts/olxParser.ts                    боевой
 *   npx tsx --env-file=.env scripts/olxParser.ts --dry-run          без записи
 *   npx tsx --env-file=.env scripts/olxParser.ts --photos-backfill  докачать фото
 *                                        к существующим черновикам без фото
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import sharp from "sharp";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 2 });
const prisma = new PrismaClient({ adapter });
const DRY_RUN = process.argv.includes("--dry-run");
const BACKFILL = process.argv.includes("--photos-backfill");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "cars");
const UPLOADS_BASE = process.env.UPLOADS_BASE_URL ?? "";
const MAX_PHOTOS = 4;

type Target = {
  brand: string;
  model: string;
  slugs: string[];
  minPrice: number;
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
    } catch { /* пропускаем битый JSON */ }
  }
  return items;
}

const REGION_MAP: Record<string, string> = {
  "Ташкенте": "Ташкент", "Фергане": "Фергана", "Андижане": "Андижан",
  "Намангане": "Наманган", "Самарканде": "Самарканд", "Бухаре": "Бухара",
  "Карши": "Карши", "Нукусе": "Нукус", "Ургенче": "Ургенч",
  "Джизаке": "Джизак", "Термезе": "Термез", "Навои": "Навои",
  "Гулистане": "Гулистан", "Коканде": "Коканд", "Ангрене": "Ангрен",
  "Чирчике": "Чирчик", "Алмалыке": "Алмалык", "Шахрисабзе": "Шахрисабз",
};

async function fetchDetails(url: string): Promise<{ year: number | null; mileage: number; region: string; html: string; sellerText: string }> {
  const raw = await fetchHtml(url);
  const html = raw.replace(/&nbsp;/g, " ");
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const yearM = title.match(/\b(19[89]\d|20[0-2]\d)\b/);
  const kmM = html.match(/([\d][\d\s]{0,9})\s*км/);
  const mileage = kmM ? Number(kmM[1].replace(/[^\d]/g, "")) : 0;
  const regionM = title.match(/ в ([А-ЯЁA-Z][а-яёa-z-]+)/);
  // Текст продавца: блок class="description-text", чистим теги и пробелы
  const descM = html.match(/class="description-text"[^>]*>([\s\S]*?)<\/div>/);
  const sellerText = descM
    ? descM[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000)
    : "";
  return {
    sellerText,
    year: yearM ? Number(yearM[1]) : null,
    mileage: isFinite(mileage) ? mileage : 0,
    region: regionM ? (REGION_MAP[regionM[1]] || regionM[1]) : "Ташкент",
    html,
  };
}

// Собирает полноразмерные URL фото: миниатюры вида .../UUID/1-120x90.webp
// превращаем в .../UUID/1-full.webp (проверено через og:image)
function extractPhotoUrls(html: string): string[] {
  const thumbs = html.match(/https:\/\/[a-z0-9.-]*kcdn\.online\/[^"'\s]+?-120x90\.webp/g) || [];
  const full = thumbs.map((u) => u.replace(/-120x90\.webp$/, "-full.webp"));
  const og = (html.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
  const all = og ? [og, ...full] : full;
  return [...new Set(all)].slice(0, MAX_PHOTOS);
}

// Скачивает фото, прогоняет через sharp (как /api/admin/upload) и создаёт CarImage
async function attachPhotos(carId: string, photoUrls: string[], refererUrl: string): Promise<number> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  let saved = 0;
  for (const [i, photoUrl] of photoUrls.entries()) {
    try {
      const res = await fetch(photoUrl, { headers: { "User-Agent": UA, "Referer": refererUrl } });
      if (!res.ok) { console.log(`    фото ${i + 1}: HTTP ${res.status}, пропускаю`); continue; }
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 5000) { console.log(`    фото ${i + 1}: подозрительно маленькое, пропускаю`); continue; }
      const filename = `${randomUUID()}.webp`;
      await sharp(buffer)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(path.join(UPLOAD_DIR, filename));
      await prisma.carImage.create({
        data: { carId, imageUrl: `${UPLOADS_BASE}/uploads/cars/${filename}`, position: i },
      });
      saved++;
    } catch (e: any) {
      console.log(`    фото ${i + 1}: ошибка (${e.message}), пропускаю`);
    }
  }
  return saved;
}

async function getSystemSeller() {
  const phone = "+998000000000";
  const existing = await prisma.seller.findUnique({ where: { phone } });
  if (existing) return existing;
  return prisma.seller.create({ data: { name: "Avtoelon Parser (черновики)", phone } });
}

// Докачивает фото к уже созданным черновикам с sourceUrl, но без картинок
async function backfillPhotos() {
  const cars = await prisma.car.findMany({
    where: {
      sourceUrl: { not: null },
      OR: [
        { images: { none: {} } },
        { description: { contains: "[Автоматически найдено парсером" } },
      ],
    },
    select: { id: true, brand: true, model: true, sourceUrl: true },
  });
  console.log(`Черновиков без фото: ${cars.length}`);
  for (const car of cars) {
    try {
      const d = await fetchDetails(car.sourceUrl!);
      const photos = extractPhotoUrls(d.html);
      if (!photos.length) { console.log(`[${car.brand} ${car.model}] фото на странице не найдены`); continue; }
      const n = await attachPhotos(car.id, photos, car.sourceUrl!);
      if (d.sellerText) {
        await prisma.car.update({
          where: { id: car.id },
          data: { description: d.sellerText + "\n\n[Найдено парсером Avtoelon — требует проверки: реальные фото, VIN, связь с продавцом]" },
        });
      }
      console.log(`[${car.brand} ${car.model}] сохранено фото: ${n}, описание: ${d.sellerText ? "обновлено" : "нет текста"}`);
    } catch (e: any) {
      console.error(`[${car.brand} ${car.model}] ОШИБКА: ${e.message}`);
    }
  }
}

async function main() {
  console.log(`\n=== Avtoelon парсер, ${new Date().toISOString()} | ${BACKFILL ? "BACKFILL фото" : DRY_RUN ? "DRY-RUN" : "боевой"} ===`);

  if (BACKFILL) {
    await backfillPhotos();
    await prisma.$disconnect();
    console.log("=== готово ===\n");
    return;
  }

  const seller = DRY_RUN ? null : await getSystemSeller();

  for (const t of TARGETS) {
    try {
      let all: Item[] = [];
      for (const slug of t.slugs) {
        try { all = all.concat(await fetchItems(slug)); }
        catch (e: any) { console.log(`  (${slug}: ${e.message})`); }
      }
      const candidates = all.filter((i) => i.price >= t.minPrice).sort((a, b) => a.price - b.price);
      if (!candidates.length) {
        console.log(`[${t.brand} ${t.model}] подходящих объявлений нет (собрано: ${all.length})`);
        continue;
      }

      let created = false;
      for (const c of candidates.slice(0, 5)) {
        const dup = await prisma.car.findFirst({ where: { sourceUrl: c.url } });
        if (dup) { console.log(`[${t.brand} ${t.model}] $${c.price} уже в базе, смотрю следующее`); continue; }
        const d = await fetchDetails(c.url);
        if (!d.year) { console.log(`[${t.brand} ${t.model}] $${c.price} — год не определён, пропускаю`); continue; }
        console.log(`[${t.brand} ${t.model}] НАЙДЕНО: $${c.price}, ${d.year} г., ${d.mileage} км, ${d.region}\n  ${c.url}`);
        if (!DRY_RUN) {
          const car = await prisma.car.create({
            data: {
              brand: t.brand, model: t.model, year: d.year, mileage: d.mileage,
              region: d.region, price: c.price,
              transmission: t.transmission,
              fuelType: fuelFromSlug(c.slug, t.defaultFuel),
              status: "PENDING_VERIFICATION",
              sellerId: seller!.id,
              sourceUrl: c.url,
              description:
                (d.sellerText ? d.sellerText + "\n\n" : "") +
                `[Найдено парсером Avtoelon — требует проверки: реальные фото, VIN, связь с продавцом]`,
            },
          });
          const photos = extractPhotoUrls(d.html);
          const n = photos.length ? await attachPhotos(car.id, photos, c.url) : 0;
          console.log(`  → черновик создан, фото: ${n}`);
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
