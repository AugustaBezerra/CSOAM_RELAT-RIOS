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
  const localId = report.id || 'csoam_rel_' + Date.now();
  const reportToSave = { ...report, id: localId };

  // 1. SEMPRE grava localmente PRIMEIRO para ser 100% imediato e garantido
  cacheLocally(reportToSave);

  // 2. Se o Firestore estiver configurado, tenta sincronizar na nuvem com timeout de 2.5s
  if (db) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 2500)
      );

      const firestoreAction = async () => {
        const reportData = {
          ...reportToSave,
          atualizadoEm: serverTimestamp()
        };

        if (report.id && !report.id.startsWith('csoam_rel_') && !report.id.startsWith('local_')) {
          const docRef = doc(db, COLLECTION_NAME, report.id);
          await updateDoc(docRef, reportData);
          return report.id;
        } else {
          const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...reportData,
            criadoEm: serverTimestamp()
          });
          const cloudReport = { ...reportToSave, id: docRef.id };
          cacheLocally(cloudReport);
          return docRef.id;
        }
      };

      const finalId = await Promise.race([firestoreAction(), timeoutPromise]);
      return finalId;
    } catch (error) {
      console.warn("Firestore sync warning (salvo localmente com segurança):", error);
    }
  }

  return localId;
}

// Helper to fetch all reports from Firestore
export async function getReportsFromFirebase(): Promise<DailyReport[]> {
  const localReports = getLocalReports();

  if (db) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 2500)
      );

      const firestoreFetch = async () => {
        const q = query(collection(db, COLLECTION_NAME), orderBy('data', 'desc'));
        const snapshot = await getDocs(q);
        const cloudReports: DailyReport[] = [];
        snapshot.forEach(docSnap => {
          cloudReports.push({ id: docSnap.id, ...docSnap.data() } as DailyReport);
        });
        return cloudReports;
      };

      const fetched = await Promise.race([firestoreFetch(), timeoutPromise]);
      if (fetched && fetched.length > 0) {
        fetched.forEach(cr => cacheLocally(cr));
        return getLocalReports();
      }
    } catch (error) {
      console.warn("Firestore fetch warning (usando relatórios locais):", error);
    }
  }

  return localReports;
}

// Local Storage helpers
export function cacheLocally(report: DailyReport) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalReports();
    const index = existing.findIndex(r => (report.id && r.id === report.id) || r.data === report.data);
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

export function getLocalReports(): DailyReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('csoam_reports_cache');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function removeLocalReport(id?: string) {
  if (typeof window === 'undefined' || !id) return;
  try {
    const existing = getLocalReports();
    const filtered = existing.filter(r => r.id !== id);
    localStorage.setItem('csoam_reports_cache', JSON.stringify(filtered));
  } catch (e) {
    console.error("Local storage remove error:", e);
  }
}
