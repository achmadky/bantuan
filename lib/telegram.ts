interface Offer {
  id: string
  name: string
  skill: string
  city: string
  paymentRange?: string
  description: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID

export async function sendTelegramNotification(offer: Offer) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) {
    console.warn("Kredensial Telegram tidak dikonfigurasi")
    return
  }

  const message = `
🆕 *Penawaran Bantuan Baru*

👤 *Nama:* ${offer.name}
🛠 *Keahlian:* ${offer.skill}
📍 *Lokasi:* ${offer.city}
${offer.paymentRange ? `💰 *Tarif:* ${offer.paymentRange}` : ""}

📝 *Deskripsi:*
${offer.description}

⏰ *Dikirim:* ${new Date(offer.createdAt).toLocaleString("id-ID")}
🆔 *ID:* ${offer.id}
  `.trim()

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Setujui", callback_data: `approve_${offer.id}` },
        { text: "❌ Tolak", callback_data: `reject_${offer.id}` },
      ],
    ],
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      }),
    })

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`)
    }
  } catch (error) {
    console.error("Gagal mengirim notifikasi Telegram:", error)
  }
}

export async function handleTelegramUpdate(update: any) {
  if (!update.callback_query) return

  const callbackQuery = update.callback_query
  const data = callbackQuery.data
  const messageId = callbackQuery.message.message_id

  if (data.startsWith("approve_") || data.startsWith("reject_")) {
    const [action, offerId] = data.split("_")

    // Import here to avoid circular dependency
    const { approveOffer, rejectOffer, getOfferById } = await import("./data")

    const offer = await getOfferById(offerId)
    if (!offer) {
      await answerCallbackQuery(callbackQuery.id, "Bantuan tidak ditemukan")
      return
    }

    if (action === "approve") {
      const success = await approveOffer(offerId)
      if (success) {
        await editMessageText(messageId, `✅ *DISETUJUI*\n\n${callbackQuery.message.text}`, null)
        await answerCallbackQuery(callbackQuery.id, "Bantuan disetujui!")
      } else {
        await answerCallbackQuery(callbackQuery.id, "Gagal menyetujui bantuan")
      }
    } else if (action === "reject") {
      const success = await rejectOffer(offerId)
      if (success) {
        await editMessageText(messageId, `❌ *DITOLAK*\n\n${callbackQuery.message.text}`, null)
        await answerCallbackQuery(callbackQuery.id, "Bantuan ditolak!")
      } else {
        await answerCallbackQuery(callbackQuery.id, "Gagal menolak bantuan")
      }
    }
  }
}

async function answerCallbackQuery(callbackQueryId: string, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    })
  } catch (error) {
    console.error("Gagal menjawab callback query:", error)
  }
}

async function editMessageText(messageId: number, text: string, replyMarkup: any) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) return

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_CHAT_ID,
        message_id: messageId,
        text,
        parse_mode: "Markdown",
        reply_markup: replyMarkup,
      }),
    })
  } catch (error) {
    console.error("Gagal mengedit pesan:", error)
  }
}
