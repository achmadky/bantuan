interface Offer {
  id: string
  name: string
  skill: string
  city: string
  phoneNumber: string
  paymentRange?: string
  description: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID

export async function sendTelegramNotification(offer: Offer) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) {
    console.warn("Telegram credentials not configured")
    return
  }

  const message = `🆕 *Penawaran Bantuan Baru*

👤 *Nama:* ${offer.name}
📱 *No. HP:* ${offer.phoneNumber}
🛠 *Keahlian:* ${offer.skill}
📍 *Lokasi:* ${offer.city}
${offer.paymentRange ? `💰 *Tarif:* ${offer.paymentRange}` : ""}

📝 *Deskripsi:*
${offer.description}

⏰ *Dikirim:* ${new Date(offer.createdAt).toLocaleString("id-ID")}
🆔 *ID:* ${offer.id}`

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Setujui", callback_data: `approve_${offer.id}` },
        { text: "❌ Tolak", callback_data: `reject_${offer.id}` },
      ],
    ],
  }

  try {
    console.log("Sending Telegram notification for offer:", offer.id)
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
      const errorText = await response.text()
      console.error(`Telegram API error: ${response.status} - ${errorText}`)
      throw new Error(`Telegram API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Telegram notification sent successfully:", result)
  } catch (error) {
    console.error("Failed to send Telegram notification:", error)
  }
}

export async function handleTelegramUpdate(update: any) {
  console.log("=== Processing Telegram Update ===")
  console.log("Update object:", JSON.stringify(update, null, 2))

  if (!update.callback_query) {
    console.log("No callback_query found in update")
    return
  }

  const callbackQuery = update.callback_query
  const data = callbackQuery.data
  const messageId = callbackQuery.message.message_id
  const chatId = callbackQuery.message.chat.id

  console.log(`Processing callback data: ${data}`)
  console.log(`Message ID: ${messageId}, Chat ID: ${chatId}`)

  if (!data || (!data.startsWith("approve_") && !data.startsWith("reject_"))) {
    console.log(`Invalid callback data: ${data}`)
    await answerCallbackQuery(callbackQuery.id, "Invalid action")
    return
  }

  const [action, offerId] = data.split("_")

  if (!offerId) {
    console.log("No offer ID found in callback data")
    await answerCallbackQuery(callbackQuery.id, "Invalid offer ID")
    return
  }

  console.log(`Action: ${action}, Offer ID: ${offerId}`)

  try {
    // Import here to avoid circular dependency
    const { approveOffer, rejectOffer, getOfferById } = await import("./data")

    const offer = await getOfferById(offerId)
    if (!offer) {
      console.log(`Offer ${offerId} not found`)
      await answerCallbackQuery(callbackQuery.id, "Bantuan tidak ditemukan")
      return
    }

    console.log(`Found offer: ${offer.name} - ${offer.skill} (Status: ${offer.status})`)

    if (offer.status !== "pending") {
      console.log(`Offer ${offerId} is not pending (current status: ${offer.status})`)
      await answerCallbackQuery(callbackQuery.id, `Bantuan sudah ${offer.status}`)
      return
    }

    let success = false
    let statusText = ""
    let actionText = ""

    if (action === "approve") {
      console.log(`Attempting to approve offer ${offerId}`)
      success = await approveOffer(offerId)
      statusText = "DISETUJUI"
      actionText = "disetujui"
    } else if (action === "reject") {
      console.log(`Attempting to reject offer ${offerId}`)
      success = await rejectOffer(offerId)
      statusText = "DITOLAK"
      actionText = "ditolak"
    }

    if (success) {
      const updatedMessage = `${action === "approve" ? "✅" : "❌"} *${statusText}*

👤 *Nama:* ${offer.name}
📱 *No. HP:* ${offer.phoneNumber}
🛠 *Keahlian:* ${offer.skill}
📍 *Lokasi:* ${offer.city}
${offer.paymentRange ? `💰 *Tarif:* ${offer.paymentRange}` : ""}

📝 *Deskripsi:*
${offer.description}

⏰ *Dikirim:* ${new Date(offer.createdAt).toLocaleString("id-ID")}
🆔 *ID:* ${offer.id}

*Status: ${statusText}*`

      await editMessageText(chatId, messageId, updatedMessage, null)
      await answerCallbackQuery(callbackQuery.id, `✅ Bantuan berhasil ${actionText}!`)
      console.log(`Offer ${offerId} ${actionText} successfully`)
    } else {
      await answerCallbackQuery(
        callbackQuery.id,
        `❌ Gagal ${actionText === "disetujui" ? "menyetujui" : "menolak"} bantuan`,
      )
      console.log(`Failed to ${action} offer ${offerId}`)
    }
  } catch (error) {
    console.error(`Error processing ${action} for offer ${offerId}:`, error)
    await answerCallbackQuery(callbackQuery.id, "Terjadi kesalahan sistem")
  }
}

async function answerCallbackQuery(callbackQueryId: string, text: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log("No bot token available for callback query")
    return
  }

  try {
    console.log(`Answering callback query: ${text}`)
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to answer callback query: ${response.status} - ${errorText}`)
    } else {
      console.log("Callback query answered successfully")
    }
  } catch (error) {
    console.error("Error answering callback query:", error)
  }
}

async function editMessageText(chatId: string | number, messageId: number, text: string, replyMarkup: any) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log("No bot token available for message editing")
    return
  }

  try {
    console.log(`Editing message ${messageId} in chat ${chatId}`)
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: "Markdown",
        reply_markup: replyMarkup,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to edit message: ${response.status} - ${errorText}`)
    } else {
      console.log("Message edited successfully")
    }
  } catch (error) {
    console.error("Error editing message:", error)
  }
}

export async function setTelegramWebhook(webhookUrl: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured")
  }

  try {
    console.log(`Setting webhook to: ${webhookUrl}`)
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["callback_query", "message"],
        drop_pending_updates: true,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Failed to set webhook: ${result.description}`)
    }

    console.log("Webhook set successfully:", result)
    return result
  } catch (error) {
    console.error("Error setting webhook:", error)
    throw error
  }
}

export async function getTelegramWebhookInfo() {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured")
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`)
    const result = await response.json()

    console.log("Webhook info:", result)
    return result
  } catch (error) {
    console.error("Error getting webhook info:", error)
    throw error
  }
}
