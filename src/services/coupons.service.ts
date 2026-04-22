import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  increment,
  where,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'coupons';

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  usedCount: number;
  maxUses?: number | null;
  expiresAt?: string | null;
  createdAt?: unknown;
}

export type CouponInput = {
  code: string;
  discountPercent: number;
  active: boolean;
  maxUses?: number | null;
  expiresAt?: string | null;
};

export function normalizeCode(code: string): string {
  return (code || '')
    .trim()
    .toUpperCase()
    .replace(/^#+/, '')
    .replace(/[^A-Z0-9_-]/g, '');
}

function mapCoupon(id: string, raw: Record<string, unknown>): Coupon {
  return {
    id,
    code: typeof raw.code === 'string' ? raw.code : '',
    discountPercent:
      typeof raw.discountPercent === 'number' ? raw.discountPercent : 0,
    active: raw.active !== false,
    usedCount: typeof raw.usedCount === 'number' ? raw.usedCount : 0,
    maxUses:
      typeof raw.maxUses === 'number' && raw.maxUses > 0 ? raw.maxUses : null,
    expiresAt: typeof raw.expiresAt === 'string' ? raw.expiresAt : null,
    createdAt: raw.createdAt,
  };
}

export async function listCoupons(): Promise<Coupon[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapCoupon(d.id, d.data() as Record<string, unknown>));
  } catch {
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs.map((d) => mapCoupon(d.id, d.data() as Record<string, unknown>));
  }
}

export async function createCoupon(input: CouponInput): Promise<string> {
  const code = normalizeCode(input.code);
  if (!code) throw new Error('Código inválido');
  if (input.discountPercent <= 0 || input.discountPercent > 100) {
    throw new Error('Desconto precisa estar entre 1% e 100%');
  }

  const existing = await findCouponByCode(code);
  if (existing) throw new Error('Já existe um cupom com esse código');

  const ref = await addDoc(collection(db, COLLECTION), {
    code,
    discountPercent: Math.round(input.discountPercent),
    active: input.active !== false,
    usedCount: 0,
    maxUses: input.maxUses ?? null,
    expiresAt: input.expiresAt ?? null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCoupon(
  id: string,
  patch: Partial<CouponInput>
): Promise<void> {
  const data: Record<string, unknown> = {};
  if (patch.code !== undefined) data.code = normalizeCode(patch.code);
  if (patch.discountPercent !== undefined) {
    if (patch.discountPercent <= 0 || patch.discountPercent > 100) {
      throw new Error('Desconto precisa estar entre 1% e 100%');
    }
    data.discountPercent = Math.round(patch.discountPercent);
  }
  if (patch.active !== undefined) data.active = patch.active;
  if (patch.maxUses !== undefined) data.maxUses = patch.maxUses ?? null;
  if (patch.expiresAt !== undefined) data.expiresAt = patch.expiresAt ?? null;
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteCoupon(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function findCouponByCode(rawCode: string): Promise<Coupon | null> {
  const code = normalizeCode(rawCode);
  if (!code) return null;
  const q = query(collection(db, COLLECTION), where('code', '==', code), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return mapCoupon(d.id, d.data() as Record<string, unknown>);
}

export interface ValidateCouponResult {
  coupon: Coupon;
  discountPercent: number;
}

export async function validateCoupon(
  rawCode: string
): Promise<ValidateCouponResult> {
  const found = await findCouponByCode(rawCode);
  if (!found) throw new Error('Cupom não encontrado');
  if (!found.active) throw new Error('Cupom desativado');

  if (found.expiresAt) {
    const expires = new Date(found.expiresAt);
    if (!Number.isNaN(expires.getTime()) && expires.getTime() < Date.now()) {
      throw new Error('Cupom expirado');
    }
  }
  if (found.maxUses && found.usedCount >= found.maxUses) {
    throw new Error('Cupom esgotado');
  }
  return { coupon: found, discountPercent: found.discountPercent };
}

export async function incrementCouponUsage(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      usedCount: increment(1),
    });
  } catch (err) {
    console.warn('[coupons] failed to increment usage', err);
  }
}

/** Pega um cupom pelo id — usado em vistas do admin. */
export async function getCoupon(id: string): Promise<Coupon | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return mapCoupon(snap.id, snap.data() as Record<string, unknown>);
}
