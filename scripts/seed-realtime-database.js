const { initializeApp } = require("firebase/app")
const { getDatabase, ref, set } = require("firebase/database")

// Firebase configuration - replace with your config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

// Sample data to seed
const sampleOffers = {
  "offer-1": {
    name: "Budi Santoso",
    skill: "Pembuatan Website",
    city: "Jakarta",
    phoneNumber: "081234567890",
    paymentRange: "IDR 150.000-300.000/jam",
    description:
      "Full-stack developer dengan pengalaman 5 tahun di React, Node.js, dan database. Bisa membantu membuat website, aplikasi web, dan pengembangan API.",
    status: "approved",
    createdAt: "2024-01-15T10:00:00Z",
    approvedAt: "2024-01-15T11:00:00Z",
  },
  "offer-2": {
    name: "Sari Dewi",
    skill: "Desain Grafis",
    city: "Bandung",
    phoneNumber: "081234567891",
    paymentRange: "IDR 100.000-250.000/jam",
    description:
      "Desainer grafis kreatif yang mengkhususkan diri dalam branding, desain logo, dan materi pemasaran digital. Mahir menggunakan Adobe Creative Suite.",
    status: "approved",
    createdAt: "2024-01-14T15:30:00Z",
    approvedAt: "2024-01-14T16:30:00Z",
  },
  "offer-3": {
    name: "Ahmad Rizki",
    skill: "Les Privat Matematika",
    city: "Surabaya",
    phoneNumber: "081234567892",
    paymentRange: "IDR 75.000-125.000/jam",
    description:
      "Guru matematika berpengalaman 8 tahun. Mengajar SD, SMP, dan SMA. Metode pembelajaran yang mudah dipahami dan menyenangkan.",
    status: "approved",
    createdAt: "2024-01-13T09:15:00Z",
    approvedAt: "2024-01-13T10:15:00Z",
  },
}

async function seedDatabase() {
  try {
    console.log("Starting database seeding...")

    // Set the offers data
    await set(ref(database, "offers"), sampleOffers)

    console.log("✅ Database seeded successfully!")
    console.log("Added offers:", Object.keys(sampleOffers).length)

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
