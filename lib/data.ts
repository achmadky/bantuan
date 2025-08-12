import { ref, push, set, get, update, remove } from "firebase/database"
import { database } from "./firebase"

export interface Offer {
  id: string
  name: string
  skill: string
  city: string
  phoneNumber: string
  paymentRange?: string
  description: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

const OFFERS_PATH = "offers"

export async function getApprovedOffers(): Promise<Offer[]> {
  try {
    if (!database) {
      console.warn("Database not available")
      return []
    }

    const offersRef = ref(database, OFFERS_PATH)
    const snapshot = await get(offersRef)
    const offers: Offer[] = []

    if (snapshot.exists()) {
      const data = snapshot.val()
      Object.keys(data).forEach((key) => {
        const offer = data[key]
        if (offer.status === "approved") {
          offers.push({
            id: key,
            ...offer,
          })
        }
      })

      offers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      return offers
    }

    return []
  } catch (error) {
    console.error("Error getting approved offers:", error)
    return []
  }
}

export async function getAllOffers(): Promise<Offer[]> {
  try {
    if (!database) {
      console.warn("Database not available")
      return []
    }

    const offersRef = ref(database, OFFERS_PATH)
    const snapshot = await get(offersRef)
    const offers: Offer[] = []

    if (snapshot.exists()) {
      const data = snapshot.val()
      Object.keys(data).forEach((key) => {
        offers.push({
          id: key,
          ...data[key],
        })
      })

      offers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      return offers
    }

    return []
  } catch (error) {
    console.error("Error getting all offers:", error)
    return []
  }
}

export async function addPendingOffer(offer: Omit<Offer, "id">): Promise<string | null> {
  try {
    if (!database) {
      console.error("Database not available, cannot add offer")
      return null
    }

    const cleanOffer = {
      name: offer.name.trim(),
      skill: offer.skill.trim(),
      city: offer.city.trim(),
      phoneNumber: offer.phoneNumber.trim(),
      paymentRange: offer.paymentRange?.trim() || null,
      description: offer.description.trim(),
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    }

    const offersRef = ref(database, OFFERS_PATH)
    const newOfferRef = push(offersRef)
    await set(newOfferRef, cleanOffer)

    console.log(`New offer added with ID: ${newOfferRef.key}`)
    return newOfferRef.key
  } catch (error) {
    console.error("Error adding offer:", error)
    return null
  }
}

export async function approveOffer(id: string): Promise<boolean> {
  try {
    if (!database) {
      console.error("Database not available, cannot approve offer")
      return false
    }

    console.log(`Attempting to approve offer: ${id}`)
    const offerRef = ref(database, `${OFFERS_PATH}/${id}`)

    // First check if offer exists
    const snapshot = await get(offerRef)
    if (!snapshot.exists()) {
      console.error(`Offer ${id} does not exist`)
      return false
    }

    const currentOffer = snapshot.val()
    console.log(`Current offer status: ${currentOffer.status}`)

    // Update the offer status to approved
    await update(offerRef, {
      status: "approved",
      approvedAt: new Date().toISOString(),
    })

    console.log(`Offer ${id} approved successfully`)

    // Verify the update
    const updatedSnapshot = await get(offerRef)
    if (updatedSnapshot.exists()) {
      const updatedOffer = updatedSnapshot.val()
      console.log(`Verified offer status after update: ${updatedOffer.status}`)
      return updatedOffer.status === "approved"
    }

    return true
  } catch (error) {
    console.error("Error approving offer:", error)
    return false
  }
}

export async function rejectOffer(id: string): Promise<boolean> {
  try {
    if (!database) {
      console.error("Database not available, cannot reject offer")
      return false
    }

    console.log(`Attempting to reject offer: ${id}`)
    const offerRef = ref(database, `${OFFERS_PATH}/${id}`)

    // First check if offer exists
    const snapshot = await get(offerRef)
    if (!snapshot.exists()) {
      console.error(`Offer ${id} does not exist`)
      return false
    }

    const currentOffer = snapshot.val()
    console.log(`Current offer status: ${currentOffer.status}`)

    // Update the offer status to rejected
    await update(offerRef, {
      status: "rejected",
      rejectedAt: new Date().toISOString(),
    })

    console.log(`Offer ${id} rejected successfully`)

    // Verify the update
    const updatedSnapshot = await get(offerRef)
    if (updatedSnapshot.exists()) {
      const updatedOffer = updatedSnapshot.val()
      console.log(`Verified offer status after update: ${updatedOffer.status}`)
      return updatedOffer.status === "rejected"
    }

    return true
  } catch (error) {
    console.error("Error rejecting offer:", error)
    return false
  }
}

export async function deleteOffer(id: string): Promise<boolean> {
  try {
    if (!database) {
      console.error("Database not available, cannot delete offer")
      return false
    }

    const offerRef = ref(database, `${OFFERS_PATH}/${id}`)
    await remove(offerRef)
    return true
  } catch (error) {
    console.error("Error deleting offer:", error)
    return false
  }
}

export async function getOfferById(id: string): Promise<Offer | null> {
  try {
    if (!database) {
      console.warn("Database not available")
      return null
    }

    console.log(`Getting offer by ID: ${id}`)
    const offerRef = ref(database, `${OFFERS_PATH}/${id}`)
    const snapshot = await get(offerRef)

    if (snapshot.exists()) {
      const offer = {
        id: snapshot.key!,
        ...snapshot.val(),
      } as Offer
      console.log(`Found offer: ${offer.name} - ${offer.skill} (Status: ${offer.status})`)
      return offer
    } else {
      console.log(`Offer ${id} not found`)
      return null
    }
  } catch (error) {
    console.error("Error getting offer by ID:", error)
    return null
  }
}

export async function getOfferStats(): Promise<{
  total: number
  pending: number
  approved: number
  rejected: number
}> {
  try {
    const allOffers = await getAllOffers()
    return {
      total: allOffers.length,
      pending: allOffers.filter((o) => o.status === "pending").length,
      approved: allOffers.filter((o) => o.status === "approved").length,
      rejected: allOffers.filter((o) => o.status === "rejected").length,
    }
  } catch (error) {
    console.error("Error getting offer stats:", error)
    return { total: 0, pending: 0, approved: 0, rejected: 0 }
  }
}


export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export async function getApprovedOffersPaginated(
  page: number = 1,
  limit: number = 5,
  filters?: {
    skill?: string
    city?: string
  }
): Promise<PaginatedResponse<Offer>> {
  try {
    if (!database) {
      console.warn("Database not available")
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      }
    }

    const offersRef = ref(database, OFFERS_PATH)
    const snapshot = await get(offersRef)
    let offers: Offer[] = []

    if (snapshot.exists()) {
      const data = snapshot.val()
      Object.keys(data).forEach((key) => {
        const offer = data[key]
        if (offer.status === "approved") {
          offers.push({
            id: key,
            ...offer,
          })
        }
      })

      // Sort by creation date (newest first)
      offers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      // Apply filters
      if (filters?.skill) {
        offers = offers.filter((offer) => 
          offer.skill.toLowerCase().includes(filters.skill!.toLowerCase())
        )
      }

      if (filters?.city) {
        offers = offers.filter((offer) => 
          offer.city.toLowerCase().includes(filters.city!.toLowerCase())
        )
      }
    }

    // Calculate pagination
    const total = offers.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedOffers = offers.slice(startIndex, endIndex)

    return {
      data: paginatedOffers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  } catch (error) {
    console.error("Error getting paginated approved offers:", error)
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    }
  }
}


