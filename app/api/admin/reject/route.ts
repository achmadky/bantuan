import { type NextRequest, NextResponse } from "next/server"
import { rejectOffer, getOfferById } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const { offerId } = await request.json()

    if (!offerId) {
      return NextResponse.json({ error: "Offer ID is required" }, { status: 400 })
    }

    // Check if offer exists and is pending
    const offer = await getOfferById(offerId)
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }

    if (offer.status !== "pending") {
      return NextResponse.json({ error: `Offer is already ${offer.status}` }, { status: 400 })
    }

    // Reject the offer
    const success = await rejectOffer(offerId)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Offer rejected successfully",
        offer: { ...offer, status: "rejected" },
      })
    } else {
      return NextResponse.json({ error: "Failed to reject offer" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error rejecting offer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
