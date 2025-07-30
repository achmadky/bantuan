import { type NextRequest, NextResponse } from "next/server"
import { deleteOffer } from "@/lib/data"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const success = await deleteOffer(id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting offer:", error)
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 })
  }
}
