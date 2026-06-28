const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

interface InlineButton {
  text: string;
  callback_data: string;
}

/**
 * Отправляет сообщение продавцу в Telegram с опциональными inline-кнопками.
 * Используется для уведомлений о новом авто, запросах на бронирование,
 * и ежедневных проверках актуальности (ТЗ п.8).
 */
export async function sendTelegramMessage(
  chatId: string,
  text: string,
  buttons?: InlineButton[][]
): Promise<{ ok: boolean; result?: unknown; description?: string }> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  };

  if (buttons) {
    body.reply_markup = { inline_keyboard: buttons };
  }

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return res.json();
}

/**
 * Отвечает на callback_query, чтобы у пользователя пропали "часики"
 * на нажатой inline-кнопке в Telegram.
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
): Promise<void> {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

/**
 * Редактирует текст уже отправленного сообщения (например, убирает кнопки
 * после того как продавец нажал "Продано").
 */
export async function editTelegramMessage(
  chatId: string,
  messageId: number,
  text: string
): Promise<void> {
  await fetch(`${TELEGRAM_API}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
    }),
  });
}

/**
 * Отправляет сообщение с кнопкой "Поделиться контактом" — нативный механизм
 * Telegram, позволяющий продавцу привязать аккаунт без ввода ID вручную.
 */
export async function sendTelegramMessageWithContactRequest(
  chatId: string,
  text: string
): Promise<void> {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: {
        keyboard: [[{ text: "📱 Поделиться номером", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }),
  });
}
