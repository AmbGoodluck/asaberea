// Firebase client SDK (browser). Uses only public NEXT_PUBLIC_* keys.
import { getApps, getApp, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// True once the project keys are present in the environment.
export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | null = null;
function getClientApp(): FirebaseApp | null {
  if (!firebaseEnabled) return null;
  if (!app) app = getApps().length ? getApp() : initializeApp(config);
  return app;
}

export function clientAuth(): Auth | null {
  const a = getClientApp();
  return a ? getAuth(a) : null;
}
export function clientDb(): Firestore | null {
  const a = getClientApp();
  return a ? getFirestore(a) : null;
}
export function clientStorage(): FirebaseStorage | null {
  const a = getClientApp();
  return a ? getStorage(a) : null;
}
export const googleProvider = new GoogleAuthProvider();
