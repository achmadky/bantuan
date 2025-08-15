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
    console.log("❌ No callback_query found in update")
    return
  }

  const callbackQuery = update.callback_query
  const data = callbackQuery.data
  const messageId = callbackQuery.message?.message_id
  const chatId = callbackQuery.message?.chat?.id

  console.log(`📋 Processing callback data: ${data}`)
  console.log(`📧 Message ID: ${messageId}, Chat ID: ${chatId}`)
  console.log(`👤 User: ${callbackQuery.from?.first_name} ${callbackQuery.from?.last_name} (${callbackQuery.from?.username})`)

  // Handle removal request callbacks
  if (data && data.startsWith("removal_")) {
    console.log("🗑️ Handling removal request callback")
    await handleTelegramCallback(callbackQuery)
    return
  }

  // Handle offer callbacks
  if (!data || (!data.startsWith("approve_") && !data.startsWith("reject_"))) {
    console.log(`❌ Invalid callback data: ${data}`)
    await answerCallbackQuery(callbackQuery.id, "❌ Invalid action")
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

interface RemovalRequest {
  id: string
  name: string
  phoneNumber: string
  reason: string
  requestedAt: string
  status: "pending" | "approved" | "rejected"
}

export async function sendRemovalRequestNotification(request: RemovalRequest) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) {
    console.warn("Telegram credentials not configured")
    return
  }

  const message = `🗑️ *Permohonan Penghapusan*\n\n` +
    `👤 *Name:* ${request.name}\n` +
    `📱 *Phone:* ${request.phoneNumber}\n` +
    `📝 *Reason:* ${request.reason}\n` +
    `🕐 *Requested:* ${new Date(request.requestedAt).toLocaleString('id-ID')}\n\n` +
    `Please review and take action:`

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "✅ Approve",
          callback_data: `removal_approve_${request.id}`
        },
        {
          text: "❌ Reject",
          callback_data: `removal_reject_${request.id}`
        }
      ]
    ]
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to send removal request notification:', errorText)
    } else {
      console.log('Removal request notification sent successfully')
    }
  } catch (error) {
    console.error('Error sending removal request notification:', error)
  }
}

