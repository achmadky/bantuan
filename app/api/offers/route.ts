import { NextRequest, NextResponse } from "next/server"
import { getApprovedOffersPaginated } from "@/lib/data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '5')
    
    // Get filter parameters
    const skill = searchParams.get('skill') || undefined
    const city = searchParams.get('city') || undefined
    
    const filters = {
      ...(skill && { skill }),
      ...(city && { city })
    }

    const result = await getApprovedOffersPaginated(page, limit, Object.keys(filters).length > 0 ? filters : undefined)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching offers:", error)
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 })
  }
}
