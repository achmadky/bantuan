import { type NextRequest, NextResponse } from "next/server"
import { approveRemovalRequest, getRemovalRequestById } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const { requestId } = await request.json()

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 })
    }

    // Check if request exists and is pending
    const removalRequest = await getRemovalRequestById(requestId)
    if (!removalRequest) {
      return NextResponse.json({ error: "Removal request not found" }, { status: 404 })
    }

    if (removalRequest.status !== "pending") {
      return NextResponse.json({ error: "Removal request is not pending" }, { status: 400 })
    }

    // Approve the removal request (this will delete the user and update request status)
    const success = await approveRemovalRequest(requestId)
    
    if (success) {
      // Invalidate cache since data has changed
    
      
      return NextResponse.json({ 
        success: true, 
        message: "Removal request approved and user deleted successfully" 
      })
    } else {
      return NextResponse.json({ error: "Failed to approve removal request" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error approving removal request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}