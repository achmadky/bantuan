import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig)

// Initialize Realtime Database with error handling
let database: any = null

try {
  // Check if databaseURL is provided
  if (!firebaseConfig.databaseURL) {
    console.warn("Firebase Realtime Database URL not provided. Database features will be disabled.")
  } else {
    database = getDatabase(app)
    console.log("Firebase Realtime Database initialized successfully")
  }
} catch (error) {
  console.error("Failed to initialize Firebase Realtime Database:", error)
  console.warn("Database features will be disabled. Please check your Firebase configuration.")
}

export { database }
