import admin from 'firebase-admin';
import type { DocumentReference, Firestore } from 'firebase-admin/firestore';

/**
 * Tupla de inventário enviada no metadata do PaymentIntent.
 * Formato: [productId, quantity, stampBackId, stampFrontId, size?]
 * - `stampBackId` / `stampFrontId`: id da estampa (string vazia se não houver).
 *   Apenas ids com prefixo `fb_` são contabilizados na coleção `stamps`.
 * - `size`: tamanho da peça (P, M, G, GG, XGG). Vazio = sem rastreamento por tamanho.
 *
 * O parser aceita tuplas legadas de 4 entradas (sem size).
 */
export type CompactInventoryLine = [string, number, string, string, string?];

export function buildCompactLinesFromUnknown(raw: unknown): CompactInventoryLine[] | null {
  if (!Array.isArray(raw)) return null;
  const out: CompactInventoryLine[] = [];
  for (const row of raw) {
    if (!Array.isArray(row)) return null;
    if (row.length !== 4 && row.length !== 5) return null;
    const [p, q, b, f, sz] = row;
    if (typeof p !== 'string' || p.length === 0) return null;
    if (typeof q !== 'number' || !Number.isInteger(q) || q <= 0) return null;
    if (typeof b !== 'string' || typeof f !== 'string') return null;
    if (sz !== undefined && typeof sz !== 'string') return null;
    out.push([p, q, b, f, typeof sz === 'string' ? sz : '']);
  }
  return out;
}

export function parseInventoryLinesJson(json: string): CompactInventoryLine[] | null {
  try {
    const data = JSON.parse(json) as unknown;
    return buildCompactLinesFromUnknown(data);
  } catch {
    return null;
  }
}

export function serializeInventoryLines(lines: CompactInventoryLine[]): string {
  return JSON.stringify(lines);
}

interface ProductDemand {
  /** Total a abater no campo `stock` (sempre). */
  total: number;
  /** Quantidade por tamanho (string vazia = sem tamanho declarado). */
  bySize: Map<string, number>;
}

function aggregate(lines: CompactInventoryLine[]) {
  const products = new Map<string, ProductDemand>();
  const stamps = new Map<string, number>();
  for (const [pid, q, bid, fid, sz] of lines) {
    const cur = products.get(pid) ?? { total: 0, bySize: new Map<string, number>() };
    cur.total += q;
    const key = typeof sz === 'string' ? sz : '';
    cur.bySize.set(key, (cur.bySize.get(key) ?? 0) + q);
    products.set(pid, cur);
    if (bid.startsWith('fb_')) {
      const id = bid.slice(3);
      stamps.set(id, (stamps.get(id) ?? 0) + q);
    }
    if (fid.startsWith('fb_')) {
      const id = fid.slice(3);
      stamps.set(id, (stamps.get(id) ?? 0) + q);
    }
  }
  return { products, stamps };
}

/** Lê JSON de linhas colado no metadata do PaymentIntent (com chunking opcional). */
export function readInventoryJsonFromStripeMetadata(
  meta: Record<string, string> | null | undefined
): string | null {
  if (!meta || typeof meta !== 'object') return null;
  if (meta.king_inv && typeof meta.king_inv === 'string') return meta.king_inv;
  const keys = Object.keys(meta)
    .filter((k) => /^king_inv_\d+$/.test(k))
    .sort((a, b) => Number(a.slice(8)) - Number(b.slice(8)));
  if (keys.length === 0) return null;
  return keys.map((k) => meta[k]).join('');
}

const META_CHUNK = 450;

export function attachInventoryToStripeMetadata(
  base: Record<string, string>,
  linesJson: string
): Record<string, string> {
  const out: Record<string, string> = { ...base };
  for (const k of Object.keys(out)) {
    if (k === 'king_inv' || k.startsWith('king_inv_')) delete out[k];
  }
  if (linesJson.length <= META_CHUNK) {
    out.king_inv = linesJson;
    return out;
  }
  let i = 0;
  for (let o = 0; o < linesJson.length; o += META_CHUNK, i++) {
    out[`king_inv_${i}`] = linesJson.slice(o, o + META_CHUNK);
  }
  return out;
}

