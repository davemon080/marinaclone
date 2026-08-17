import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

let configData: Record<string, any> = {};
try {
  // @ts-ignore
  configData = (await import('../firebase-applet-config.json')).default || {};
} catch (_) {
  configData = {};
}

export const firebaseConfig = {
  apiKey: configData.apiKey || process.env.FIREBASE_API_KEY || '',
  authDomain: configData.authDomain || '',
  projectId: configData.projectId || '',
  storageBucket: configData.storageBucket || '',
  messagingSenderId: configData.messagingSenderId || '',
  appId: configData.appId || ''
};

// Initialize Firebase App safely
const app = !getApps().length && firebaseConfig.projectId
  ? initializeApp(firebaseConfig)
  : (getApps().length ? getApp() : initializeApp({ projectId: 'marina-mismo-app' }));

// Initialize Firestore with custom database ID
export const db = configData.firestoreDatabaseId 
  ? getFirestore(app, configData.firestoreDatabaseId)
  : getFirestore(app);
export const defaultDb = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;

