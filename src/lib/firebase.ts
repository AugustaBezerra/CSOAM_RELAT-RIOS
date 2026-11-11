import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { DailyReport } from './types';

const DEFAULT_KEY_B64 = "QUl6YVN5RGZud3k1MWhab0h5SGVONWQ5X2ZUR3B6YnA4YmtnOWlz";

const getApiKey = () => {
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  }
  try {
    if (typeof window !== 'undefined') {
      return window.atob(DEFAULT_KEY_B64);
    }
    return Buffer.from(DEFAULT_KEY_B64, 'base64').toString('utf-8');
  } catch (e) {
    return "";
  }
};

const firebaseConfig = {
  apiKey: getApiKey(),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "csoam-relatorios.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "csoam-relatorios",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "csoam-relatorios.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "384351917015",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:384351917015:web:c1d765e245db62ac66f192",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-2VJ2P12VQK"
};

// Initialize Firebase App only if API key exists
const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);

let app = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn("Firebase initialization warning:", err);
  }
}

export { auth, db };

const COLLECTION_NAME = 'relatorios_diarios';

// Helper to save report in Firestore (with localStorage cache fallback)
export async function saveReportToFirebase(report: DailyReport): Promise<string> {
  if (db) {
    try {
      const reportData = {
        ...report,
        atualizadoEm: serverTimestamp()
      };

      if (report.id && !report.id.startsWith('local_')) {
        const docRef = doc(db, COLLECTION_NAME, report.id);
        await updateDoc(docRef, reportData);
        cacheLocally(report);
        return report.id;
      } else {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
          ...reportData,
          criadoEm: serverTimestamp()
        });
        const newReport = { ...report, id: docRef.id };
        cacheLocally(newReport);
        return docRef.id;
      }
    } catch (error) {
      console.warn("Firestore save error, falling back to local storage:", error);
    }
  }

  const localId = report.id || 'local_' + Date.now();
  const localReport = { ...report, id: localId };
  cacheLocally(localReport);
  return localId;
}

// Helper to fetch all reports from Firestore
export async function getReportsFromFirebase(): Promise<DailyReport[]> {
  if (db) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('data', 'desc'));
      const snapshot = await getDocs(q);
      const reports: DailyReport[] = [];
      snapshot.forEach(docSnap => {
        reports.push({ id: docSnap.id, ...docSnap.data() } as DailyReport);
      });

      if (reports.length > 0) {
        return reports;
      }
    } catch (error) {
      console.warn("Firestore fetch error, reading local cache:", error);
    }
  }
  return getLocalReports();
}

// Local Storage helpers
function cacheLocally(report: DailyReport) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalReports();
    const index = existing.findIndex(r => r.id === report.id || r.data === report.data);
    if (index >= 0) {
      existing[index] = report;
    } else {
      existing.unshift(report);
    }
    localStorage.setItem('csoam_reports_cache', JSON.stringify(existing));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

function getLocalReports(): DailyReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('csoam_reports_cache');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}
