import { type NextRequest, NextResponse } from "next/server"
import { setTelegramWebhook, getTelegramWebhookInfo } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    // Get webhook URL from request body or use default
    let webhookUrl = "https://bantuan-kita.vercel.app/api/telegram-webhook"
    
    try {
      const body = await request.json()
      if (body.webhookUrl) {
        webhookUrl = body.webhookUrl
      }
    } catch (e) {
      // If no body or invalid JSON, use default URL
      console.log("No webhook URL provided in request body, using default")
    }
    
    console.log(`Setting webhook URL to: ${webhookUrl}`)
    const result = await setTelegramWebhook(webhookUrl)

    return NextResponse.json({
      success: true,
      message: "Webhook set successfully",
      result,
      webhookUrl,
    })
  } catch (error) {
    console.error("Error setting webhook:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to set webhook",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const info = await getTelegramWebhookInfo()
    return NextResponse.json({
      success: true,
      webhookInfo: info,
    })
  } catch (error) {
    console.error("Error getting webhook info:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get webhook info",
      },
      { status: 500 },
    )
  }
}
