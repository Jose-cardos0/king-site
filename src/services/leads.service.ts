import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'leads';

export interface Lead {
  id: string;
  phone: string;
  phoneDigits: string;
  source?: string;
  createdAt?: unknown;
}

export function normalizePhoneDigits(raw: string): string {
  return (raw || '').replace(/\D+/g, '');
}

export function formatBRPhone(digits: string): string {
  const d = normalizePhoneDigits(digits);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

export function isValidBRPhone(digits: string): boolean {
  const d = normalizePhoneDigits(digits);
  return d.length === 10 || d.length === 11;
}

export function buildWhatsAppUrl(phoneDigits: string, message?: string): string {
  const d = normalizePhoneDigits(phoneDigits);
  const withCountry = d.startsWith('55') ? d : `55${d}`;
  const base = `https://wa.me/${withCountry}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

function mapLead(id: string, raw: Record<string, unknown>): Lead {
  const phoneDigits =
    typeof raw.phoneDigits === 'string'
      ? raw.phoneDigits
      : typeof raw.phone === 'string'
        ? normalizePhoneDigits(raw.phone)
        : '';
  return {
    id,
    phone: typeof raw.phone === 'string' ? raw.phone : formatBRPhone(phoneDigits),
    phoneDigits,
    source: typeof raw.source === 'string' ? raw.source : undefined,
    createdAt: raw.createdAt,
  };
}

export async function createLead(rawPhone: string, source = 'newsletter'): Promise<string> {
  const digits = normalizePhoneDigits(rawPhone);
  if (!isValidBRPhone(digits)) throw new Error('Número inválido');
  const ref = await addDoc(collection(db, COLLECTION), {
    phone: formatBRPhone(digits),
    phoneDigits: digits,
    source,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listLeads(): Promise<Lead[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapLead(d.id, d.data() as Record<string, unknown>));
  } catch {
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs.map((d) => mapLead(d.id, d.data() as Record<string, unknown>));
  }
}

export async function deleteLead(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
