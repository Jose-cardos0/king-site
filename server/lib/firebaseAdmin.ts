import admin from 'firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';

let warnedMissing = false;

/**
 * Firestore com credencial de serviço (mesmo projeto do site).
 * Defina `FIREBASE_SERVICE_ACCOUNT_JSON` no `.env` do servidor (JSON completo numa linha).
 */
export function getAdminFirestore(): Firestore | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw?.trim()) {
    if (!warnedMissing) {
      console.warn(
        '[king-server] FIREBASE_SERVICE_ACCOUNT_JSON ausente — validação e baixa de estoque (Firestore) desativadas.'
      );
      warnedMissing = true;
    }
    return null;
  }
  try {
    if (!admin.apps.length) {
      const cred = JSON.parse(raw) as admin.ServiceAccount;
      admin.initializeApp({ credential: admin.credential.cert(cred) });
    }
    return admin.firestore();
  } catch (e) {
    console.error('[firebase-admin] falha ao inicializar:', e);
    return null;
  }
}
