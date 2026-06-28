import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const CONTENT = {
  ru: {
    metaTitle: "Пользовательское соглашение — Eng Arzon",
    backLabel: "На главную",
    heading: "Пользовательское соглашение",
    updated: "Последнее обновление: 25 июня 2026 г.",
    sections: [
      {
        title: "1. Общие положения",
        paragraphs: [
          "Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует условия использования сайта Eng Arzon (eng-arzon.uz, далее — «Сайт», «Платформа»). Используя Сайт, подавая объявление о продаже автомобиля или совершая иные действия на Сайте, вы подтверждаете, что прочитали, поняли и принимаете условия настоящего Соглашения в полном объёме.",
        ],
      },
      {
        title: "2. Статус платформы",
        paragraphs: [
          "Eng Arzon является информационной площадкой (доской объявлений), предоставляющей пользователям техническую возможность размещать объявления о продаже автомобилей и находить такие объявления. Платформа не является продавцом, покупателем, посредником, комиссионером или стороной сделки купли-продажи автомобиля.",
          "Все сделки купли-продажи автомобилей совершаются исключительно между продавцом и покупателем самостоятельно, на их собственный риск и ответственность. Платформа не участвует в переговорах, не принимает оплату за автомобили и не гарантирует исполнение обязательств сторонами сделки.",
        ],
      },
      {
        title: "3. Модерация объявлений",
        paragraphs: [
          "Перед публикацией каждое объявление проходит проверку модератором Платформы: сверяются предоставленные фотографии технического паспорта транспортного средства, фотографии автомобиля и указанная цена. Модерация направлена на снижение количества недостоверных объявлений, однако не является гарантией подлинности документов, юридической чистоты автомобиля, его технического состояния или добросовестности продавца.",
          "Платформа вправе отказать в публикации объявления, отклонить заявку или снять опубликованное объявление с публикации без объяснения причин, если у модератора возникли обоснованные сомнения в достоверности предоставленных данных.",
        ],
      },
      {
        title: "4. Обязанности пользователя",
        intro: "Размещая объявление, пользователь обязуется:",
        list: [
          "предоставлять достоверную информацию об автомобиле, включая технические характеристики, цену, наличие повреждений и историю эксплуатации;",
          "являться законным владельцем автомобиля либо лицом, имеющим право на его продажу;",
          "не размещать объявления в рекламных целях, не связанных с реальной продажей конкретного автомобиля;",
          "самостоятельно нести ответственность за содержание размещаемой информации, фотографий и документов;",
          "не использовать Платформу для мошеннических действий, введения других пользователей в заблуждение или нарушения законодательства Республики Узбекистан.",
        ],
      },
      {
        title: "5. Ограничение ответственности",
        intro: "Платформа не несёт ответственности за:",
        list: [
          "достоверность сведений, указанных продавцом в объявлении, и соответствие фактического состояния автомобиля заявленному;",
          "действия или бездействие продавца либо покупателя в рамках сделки купли-продажи, совершённой через контакт, полученный на Сайте;",
          "любые убытки, возникшие в результате сделки между пользователями Платформы;",
          "временную недоступность Сайта, технические сбои, утрату данных или иные обстоятельства, находящиеся вне разумного контроля Платформы.",
        ],
        paragraphs: [
          "Перед совершением сделки покупателю рекомендуется самостоятельно проверить документы на автомобиль, его техническое состояние и юридическую чистоту, при необходимости — с привлечением специалистов.",
        ],
      },
      {
        title: "6. Персональные данные",
        paragraphs: [
          "Контактные данные продавца (имя и номер телефона), указанные при подаче объявления, становятся доступны потенциальным покупателям после публикации объявления — для возможности связаться напрямую. Платформа обрабатывает предоставленные данные исключительно в целях функционирования сервиса и не передаёт их третьим лицам, за исключением случаев, прямо предусмотренных законодательством.",
        ],
      },
      {
        title: "7. Изменение условий",
        paragraphs: [
          "Платформа вправе изменять условия настоящего Соглашения в одностороннем порядке. Актуальная редакция всегда доступна по адресу eng-arzon.uz/terms. Продолжение использования Сайта после публикации изменений означает согласие пользователя с новой редакцией.",
        ],
      },
      {
        title: "8. Контакты",
        paragraphs: [
          "По вопросам, связанным с настоящим Соглашением или работой Платформы, вы можете обратиться через форму обратной связи на Сайте.",
        ],
      },
    ],
  },
  uz: {
    metaTitle: "Foydalanuvchi shartnomasi — Eng Arzon",
    backLabel: "Bosh sahifaga",
    heading: "Foydalanuvchi shartnomasi",
    updated: "Oxirgi yangilanish: 2026-yil 25-iyun",
    sections: [
      {
        title: "1. Umumiy qoidalar",
        paragraphs: [
          "Mazkur Foydalanuvchi shartnomasi (\"Shartnoma\") Eng Arzon sayti (eng-arzon.uz, \"Sayt\", \"Platforma\")dan foydalanish shartlarini belgilaydi. Saytdan foydalanib, avtomobil sotish bo'yicha eʼlon joylashtirib yoki Saytda boshqa harakatlarni amalga oshirib, siz mazkur Shartnoma shartlarini to'liq o'qib chiqdingiz, tushundingiz va qabul qilasiz deb hisoblanadi.",
        ],
      },
      {
        title: "2. Platforma maqomi",
        paragraphs: [
          "Eng Arzon foydalanuvchilarga avtomobil sotish to'g'risida eʼlon joylashtirish va shunday eʼlonlarni topish uchun texnik imkoniyat beruvchi axborot platformasi (eʼlonlar taxtasi)dir. Platforma avtomobil oldi-sotdi bitimining sotuvchisi, xaridori, vositachisi, komissioneri yoki tomoni hisoblanmaydi.",
          "Avtomobil oldi-sotdi bitimlari faqat sotuvchi va xaridor o'rtasida, ularning o'z xavfi va javobgarligi asosida mustaqil amalga oshiriladi. Platforma muzokaralarda qatnashmaydi, avtomobillar uchun to'lovni qabul qilmaydi va tomonlarning majburiyatlarini bajarishini kafolatlamaydi.",
        ],
      },
      {
        title: "3. Eʼlonlarni moderatsiya qilish",
        paragraphs: [
          "Har bir eʼlon e'lon qilinishidan oldin Platforma moderatori tomonidan tekshiriladi: taqdim etilgan texnik pasport suratlari, avtomobil suratlari va ko'rsatilgan narx solishtiriladi. Moderatsiya ishonchsiz eʼlonlar sonini kamaytirishga qaratilgan, biroq hujjatlarning haqiqiyligi, avtomobilning huquqiy tozaligi, texnik holati yoki sotuvchining vijdoniyligi kafolati hisoblanmaydi.",
          "Agar moderatorda taqdim etilgan ma'lumotlarning haqiqiyligi to'g'risida asosli shubhalar tug'ilsa, Platforma sababini tushuntirmasdan eʼlonni joylashtirishni rad etish, arizani rad etish yoki e'lon qilingan eʼlonni nashrdan olib tashlash huquqiga ega.",
        ],
      },
      {
        title: "4. Foydalanuvchining majburiyatlari",
        intro: "Eʼlon joylashtirar ekan, foydalanuvchi quyidagilarga majburdir:",
        list: [
          "avtomobil to'g'risida, jumladan texnik xususiyatlari, narxi, shikastlanishlar mavjudligi va foydalanish tarixi haqida ishonchli ma'lumot taqdim etish;",
          "avtomobilning qonuniy egasi yoki uni sotish huquqiga ega shaxs bo'lish;",
          "muayyan avtomobilning haqiqiy sotilishi bilan bog'liq bo'lmagan reklama maqsadlarida eʼlonlar joylashtirmaslik;",
          "joylashtirilgan ma'lumot, suratlar va hujjatlarning mazmuni uchun mustaqil javobgarlikni o'z zimmasiga olish;",
          "Platformadan firibgarlik harakatlari, boshqa foydalanuvchilarni chalg'itish yoki O'zbekiston Respublikasi qonunchiligini buzish uchun foydalanmaslik.",
        ],
      },
      {
        title: "5. Javobgarlikni cheklash",
        intro: "Platforma quyidagilar uchun javobgar emas:",
        list: [
          "sotuvchi eʼlonda ko'rsatgan ma'lumotlarning haqiqiyligi va avtomobilning haqiqiy holatining e'lon qilinganiga muvofiqligi;",
          "Saytda olingan kontakt orqali amalga oshirilgan oldi-sotdi bitimi doirasida sotuvchi yoki xaridorning harakatlari yoki harakatsizligi;",
          "Platforma foydalanuvchilari o'rtasidagi bitim natijasida yuzaga kelgan har qanday zararlar;",
          "Saytning vaqtinча mavjud emasligi, texnik nosozliklar, ma'lumotlarning yo'qolishi yoki Platformaning oqilona nazoratidan tashqaridagi boshqa holatlar.",
        ],
        paragraphs: [
          "Bitim amalga oshirilishidan oldin xaridorga avtomobil hujjatlarini, uning texnik holati va huquqiy tozaligini mustaqil ravishda, zarur bo'lganda mutaxassislar yordamida tekshirish tavsiya etiladi.",
        ],
      },
      {
        title: "6. Shaxsiy ma'lumotlar",
        paragraphs: [
          "Eʼlon berishda ko'rsatilgan sotuvchining kontakt ma'lumotlari (ismi va telefon raqami) eʼlon e'lon qilingandan so'ng potentsial xaridorlarga to'g'ridan-to'g'ri bog'lanish imkoniyati uchun ochiq bo'ladi. Platforma taqdim etilgan ma'lumotlarni faqat xizmat faoliyatini yuritish maqsadlarida qayta ishlaydi va qonunchilikda to'g'ridan-to'g'ri nazarda tutilgan hollar bundan mustasno, uchinchi shaxslarga uzatmaydi.",
        ],
      },
      {
        title: "7. Shartlarni o'zgartirish",
        paragraphs: [
          "Platforma mazkur Shartnoma shartlarini bir tomonlama tartibda o'zgartirish huquqiga ega. Dolzarb tahrir har doim eng-arzon.uz/terms manzilida mavjud. O'zgarishlar e'lon qilingandan keyin Saytdan foydalanishni davom ettirish foydalanuvchining yangi tahrirga rozilik bildirgani anglatadi.",
        ],
      },
      {
        title: "8. Aloqa",
        paragraphs: [
          "Mazkur Shartnoma yoki Platforma faoliyati bilan bog'liq savollar bo'yicha Saytdagi aloqa formasi orqali murojaat qilishingiz mumkin.",
        ],
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.uz;
  return { title: content.metaTitle };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.uz;
  const homeHref = locale === "ru" ? "/ru" : "/";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        <Link
          href={homeHref}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {content.backLabel}
        </Link>
      </div>

      <main className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {content.heading}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{content.updated}</p>

          <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
            {content.sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-semibold text-slate-900">{section.title}</h2>
                {"intro" in section && section.intro && (
                  <p className="mt-2">{section.intro}</p>
                )}
                {"list" in section && section.list && (
                  <ul className="mt-2 list-disc space-y-1.5 pl-5">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.paragraphs?.map((p) => (
                  <p key={p} className="mt-2">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
