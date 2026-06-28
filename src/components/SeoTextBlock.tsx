"use client";

import { useTranslation } from "@/lib/i18n/I18nProvider";

const TEXT = {
  uz: {
    heading: "Eng Arzon — eng arzon avtomobillar eʼlonlari sayti",
    p1: "Eng Arzon (eng-arzon.uz) — bu O'zbekistondagi eng arzon avtomobillarni topish uchun platforma. Bizning saytimizda siz yurgan yo'li bo'lgan avtomobillarni bozordagi eng past narxda sotib olishingiz mumkin — VIP eʼlonlarsiz, pullik ko'tarishlarsiz, narx oshirishlarsiz.",
    p2: "Har bir eʼlon modertor tomonidan tekshiriladi: texpasport, VIN va avtomobil suratlari orqali. Toshkent, Samarqand, Buxoro yoki O'zbekistonning boshqa hududidan avtomobil qidiryapsizmi? Marka, model, yil va yurgan yo'li bo'yicha filtrlardan foydalaning — barcha eʼlonlar eng arzonidan eng qimmatigacha saralangan. Avtomobilingizni sotmoqchimisiz? \"Avtomobil sotish\" formasi orqali ariza yuboring — texpasport va suratlarni tekshirgandan so'ng eʼloningiz saytda bepul, vositachilarsiz va yashirin to'lovlarsiz joylashtiriladi.",
  },
  ru: {
    heading: "Eng Arzon — сайт объявлений о продаже дешёвых автомобилей",
    p1: "Eng Arzon (eng-arzon.uz) — платформа для поиска самых дешёвых автомобилей в Узбекистане. На нашем сайте вы можете купить авто с пробегом по самой низкой рыночной цене — без VIP-объявлений, без платных поднятий, без накруток.",
    p2: "Каждое объявление проверяется модератором: по техпаспорту, VIN-коду и фотографиям автомобиля. Ищете продажу авто в Ташкенте, Самарканде, Бухаре или другом регионе Узбекистана? Используйте фильтры по марке, модели, году и пробегу — все объявления отсортированы от самой дешёвой цены к дорогой. Хотите продать свой автомобиль? Подайте заявку через форму «Продать авто» — после проверки техпаспорта и фото ваше объявление появится на сайте бесплатно, без посредников и без скрытых комиссий.",
  },
  en: {
    heading: "Eng Arzon — the cheapest car listings in Uzbekistan",
    p1: "Eng Arzon (eng-arzon.uz) is a platform for finding the cheapest cars in Uzbekistan. On our site you can buy a used car at the lowest market price — no paid placements, no boosted listings, no markups.",
    p2: "Every listing is reviewed by a moderator: registration document, VIN, and car photos are checked. Looking for a car in Tashkent, Samarkand, Bukhara, or another region of Uzbekistan? Use the filters by brand, model, year, and mileage — all listings are sorted from the cheapest price to the most expensive. Want to sell your car? Submit an application via the \"Sell a car\" form — after we verify the documents and photos, your listing will appear on the site for free, with no middlemen and no hidden fees.",
  },
};

export default function SeoTextBlock() {
  const { locale } = useTranslation();
  const text = TEXT[locale];

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-600">
      <h2 className="mb-2 text-base font-semibold text-slate-900">{text.heading}</h2>
      <p>{text.p1}</p>
      <p className="mt-2">{text.p2}</p>
    </section>
  );
}
