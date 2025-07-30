import { type NextRequest, NextResponse } from "next/server"
import { handleTelegramUpdate } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()
    await handleTelegramUpdate(update)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error handling Telegram webhook:", error)
    return NextResponse.json({ error: "Failed to handle webhook" }, { status: 500 })
  }
}
