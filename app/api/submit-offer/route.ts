import { type NextRequest, NextResponse } from "next/server"
import { addPendingOffer } from "@/lib/data"
import { sendTelegramNotification } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, skill, city, phoneNumber, paymentRange, description } = body

    // Validate required fields
    if (!name || !skill || !city || !phoneNumber || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create the offer
    const offerId = await addPendingOffer({
      name,
      skill,
      city,
      phoneNumber,
      paymentRange,
      description,
      status: "pending",
      createdAt: new Date().toISOString(),
    })

    if (!offerId) {
      return NextResponse.json({ error: "Failed to create offer" }, { status: 500 })
    }

    // Send Telegram notification
    const offer = {
      id: offerId,
      name,
      skill,
      city,
      phoneNumber,
      paymentRange,
      description,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    }

    await sendTelegramNotification(offer)

    return NextResponse.json({
      success: true,
      message: "Penawaran bantuan berhasil dikirim dan menunggu persetujuan admin",
      offerId,
    })
  } catch (error) {
    console.error("Error submitting offer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
