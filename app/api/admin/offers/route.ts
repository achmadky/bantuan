import { NextResponse } from "next/server"
import { getAllOffers } from "@/lib/data"

export async function GET() {
  try {
    const offers = await getAllOffers()
    return NextResponse.json(offers)
  } catch (error) {
    console.error("Error fetching offers:", error)
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 })
  }
}
