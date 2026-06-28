import { NextRequest } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

// In-memory счётчик запросов по IP. Подходит для одного сервера —
// при PM2 cluster mode (несколько процессов) каждый процесс считает
// отдельно, так что реальный лимит мягче в N раз (N = число процессов).
// Это приемлемо для защиты от спама/перегрузки, не для точного биллинга.
const buckets = new Map<string, Bucket>();

// Периодически чистим старые записи, чтобы Map не разрастался бесконечно
// при большом количестве уникальных IP.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupIfNeeded() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Проверяет лимит запросов для текущего IP в рамках именованного "ведра"
 * (разные эндпоинты можно лимитировать раздельно через разный bucketName).
 *
 * @param windowMs — длительность окна в миллисекундах
 * @param maxRequests — максимум запросов за окно
 * @returns true если лимит превышен (запрос нужно отклонить)
 */
export function isRateLimited(
  req: NextRequest,
  bucketName: string,
  maxRequests: number,
  windowMs: number
): boolean {
  cleanupIfNeeded();

  const ip = getClientIp(req);
  const key = `${bucketName}:${ip}`;
  const now = Date.now();

  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  existing.count += 1;
  return existing.count > maxRequests;
}
