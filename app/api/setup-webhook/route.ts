import { type NextRequest, NextResponse } from "next/server"
import { setTelegramWebhook, getTelegramWebhookInfo } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    // Use the correct domain for your deployment
    const webhookUrl = "https://v0-bantuin-app-requirements.vercel.app/api/telegram-webhook"
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
