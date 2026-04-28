import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { PixKeyType } from './pix';

const COLLECTION = 'settings';
const PIX_DOC = 'pix';

export interface PixSettings {
  key: string;
  keyType: PixKeyType;
  merchantName: string;
  merchantCity: string;
  enabled: boolean;
}

const DEFAULT_PIX: PixSettings = {
  key: '',
  keyType: 'random',
  merchantName: 'KING OVERSIZED',
  merchantCity: 'SAO PAULO',
  enabled: false,
};

export async function getPixSettings(): Promise<PixSettings> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, PIX_DOC));
    if (!snap.exists()) return { ...DEFAULT_PIX };
    const raw = snap.data() as Record<string, unknown>;
    return {
      key: typeof raw.key === 'string' ? raw.key : '',
      keyType:
        raw.keyType === 'cpf' ||
        raw.keyType === 'cnpj' ||
        raw.keyType === 'email' ||
        raw.keyType === 'phone' ||
        raw.keyType === 'random'
          ? raw.keyType
          : 'random',
      merchantName:
        typeof raw.merchantName === 'string' && raw.merchantName.trim()
          ? raw.merchantName
          : DEFAULT_PIX.merchantName,
      merchantCity:
        typeof raw.merchantCity === 'string' && raw.merchantCity.trim()
          ? raw.merchantCity
          : DEFAULT_PIX.merchantCity,
      enabled: raw.enabled === true,
    };
  } catch {
    return { ...DEFAULT_PIX };
  }
}

export async function savePixSettings(input: PixSettings): Promise<void> {
  await setDoc(
    doc(db, COLLECTION, PIX_DOC),
    {
      key: input.key.trim(),
      keyType: input.keyType,
      merchantName: input.merchantName.trim(),
      merchantCity: input.merchantCity.trim(),
      enabled: !!input.enabled,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
