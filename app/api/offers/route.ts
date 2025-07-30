import { NextResponse } from "next/server"
import { getApprovedOffers } from "@/lib/data"

export async function GET() {
  try {
    const offers = await getApprovedOffers()
    return NextResponse.json(offers)
  } catch (error) {
    console.error("Error fetching offers:", error)
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 })
  }
}
