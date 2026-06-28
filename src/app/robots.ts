import { MetadataRoute } from "next";

const BASE_URL = "https://eng-arzon.uz";

/**
 * Динамический robots.txt — управляется флагом DISABLE_INDEXING в .env.
 * Когда true: полный запрет индексации для всех роботов (например, на
 * этапе тестирования). Когда выключен/убран: обычная конфигурация —
 * разрешена индексация, кроме /admin/ и /api/, плюс блокировка известных
 * агрессивных SEO-сканеров.
 */
export default function robots(): MetadataRoute.Robots {
  const disableIndexing = process.env.DISABLE_INDEXING === "true";

  if (disableIndexing) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      // Известные агрессивные SEO-сканеры и парсеры — блокируем полностью,
      // они только нагружают сервер без пользы для сайта.
      { userAgent: "AhrefsBot", disallow: "/" },
      { userAgent: "SemrushBot", disallow: "/" },
      { userAgent: "MJ12bot", disallow: "/" },
      { userAgent: "DotBot", disallow: "/" },
      { userAgent: "BLEXBot", disallow: "/" },
      { userAgent: "PetalBot", disallow: "/" },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
