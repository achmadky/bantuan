import { type NextRequest, NextResponse } from "next/server"
import { addPendingOffer } from "@/lib/data"
import { sendTelegramNotification } from "@/lib/telegram"
import { validateOffer } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the input data
    const validation = validateOffer(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Data tidak valid",
          details: validation.errors,
        },
        { status: 400 },
      )
    }

    const { name, skill, city, paymentRange, description } = validation.data!

    // Create new offer
    const newOffer = {
      name,
      skill,
      city,
      paymentRange,
      description,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    }

    // Add to Firebase
    const offerId = await addPendingOffer(newOffer)

    if (!offerId) {
      return NextResponse.json({ error: "Gagal menyimpan bantuan" }, { status: 500 })
    }

    // Send Telegram notification with the Firebase document ID
    try {
      await sendTelegramNotification({ ...newOffer, id: offerId })
    } catch (telegramError) {
      console.error("Telegram notification failed:", telegramError)
      // Don't fail the request if Telegram fails
    }

    return NextResponse.json({
      success: true,
      id: offerId,
      message: "Bantuan berhasil dikirim untuk ditinjau",
    })
  } catch (error) {
    console.error("Error submitting offer:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
