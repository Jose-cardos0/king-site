import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

const COLLECTION = 'stamps';

export function normalizeCustomId(raw: string): string {
  return (raw || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

export function isValidCustomId(raw: string): boolean {
  const id = normalizeCustomId(raw);
  return id.length >= 3 && id.length <= 60 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(id);
}

export type StampSide = 'back' | 'front';

export interface FirestoreStampDoc {
  id: string;
  name: string;
  /** Coleção / linha (ex.: "Coleção sagrada", "DROP JESUS") — usada como categoria na loja. */
  coleção: string;
  side: StampSide;
  imageUrl: string;
  /**
   * Unidades disponíveis desta estampa (global, não por produto).
   * Ausente ou `null` = sem limite (não baixa no webhook).
   */
  stock?: number | null;
  /**
   * Referência máxima para vitrine “atual / máx.” (ex.: 9/10). Não é alterada na venda.
   * Se ausente, o cliente vê só o numerador igual ao atual até repor no admin.
   */
  stockInitial?: number | null;
}

type StampInput = Omit<FirestoreStampDoc, 'id'>;

function normalizeColeção(v: string) {
  return v.trim() || 'Catálogo online';
}

function sortStamps(a: FirestoreStampDoc, b: FirestoreStampDoc) {
  const c = a.coleção.localeCompare(b.coleção, 'pt-BR');
  if (c !== 0) return c;
  return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
}

export async function listStamps(): Promise<FirestoreStampDoc[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  const list: FirestoreStampDoc[] = snap.docs.map((d) => {
    const raw = d.data() as Record<string, unknown>;
    const side: StampSide = raw.side === 'front' ? 'front' : 'back';
    let stock: number | null | undefined;
    if (raw.stock === null) stock = null;
    else if (typeof raw.stock === 'number' && !Number.isNaN(raw.stock)) stock = raw.stock;
    else stock = undefined;

    let stockInitial: number | null | undefined;
    if (raw.stockInitial === null) stockInitial = null;
    else if (typeof raw.stockInitial === 'number' && !Number.isNaN(raw.stockInitial)) {
      stockInitial = raw.stockInitial;
    } else stockInitial = undefined;

    return {
      id: d.id,
      name: typeof raw.name === 'string' ? raw.name : '',
      coleção:
        typeof raw.coleção === 'string' && raw.coleção.trim()
          ? raw.coleção
          : 'Catálogo online',
      side,
      imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : '',
      stock,
      stockInitial,
    };
  });
  list.sort(sortStamps);
  return list;
}

export async function createStamp(
  input: StampInput,
  customId: string
): Promise<string> {
  const id = normalizeCustomId(customId);
  if (!isValidCustomId(id)) {
    throw new Error('ID inválido. Use 3-60 caracteres: letras minúsculas, números e hífens.');
  }
  const ref = doc(db, COLLECTION, id);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    throw new Error('Já existe uma estampa com esse ID. Escolha outro.');
  }
  const payload: Record<string, unknown> = {
    name: input.name.trim(),
    coleção: normalizeColeção(input.coleção),
    side: input.side,
    imageUrl: input.imageUrl,
    createdAt: serverTimestamp(),
  };
  if (input.stock !== undefined && input.stock !== null) {
    const n = Math.max(0, Math.floor(input.stock));
    payload.stock = n;
    const iniRaw =
      typeof input.stockInitial === 'number' && !Number.isNaN(input.stockInitial)
        ? Math.floor(input.stockInitial)
        : n;
    payload.stockInitial = Math.max(n, iniRaw);
  }
  await setDoc(ref, payload);
  return id;
}

export async function updateStamp(
  id: string,
  patch: Partial<Pick<StampInput, 'name' | 'coleção' | 'side' | 'imageUrl' | 'stock' | 'stockInitial'>>
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  const data: Record<string, unknown> = {};
  if (patch.name !== undefined) data.name = patch.name.trim();
  if (patch.coleção !== undefined) data.coleção = normalizeColeção(patch.coleção);
  if (patch.side !== undefined) data.side = patch.side;
  if (patch.imageUrl !== undefined) data.imageUrl = patch.imageUrl;
  if (patch.stock !== undefined) {
    if (patch.stock === null) {
      data.stock = deleteField();
      data.stockInitial = deleteField();
    } else data.stock = Math.max(0, Math.floor(patch.stock));
  }
  if (patch.stockInitial !== undefined) {
    if (patch.stockInitial === null) data.stockInitial = deleteField();
    else data.stockInitial = Math.max(0, Math.floor(patch.stockInitial));
  }
  await updateDoc(ref, data);
}

export async function deleteStamp(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
