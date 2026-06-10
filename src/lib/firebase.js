import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const FRIDGE_DOC_ID = 'bhavesh-fridge'
const COLLECTION = 'fridges'

export async function loadIngredients() {
  const ref = doc(db, COLLECTION, FRIDGE_DOC_ID)
  const snap = await getDoc(ref)
  if (snap.exists()) return snap.data().ingredients ?? []
  return []
}

export async function saveIngredients(ingredients) {
  const ref = doc(db, COLLECTION, FRIDGE_DOC_ID)
  await setDoc(ref, { ingredients }, { merge: true })
}
