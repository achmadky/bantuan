import { type NextRequest, NextResponse } from "next/server"
import { approveOffer, getOfferById } from "@/lib/data"

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

    // Approve the offer
    const success = await approveOffer(offerId)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Offer approved successfully",
        offer: { ...offer, status: "approved" },
      })
    } else {
      return NextResponse.json({ error: "Failed to approve offer" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error approving offer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
