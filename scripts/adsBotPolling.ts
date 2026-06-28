import "dotenv/config";

const TOKEN = process.env.ADS_BOT_TOKEN;
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://eng-arzon.uz";
const API = `https://api.telegram.org/bot${TOKEN}`;

if (!TOKEN) {
  console.error("ADS_BOT_TOKEN не задан в .env — polling не запущен.");
  process.exit(1);
}

let offset = 0;

async function sendStartMessage(chatId: number) {
  await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text:
        "🚗 Eng Arzon — eng arzon avtomobillar bozori!\n\n" +
        "Tekshirilgan e'lonlar, eng arzon narxlar. VIP eʼlonlarsiz, qo'shimcha to'lovlarsiz.",
      reply_markup: {
        inline_keyboard: [[{ text: "Saytga o'tish 🔗", url: SITE_URL }]],
      },
    }),
  }).catch((err) => {
    console.error("Не удалось отправить сообщение:", err);
  });
}

async function pollOnce() {
  const res = await fetch(
    `${API}/getUpdates?offset=${offset}&timeout=30`
  ).catch(() => null);

  if (!res || !res.ok) return;

  const data = await res.json().catch(() => null);
  if (!data?.ok || !Array.isArray(data.result)) return;

  for (const update of data.result) {
    offset = update.update_id + 1;

    const message = update.message;
    const chatId = message?.chat?.id;
    const text: string = message?.text ?? "";

    if (chatId && text.startsWith("/start")) {
      console.log(`Новый /start от chat_id=${chatId}`);
      await sendStartMessage(chatId);
    }
  }
}

async function main() {
  console.log("Ads bot polling запущен...");
  while (true) {
    try {
      await pollOnce();
    } catch (err) {
      console.error("Ошибка polling-цикла:", err);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

main();
