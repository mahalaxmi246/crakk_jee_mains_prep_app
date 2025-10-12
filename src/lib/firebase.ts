// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

// --- (optional) sanity checks while setting up ---
const requiredEnv = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
  // The following two are optional depending on your Firebase use,
  // but include them if you added them in the console:
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
] as const;

for (const key of requiredEnv) {
  // Only warn to avoid hard crashes in dev if something is missing
  if (import.meta.env[key] === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[firebase] Missing env: ${key}`);
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

// Initialize app once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// Persist auth state to localStorage (survives tabs/refresh)
export const authReady = setPersistence(auth, browserLocalPersistence).catch((e) => {
  // eslint-disable-next-line no-console
  console.error("[firebase] setPersistence failed:", e);
});

// Use the browser language for email/phone/verification templates
auth.useDeviceLanguage();

// Google provider (force account chooser each time)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export default app;

;(window as any).firebaseAuth = auth;