export interface RemovalRequest {
  id: string
  userId: string
  name: string
  phoneNumber: string
  reason: string
  status: "pending" | "approved" | "rejected"
  requestedAt: string
  processedAt?: string
}

const REMOVAL_REQUESTS_PATH = "removal_requests"

// Check if user exists by name and phone number
export async function findUserByNameAndPhone(name: string, phoneNumber: string): Promise<Offer | null> {
  try {
    if (!database) {
      console.warn("Database not available")
      return null
    }

    const offersRef = ref(database, OFFERS_PATH)
    const snapshot = await get(offersRef)
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      for (const [key, offer] of Object.entries(data)) {
        const offerData = offer as any
        if (offerData.name.toLowerCase().trim() === name.toLowerCase().trim() && 
            offerData.phoneNumber.trim() === phoneNumber.trim()) {
          return {
            id: key,
            ...offerData,
          } as Offer
        }
      }
    }
    
    return null
  } catch (error) {
    console.error("Error finding user:", error)
    return null
  }
}

// Check if user has pending removal request
export async function hasPendingRemovalRequest(userId: string): Promise<boolean> {
  try {
    if (!database) {
      console.warn("Database not available")
      return false
    }

    const requestsRef = ref(database, REMOVAL_REQUESTS_PATH)
    const snapshot = await get(requestsRef)
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      for (const request of Object.values(data)) {
        const requestData = request as any
        if (requestData.userId === userId && requestData.status === "pending") {
          return true
        }
      }
    }
    
    return false
  } catch (error) {
    console.error("Error checking pending removal request:", error)
    return false
  }
}

