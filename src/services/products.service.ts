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
} from 'firebase/firestore';
import { db } from './firebase';

export type ProductCategory =
  | 'oversized'
  | 'camiseta'
  | 'moletom'
  | 'regata'
  | 'colecao-sacra';

export type ProductSize = 'P' | 'M' | 'G' | 'GG' | 'XGG';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  images: string[];
  category: ProductCategory;
  sizes: ProductSize[];
  stock: number;
  featured?: boolean;
  tag?: string;
  createdAt?: unknown;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt'>;

const COLLECTION = 'products';

export async function listProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
  } catch {
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Product, 'id'>) };
}

export async function createProduct(data: ProductInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  await updateDoc(doc(db, COLLECTION, id), data as Record<string, unknown>);
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
