import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  answerCallbackQuery,
  editTelegramMessage,
  sendTelegramMessage,
  sendTelegramMessageWithContactRequest,
} from "@/lib/telegram";

interface TelegramUpdate {
  callback_query?: {
    id: string;
    data: string;
    message: { chat: { id: number }; message_id: number };
    from: { id: number };
  };
  message?: {
    chat: { id: number };
    from: { id: number };
    text?: string;
    contact?: {
      phone_number: string;
      user_id?: number;
    };
  };
}

/**
 * POST /api/telegram/webhook
 * Принимает обновления от Telegram Bot API (ТЗ п.8).
 *
 * Обрабатывает нажатия кнопок продавца:
 * - "keep_<carId>"   → "Да, актуально"     → обновляет lastConfirmedAt
 * - "sold_<carId>"   → "Продано"           → статус SOLD, авто исчезает с сайта
 * - "delist_<carId>" → "Снять с продажи"   → статус DELISTED
 */
export async function POST(req: NextRequest) {
  const update: TelegramUpdate = await req.json();

  if (update.message) {
    await handleMessage(update.message);
    return NextResponse.json({ ok: true });
  }

  const cq = update.callback_query;
  if (!cq) {
    return NextResponse.json({ ok: true });
  }

  const [action, entityId] = splitAction(cq.data);
  const chatId = String(cq.message.chat.id);
  const messageId = cq.message.message_id;

  try {
    switch (action) {
      case "keep": {
        const car = await prisma.car.findUnique({ where: { id: entityId } });
        await prisma.car.update({
          where: { id: entityId },
          data: {
            lastConfirmedAt: new Date(),
            // Если авто было автоматически скрыто после неответа >24ч,
            // возвращаем его в продажу (резерв не трогаем, если он был активен)
            status: car?.status === "DELISTED" ? "AVAILABLE" : car?.status,
          },
        });
        await answerCallbackQuery(cq.id, "Спасибо! Объявление остаётся активным.");
        await editTelegramMessage(chatId, messageId, "✅ Подтверждено: объявление активно.");
        break;
      }
      case "sold": {
        await prisma.car.update({
          where: { id: entityId },
          data: { status: "SOLD" },
        });
        await answerCallbackQuery(cq.id, "Авто отмечено как продано.");
        await editTelegramMessage(chatId, messageId, "🚫 Автомобиль отмечен как «Продано» и скрыт с сайта.");
        break;
      }
      case "delist": {
        await prisma.car.update({
          where: { id: entityId },
          data: { status: "DELISTED" },
        });
        await answerCallbackQuery(cq.id, "Объявление снято с продажи.");
        await editTelegramMessage(chatId, messageId, "🚫 Объявление снято с продажи.");
        break;
      }
      default:
        await answerCallbackQuery(cq.id);
    }
  } catch (err) {
    console.error("Telegram webhook error:", err);
    await answerCallbackQuery(cq.id, "Произошла ошибка, попробуйте позже.");
  }

  return NextResponse.json({ ok: true });
}

function splitAction(data: string): [string, string] {
  const idx = data.indexOf("_");
  if (idx === -1) return [data, ""];
  return [data.slice(0, idx), data.slice(idx + 1)];
}

/**
 * Обрабатывает текстовые сообщения от продавца — сценарий привязки Telegram ID.
 *
 * Сценарий:
 * 1. Продавец пишет боту /start
 * 2. Бот просит поделиться номером телефона через нативную кнопку Telegram
 * 3. Продавец нажимает кнопку → Telegram присылает message.contact
 * 4. Бот ищет продавца с таким номером в базе и привязывает telegramId
 *
 * Так привязка не требует от продавца вручную вводить или копировать ID —
 * достаточно того же номера, который ранее указали в админке (ТЗ п.9).
 */
async function handleMessage(message: NonNullable<TelegramUpdate["message"]>) {
  const chatId = String(message.chat.id);

  if (message.contact) {
    const phone = normalizePhone(message.contact.phone_number);
    const seller = await prisma.seller.findFirst({
      where: { phone: { endsWith: phone.slice(-9) } },
    });

    if (!seller) {
      await sendTelegramMessage(
        chatId,
        "Не нашли продавца с таким номером телефона. Проверьте, что номер указан в Arzonroq.uz, либо обратитесь к менеджеру."
      );
      return;
    }

    await prisma.seller.update({
      where: { id: seller.id },
      data: { telegramId: chatId },
    });

    await sendTelegramMessage(
      chatId,
      `Готово, ${seller.name}! Теперь уведомления о ваших автомобилях будут приходить сюда.`
    );
    return;
  }

  if (message.text?.startsWith("/start")) {
    await sendTelegramMessageWithContactRequest(
      chatId,
      "Добро пожаловать в Arzonroq.uz!\n\nЧтобы получать уведомления о ваших объявлениях, поделитесь номером телефона — тем же, что указан в анкете продавца."
    );
    return;
  }

  await sendTelegramMessage(
    chatId,
    "Чтобы привязать аккаунт, отправьте команду /start"
  );
}

/** Оставляет только цифры из номера для сравнения (без +998, пробелов, скобок). */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Регистрация вебхука у Telegram (выполнить один раз после деплоя):
 *
 * curl -F "url=https://eng-arzon.uz/api/telegram/webhook" \
 *   https://api.telegram.org/bot<TOKEN>/setWebhook
 */
export async function GET() {
  return NextResponse.json({
    info: "Это endpoint вебхука Telegram. Используйте setWebhook для регистрации.",
  });
}