// Add removal request
export async function addRemovalRequest(request: Omit<RemovalRequest, "id">): Promise<string | null> {
  try {
    if (!database) {
      console.error("Database not available, cannot add removal request")
      return null
    }

    const cleanRequest = {
      userId: request.userId.trim(),
      name: request.name.trim(),
      phoneNumber: request.phoneNumber.trim(),
      reason: request.reason.trim(),
      status: "pending" as const,
      requestedAt: new Date().toISOString(),
    }

    const requestsRef = ref(database, REMOVAL_REQUESTS_PATH)
    const newRequestRef = push(requestsRef)
    await set(newRequestRef, cleanRequest)
    
    console.log("Removal request added successfully:", newRequestRef.key)
    return newRequestRef.key
  } catch (error) {
    console.error("Error adding removal request:", error)
    return null
  }
}

// Get removal request by ID
export async function getRemovalRequestById(id: string): Promise<RemovalRequest | null> {
  try {
    if (!database) {
      console.warn("Database not available")
      return null
    }

    const requestRef = ref(database, `${REMOVAL_REQUESTS_PATH}/${id}`)
    const snapshot = await get(requestRef)

    if (snapshot.exists()) {
      return {
        id: snapshot.key!,
        ...snapshot.val(),
      } as RemovalRequest
    }
    
    return null
  } catch (error) {
    console.error("Error getting removal request:", error)
    return null
  }
}

// Approve removal request (delete user and update request)
export async function approveRemovalRequest(requestId: string): Promise<boolean> {
  try {
    if (!database) {
      console.error("Database not available")
      return false
    }

    // Get the removal request
    const request = await getRemovalRequestById(requestId)
    if (!request) {
      console.error("Removal request not found")
      return false
    }

    if (request.status !== "pending") {
      console.error("Removal request is not pending")
      return false
    }

    // Delete the user's offer
    const success = await deleteOffer(request.userId)
    if (!success) {
      console.error("Failed to delete user offer")
      return false
    }

    // Update removal request status
    const requestRef = ref(database, `${REMOVAL_REQUESTS_PATH}/${requestId}`)
    await update(requestRef, {
      status: "approved",
      processedAt: new Date().toISOString(),
    })

    console.log(`Removal request ${requestId} approved and user ${request.userId} deleted`)
    return true
  } catch (error) {
    console.error("Error approving removal request:", error)
    return false
  }
}

// Reject removal request
export async function rejectRemovalRequest(requestId: string): Promise<boolean> {
  try {
    if (!database) {
      console.error("Database not available")
      return false
    }

    const request = await getRemovalRequestById(requestId)
    if (!request) {
      console.error("Removal request not found")
      return false
    }

    if (request.status !== "pending") {
      console.error("Removal request is not pending")
      return false
    }

    const requestRef = ref(database, `${REMOVAL_REQUESTS_PATH}/${requestId}`)
    await update(requestRef, {
      status: "rejected",
      processedAt: new Date().toISOString(),
    })

    console.log(`Removal request ${requestId} rejected`)
    return true
  } catch (error) {
    console.error("Error rejecting removal request:", error)
    return false
  }
}
