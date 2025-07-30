import { type NextRequest, NextResponse } from "next/server"
import { handleTelegramUpdate } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    console.log("=== Telegram Webhook Received ===")
    const update = await request.json()
    console.log("Update data:", JSON.stringify(update, null, 2))

    await handleTelegramUpdate(update)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error handling Telegram webhook:", error)
    return NextResponse.json({ error: "Failed to handle webhook" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "Telegram webhook endpoint is active",
    timestamp: new Date().toISOString(),
  })
}
