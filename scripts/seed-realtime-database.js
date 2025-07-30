// Script to seed Firebase Realtime Database with initial approved offers
// Run this script to add some test data

const { initializeApp } = require("firebase/app")
const { getDatabase, ref, push, set } = require("firebase/database")

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

const sampleOffers = [
  {
    name: "Budi Santoso",
    skill: "Pembuatan Website",
    city: "Jakarta",
    paymentRange: "IDR 150.000-300.000/jam",
    description:
      "Full-stack developer dengan pengalaman 5 tahun di React, Node.js, dan database. Bisa membantu membuat website, aplikasi web, dan pengembangan API.",
    status: "approved",
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
  },
  {
    name: "Sari Dewi",
    skill: "Desain Grafis",
    city: "Bandung",
    paymentRange: "IDR 100.000-250.000/jam",
    description:
      "Desainer grafis kreatif yang mengkhususkan diri dalam branding, desain logo, dan materi pemasaran digital. Mahir menggunakan Adobe Creative Suite.",
    status: "approved",
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
  },
  {
    name: "Ahmad Rizki",
    skill: "Les Privat Matematika",
    city: "Surabaya",
    paymentRange: "IDR 75.000-125.000/jam",
    description:
      "Guru matematika berpengalaman 8 tahun. Mengajar SD, SMP, dan SMA. Metode pembelajaran yang mudah dipahami dan menyenangkan.",
    status: "approved",
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
  },
]

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...")

    const offersRef = ref(database, "offers")

    for (const offer of sampleOffers) {
      const newOfferRef = push(offersRef)
      await set(newOfferRef, offer)
      console.log(`✅ Added offer: ${offer.name} - ${offer.skill}`)
    }

    console.log("🎉 Database seeding completed successfully!")
    console.log("📝 Added", sampleOffers.length, "approved offers")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