// Update the existing handleTelegramCallback function
export async function handleTelegramCallback(callbackQuery: any) {
  const { data: callbackData } = callbackQuery
  const timestamp = new Date().toISOString()
  
  console.log(`=== CALLBACK PROCESSING START === ${timestamp}`)
  console.log(`Received callback: ${callbackData}`)
  console.log(`Callback query ID: ${callbackQuery.id}`)
  console.log(`Message ID: ${callbackQuery.message?.message_id}`)
  console.log(`Chat ID: ${callbackQuery.message?.chat?.id}`)
  console.log(`User:`, callbackQuery.from)

  // Handle removal request callbacks
  if (callbackData.startsWith('removal_')) {
    // const [, action, requestId] = callbackData.split('_') FIX THIS LOGIC DUE OUR ID USING _, IT WOULD SPLIT ALL OF THEM
    const firstUnderscore = callbackData.indexOf('_'); //SIMPLE LOGIC FOR NOT LEAVING THE REST
    const action = callbackData.slice(0, firstUnderscore);
    const requestId = callbackData.slice(firstUnderscore + 1);

    
    console.log(`=== REMOVAL REQUEST CALLBACK ===`)
    console.log(`Action: ${action}`)
    console.log(`Request ID: ${requestId}`)
    
    if (!requestId) {
      console.error('❌ Invalid removal callback data:', callbackData)
      await answerCallbackQuery(callbackQuery.id, '❌ Invalid request ID')
      return { success: false, error: 'Invalid request ID' }
    }

    console.log(`🔍 Processing removal ${action} for request ${requestId}`)

    try {
      // Get removal request details
      console.log(`📋 Fetching removal request details...`)
      const { getRemovalRequestById } = await import("./data")
      const request = await getRemovalRequestById(requestId)
      
      if (!request) {
        console.error(`❌ Removal request ${requestId} not found in database`)
        await answerCallbackQuery(callbackQuery.id, '❌ Request not found')
        return { success: false, error: 'Request not found' }
      }

      console.log(`✅ Found removal request:`, {
        id: request.id,
        name: request.name,
        phoneNumber: request.phoneNumber,
        status: request.status,
        reason: request.reason
      })

      if (request.status !== "pending") {
        console.log(`⚠️ Removal request ${requestId} is not pending (current status: ${request.status})`)
        await answerCallbackQuery(callbackQuery.id, `⚠️ Request already ${request.status}`)
        return { success: false, error: `Request already ${request.status}` }
      }

      let success = false
      let statusText = ""
      let actionText = ""
      let responseMessage = ""

      if (action === "approve") {
        console.log(`🔄 Attempting to approve removal request ${requestId}...`)
        const { approveRemovalRequest } = await import("./data")
        success = await approveRemovalRequest(requestId)
        statusText = "APPROVED & USER DELETED"
        actionText = "approved and user data deleted"
        responseMessage = success ? "✅ Removal request approved and user deleted successfully!" : "❌ Failed to approve removal request"
      } else if (action === "reject") {
        console.log(`🔄 Attempting to reject removal request ${requestId}...`)
        const { rejectRemovalRequest } = await import("./data")
        success = await rejectRemovalRequest(requestId)
        statusText = "REJECTED"
        actionText = "rejected"
        responseMessage = success ? "✅ Removal request rejected successfully!" : "❌ Failed to reject removal request"
      } else {
        console.error(`❌ Invalid action: ${action}`)
        await answerCallbackQuery(callbackQuery.id, '❌ Invalid action')
        return { success: false, error: 'Invalid action' }
      }

      console.log(`📊 Action result: ${success ? 'SUCCESS' : 'FAILED'}`)

      if (success) {
        console.log(`✅ Removal request ${requestId} ${actionText} successfully`)
        
        // Update the message
        const updatedMessage = `🗑️ *REMOVAL REQUEST - ${statusText}*\n\n` +
          `👤 *Name:* ${request.name}\n` +
          `📱 *Phone:* ${request.phoneNumber}\n` +
          `📝 *Reason:* ${request.reason}\n` +
          `🕐 *Requested:* ${new Date(request.requestedAt).toLocaleString('id-ID')}\n` +
          `✅ *Processed:* ${new Date().toLocaleString('id-ID')}\n\n` +
          `*Status:* ${statusText}`

        console.log(`📝 Updating Telegram message...`)
        try {
          await editMessageText(callbackQuery.message.chat.id, callbackQuery.message.message_id, updatedMessage, null)
          console.log(`✅ Message updated successfully`)
        } catch (editError) {
          console.error(`❌ Failed to update message:`, editError)
        }
        
        console.log(`📤 Sending success callback response...`)
        await answerCallbackQuery(callbackQuery.id, responseMessage)
        
        console.log(`✅ Callback processing completed successfully`)
        
        return { success: true, action, requestId, status: statusText }
      } else {
        console.error(`❌ Failed to ${action} removal request ${requestId}`)
        console.log(`📤 Sending failure callback response...`)
        await answerCallbackQuery(callbackQuery.id, responseMessage)
        return { success: false, error: `Failed to ${action} request` }
      }
    } catch (error) {
      console.error(`💥 Error processing removal request callback:`, error)
      console.error(`Error details:`, {
        message: (error as Error).message,
        stack: (error as Error).stack,
        callbackData,
        requestId
      })
      await answerCallbackQuery(callbackQuery.id, '❌ System error occurred')
      return { success: false, error: 'System error', details: (error as Error).message }
    }
    
    console.log(`=== CALLBACK PROCESSING END ===`)
    return
  }

  // ... existing offer callback handling code ...
}