export async function assertInventoryAvailable(
  db: Firestore,
  lines: CompactInventoryLine[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { products, stamps } = aggregate(lines);
  try {
    for (const [pid, demand] of products) {
      const snap = await db.collection('products').doc(pid).get();
      if (!snap.exists) {
        return { ok: false, message: 'Um produto do pedido não foi encontrado no estoque.' };
      }
      const s = snap.get('stock');
      const cap = typeof s === 'number' && !Number.isNaN(s) ? s : Number.POSITIVE_INFINITY;
      if (cap < demand.total) {
        return { ok: false, message: 'Estoque de camisas insuficiente para finalizar o pagamento.' };
      }
      const bySize = (snap.get('stockBySize') ?? null) as Record<string, unknown> | null;
      if (bySize && typeof bySize === 'object') {
        for (const [size, q] of demand.bySize) {
          if (!size) continue;
          const v = bySize[size];
          if (v === undefined || v === null) continue;
          if (typeof v === 'number' && v < q) {
            return {
              ok: false,
              message: `Estoque insuficiente no tamanho ${size}.`,
            };
          }
        }
      }
    }
    for (const [sid, need] of stamps) {
      const snap = await db.collection('stamps').doc(sid).get();
      if (!snap.exists) {
        return { ok: false, message: 'Uma estampa do pedido não foi encontrada no estoque.' };
      }
      const st = snap.get('stock');
      const cap = typeof st === 'number' && !Number.isNaN(st) ? st : Number.POSITIVE_INFINITY;
      if (cap < need) {
        return { ok: false, message: 'Estoque de uma ou mais estampas insuficiente.' };
      }
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao consultar estoque';
    return { ok: false, message: msg };
  }
}

export async function applyInventoryDeduction(
  db: Firestore,
  paymentIntentId: string,
  linesJson: string | null
): Promise<{ ok: true; skipped: boolean } | { ok: false; error: string }> {
  if (!linesJson) return { ok: true, skipped: true };
  const lines = parseInventoryLinesJson(linesJson);
  if (!lines || lines.length === 0) return { ok: true, skipped: true };

  const { products, stamps } = aggregate(lines);
  const markerRef = db.collection('inventory_deductions').doc(paymentIntentId);

  try {
    await db.runTransaction(async (tx) => {
      const marker = await tx.get(markerRef);
      if (marker.exists) return;

      const prodOps: Array<{
        ref: DocumentReference;
        total: number;
        numericTotal: number | null;
        sizeOps: Array<{ size: string; need: number; current: number | null }>;
      }> = [];
      for (const [pid, demand] of products) {
        const ref = db.collection('products').doc(pid);
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error(`MISSING_PRODUCT:${pid}`);
        const s = snap.get('stock');
        const numericTotal = typeof s === 'number' && !Number.isNaN(s) ? s : null;
        if (numericTotal !== null && numericTotal < demand.total) {
          throw new Error(`INSUFFICIENT_PRODUCT:${pid}`);
        }
        const bySize = (snap.get('stockBySize') ?? null) as Record<string, unknown> | null;
        const sizeOps: Array<{ size: string; need: number; current: number | null }> = [];
        if (bySize && typeof bySize === 'object') {
          for (const [size, need] of demand.bySize) {
            if (!size) continue;
            const v = bySize[size];
            if (v === undefined || v === null) continue;
            if (typeof v === 'number') {
              if (v < need) throw new Error(`INSUFFICIENT_PRODUCT_SIZE:${pid}:${size}`);
              sizeOps.push({ size, need, current: v });
            }
          }
        }
        prodOps.push({ ref, total: demand.total, numericTotal, sizeOps });
      }

      const stampOps: Array<{
        ref: DocumentReference;
        need: number;
        numeric: number | null;
      }> = [];
      for (const [sid, need] of stamps) {
        const ref = db.collection('stamps').doc(sid);
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error(`MISSING_STAMP:${sid}`);
        const st = snap.get('stock');
        const numeric = typeof st === 'number' && !Number.isNaN(st) ? st : null;
        if (numeric !== null && numeric < need) throw new Error(`INSUFFICIENT_STAMP:${sid}`);
        stampOps.push({ ref, need, numeric });
      }

      tx.set(markerRef, {
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lineCount: lines.length,
      });

      for (const p of prodOps) {
        const patch: Record<string, unknown> = {};
        if (p.numericTotal !== null) {
          patch.stock = admin.firestore.FieldValue.increment(-p.total);
        }
        for (const op of p.sizeOps) {
          patch[`stockBySize.${op.size}`] = admin.firestore.FieldValue.increment(-op.need);
        }
        if (Object.keys(patch).length > 0) {
          tx.update(p.ref, patch);
        }
      }
      for (const s of stampOps) {
        if (s.numeric !== null) {
          tx.update(s.ref, { stock: admin.firestore.FieldValue.increment(-s.need) });
        }
      }
    });
    return { ok: true, skipped: false };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
