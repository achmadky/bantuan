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
