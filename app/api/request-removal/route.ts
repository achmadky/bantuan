import { type NextRequest, NextResponse } from "next/server"
import { findUserByNameAndPhone, hasPendingRemovalRequest, addRemovalRequest } from "@/lib/data"
import { sendRemovalRequestNotification } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phoneNumber, reason } = body

    // Validate required fields
    if (!name || !phoneNumber || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find user by name and phone number
    const user = await findUserByNameAndPhone(name, phoneNumber)
    if (!user) {
      return NextResponse.json({ error: "No matching record found" }, { status: 404 })
    }

    // Check if user already has a pending removal request
    const hasPending = await hasPendingRemovalRequest(user.id)
    if (hasPending) {
      return NextResponse.json({ error: "You already have a pending removal request" }, { status: 400 })
    }

    // Create removal request
    const requestId = await addRemovalRequest({
      userId: user.id,
      name,
      phoneNumber,
      reason,
      status: "pending",
      requestedAt: new Date().toISOString(),
    })

    if (!requestId) {
      return NextResponse.json({ error: "Failed to create removal request" }, { status: 500 })
    }

    // Send Telegram notification to admin
    const removalRequest = {
      id: requestId,
      userId: user.id,
      name,
      phoneNumber,
      reason,
      status: "pending" as const,
      requestedAt: new Date().toISOString(),
    }

    await sendRemovalRequestNotification(removalRequest)

    return NextResponse.json({
      success: true,
      message: "Removal request submitted successfully and is pending admin approval",
    })
  } catch (error) {
    console.error("Error submitting removal request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}