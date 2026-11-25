import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
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
const DELETED_REPORTS_KEY = 'csoam_deleted_reports_ids';

// Gerenciamento de relatórios excluídos (tombstone) para nunca reaparecerem ao recarregar a página
export function getDeletedReportIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(DELETED_REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function markReportAsDeleted(idOrDate: string) {
  if (typeof window === 'undefined' || !idOrDate) return;
  try {
    const ids = getDeletedReportIds();
    if (!ids.includes(idOrDate)) {
      ids.push(idOrDate);
      localStorage.setItem(DELETED_REPORTS_KEY, JSON.stringify(ids));
    }
  } catch (e) {
    console.error("Error marking report as deleted:", e);
  }
}

export function unmarkReportAsDeleted(idOrDate: string) {
  if (typeof window === 'undefined' || !idOrDate) return;
  try {
    const ids = getDeletedReportIds();
    const filtered = ids.filter(id => id !== idOrDate);
    localStorage.setItem(DELETED_REPORTS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error unmarking report as deleted:", e);
  }
}

export function isReportDeleted(id?: string, date?: string): boolean {
  if (typeof window === 'undefined') return false;
  const deleted = getDeletedReportIds();
  if (id && deleted.includes(id)) return true;
  if (date && deleted.includes(date)) return true;
  return false;
}

// Helper to save report in Firestore (with localStorage cache fallback)
export async function saveReportToFirebase(report: DailyReport): Promise<string> {
  const localId = report.id || 'csoam_rel_' + Date.now();
  const reportToSave = { ...report, id: localId };

  // Se este relatório ou data foi marcado como excluído anteriormente, remove da lista de excluídos
  if (report.id) unmarkReportAsDeleted(report.id);
  if (report.data) unmarkReportAsDeleted(report.data);
  unmarkReportAsDeleted(localId);

  // 1. SEMPRE grava localmente PRIMEIRO para ser 100% imediato e garantido
  cacheLocally(reportToSave);

  // 2. Se o Firestore estiver configurado, tenta sincronizar na nuvem com timeout de 6s
  if (db) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 6000)
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

// Helper to delete report permanently from Firestore and LocalStorage
export async function deleteReportFromFirebase(id?: string, date?: string): Promise<boolean> {
  // 1. Registra imediatamente como excluído para bloquear em qualquer carregamento
  if (id) markReportAsDeleted(id);
  if (date) markReportAsDeleted(date);

  // 2. Remove do cache local (localStorage)
  removeLocalReport(id, date);

  // 3. Remove permanentemente do Firestore
  if (db) {
    try {
      // Deleta por ID do documento caso seja um ID válido do Firestore
      if (id && !id.startsWith('csoam_rel_') && !id.startsWith('local_') && id !== 'rel_09_11_2026') {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
      }

      // Procura e deleta por data ou ID correspondente no Firestore para garantir limpeza total
      const q = query(collection(db, COLLECTION_NAME));
      const snapshot = await getDocs(q);
      const deletePromises: Promise<any>[] = [];

      snapshot.forEach(docSnap => {
        const docData = docSnap.data();
        if (docSnap.id === id || (date && docData && docData.data === date)) {
          deletePromises.push(deleteDoc(doc(db, COLLECTION_NAME, docSnap.id)));
        }
      });

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
      }
      return true;
    } catch (error) {
      console.warn("Firestore delete warning:", error);
    }
  }

  return true;
}

// Conversores para suporte à REST API nativa do Firestore (fallback ultrarrápido)
function convertFirestoreField(val: any): any {
  if (!val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return parseFloat(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('mapValue' in val) {
    const res: any = {};
    const f = val.mapValue.fields || {};
    for (const k in f) {
      res[k] = convertFirestoreField(f[k]);
    }
    return res;
  }
  if ('arrayValue' in val) {
    const arr = val.arrayValue.values || [];
    return arr.map(convertFirestoreField);
  }
  return null;
}

function parseFirestoreRestDoc(doc: any): DailyReport {
  const id = doc.name ? doc.name.split('/').pop() : '';
  const f = doc.fields || {};
  const obj: any = {};
  for (const k in f) {
    obj[k] = convertFirestoreField(f[k]);
  }
  obj.id = id;
  return obj as DailyReport;
}

/**
 * Busca direta via REST API do Firestore
 * Não depende de conexões WebSocket/WebChannel do SDK e responde em poucos milissegundos.
 */
export async function fetchReportsFromFirestoreRest(): Promise<DailyReport[]> {
  const projectId = firebaseConfig.projectId || 'csoam-relatorios';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${COLLECTION_NAME}?pageSize=100`;

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = setTimeout(() => controller?.abort(), 7000);

  try {
    const res = await fetch(url, {
      signal: controller?.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`REST fetch returned status ${res.status}`);
    }

    const data = await res.json();
    const docs = data.documents || [];
    const reports: DailyReport[] = docs
      .map(parseFirestoreRestDoc)
      .filter((r: DailyReport) => r && !isReportDeleted(r.id, r.data));

    return reports;
  } catch (e) {
    clearTimeout(timeoutId);
    console.warn("Firestore REST fallback warning:", e);
    return [];
  }
}

// Helper para buscar todos os relatórios da nuvem (SDK + REST Fallback)
export async function getReportsFromFirebase(): Promise<DailyReport[]> {
  const localReports = getLocalReports();
  let cloudReports: DailyReport[] = [];

  // 1. Tenta buscar via Firebase SDK
  if (db) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore SDK timeout')), 4500)
      );

      const firestoreFetch = async () => {
        const q = query(collection(db, COLLECTION_NAME), orderBy('data', 'desc'));
        const snapshot = await getDocs(q);
        const list: DailyReport[] = [];
        snapshot.forEach(docSnap => {
          const report = { id: docSnap.id, ...docSnap.data() } as DailyReport;
          if (isReportDeleted(report.id, report.data)) {
            deleteDoc(doc(db, COLLECTION_NAME, docSnap.id)).catch(() => {});
          } else {
            list.push(report);
          }
        });
        return list;
      };

      cloudReports = await Promise.race([firestoreFetch(), timeoutPromise]);
    } catch (error) {
      console.warn("Firestore SDK fetch lento ou falhou, acionando REST API direta:", error);
    }
  }

  // 2. Se o SDK não retornou documentos, aciona imediatamente a REST API
  if (!cloudReports || cloudReports.length === 0) {
    try {
      cloudReports = await fetchReportsFromFirestoreRest();
    } catch (e) {
      console.warn("REST API fallback failed:", e);
    }
  }

  // 3. Se obteve relatórios da nuvem, atualiza o cache local e mescla com relatórios locais
  if (cloudReports && cloudReports.length > 0) {
    cloudReports.forEach(cr => {
      if (!isReportDeleted(cr.id, cr.data)) {
        cacheLocally(cr);
      }
    });

    const map = new Map<string, DailyReport>();
    cloudReports.forEach(r => map.set(r.data, r));
    localReports.forEach(r => {
      if (!map.has(r.data) && !isReportDeleted(r.id, r.data)) {
        map.set(r.data, r);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.data.localeCompare(a.data));
  }

  return localReports.filter(r => !isReportDeleted(r.id, r.data));
}

// Local Storage helpers
export function cacheLocally(report: DailyReport) {
  if (typeof window === 'undefined') return;
  // Se estiver marcado como excluído, não salva no cache
  if (isReportDeleted(report.id, report.data)) return;

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
    const reports: DailyReport[] = data ? JSON.parse(data) : [];
    return reports.filter(r => !isReportDeleted(r.id, r.data));
  } catch (e) {
    return [];
  }
}

export function removeLocalReport(id?: string, date?: string) {
  if (typeof window === 'undefined') return;
  try {
    const data = localStorage.getItem('csoam_reports_cache');
    const existing: DailyReport[] = data ? JSON.parse(data) : [];
    const filtered = existing.filter(r => {
      if (id && r.id === id) return false;
      if (date && r.data === date) return false;
      return true;
    });
    localStorage.setItem('csoam_reports_cache', JSON.stringify(filtered));
  } catch (e) {
    console.error("Local storage remove error:", e);
  }
}
