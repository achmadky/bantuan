import { ref, push, set, get, update, remove } from "firebase/database"
import { database } from "./firebase"

export interface Offer {
  id: string
  name: string
  skill: string
  city: string
  paymentRange?: string
  description: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

const OFFERS_PATH = "offers"

// Fallback data when database is not available
const fallbackOffers: Offer[] = [
  {
    id: "sample-1",
    name: "Budi Santoso",
    skill: "Pembuatan Website",
    city: "Jakarta",
    paymentRange: "IDR 150.000-300.000/jam",
    description:
      "Full-stack developer dengan pengalaman 5 tahun di React, Node.js, dan database. Bisa membantu membuat website, aplikasi web, dan pengembangan API.",
    status: "approved",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "sample-2",
    name: "Sari Dewi",
    skill: "Desain Grafis",
    city: "Bandung",
    paymentRange: "IDR 100.000-250.000/jam",
    description:
      "Desainer grafis kreatif yang mengkhususkan diri dalam branding, desain logo, dan materi pemasaran digital. Mahir menggunakan Adobe Creative Suite.",
    status: "approved",
    createdAt: "2024-01-14T15:30:00Z",
  },
  {
    id: "sample-3",
    name: "Ahmad Rizki",
    skill: "Les Privat Matematika",
    city: "Surabaya",
    paymentRange: "IDR 75.000-125.000/jam",
    description:
      "Guru matematika berpengalaman 8 tahun. Mengajar SD, SMP, dan SMA. Metode pembelajaran yang mudah dipahami dan menyenangkan.",
    status: "approved",
    createdAt: "2024-01-13T09:15:00Z",
  },
]

export async function getApprovedOffers(): Promise<Offer[]> {
  try {
    if (!database) {
      console.warn("Database not available, using fallback data")
      return fallbackOffers.filter((offer) => offer.status === "approved")
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

      // Sort by createdAt descending (newest first)
      offers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      return offers
    }

    // Return empty array if no data exists, don't use fallback
    return []
  } catch (error) {
    console.error("Error getting approved offers:", error)
    return []
  }
}

export async function getAllOffers(): Promise<Offer[]> {
  try {
    if (!database) {
      console.warn("Database not available, using fallback data")
      return fallbackOffers
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

      // Sort by createdAt descending (newest first)
      offers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      return offers
    }

    // Return empty array if no data exists
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

    // Clean the data before saving
    const cleanOffer = {
      name: offer.name.trim(),
      skill: offer.skill.trim(),
      city: offer.city.trim(),
      paymentRange: offer.paymentRange?.trim() || null,
      description: offer.description.trim(),
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    }

    const offersRef = ref(database, OFFERS_PATH)
    const newOfferRef = push(offersRef)
    await set(newOfferRef, cleanOffer)

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

    const offerRef = ref(database, `${OFFERS_PATH}/${id}`)
    await update(offerRef, {
      status: "approved",
      approvedAt: new Date().toISOString(),
    })
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

    const offerRef = ref(database, `${OFFERS_PATH}/${id}`)
    await update(offerRef, {
      status: "rejected",
      rejectedAt: new Date().toISOString(),
    })
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
      console.warn("Database not available, searching fallback data")
      return fallbackOffers.find((offer) => offer.id === id) || null
    }

    const offerRef = ref(database, `${OFFERS_PATH}/${id}`)
    const snapshot = await get(offerRef)

    if (snapshot.exists()) {
      return {
        id: snapshot.key!,
        ...snapshot.val(),
      } as Offer
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting offer by ID:", error)
    return fallbackOffers.find((offer) => offer.id === id) || null
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
