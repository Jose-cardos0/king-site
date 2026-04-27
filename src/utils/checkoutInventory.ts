/**
 * Mesmo formato que `server/lib/kingInventory.ts` (evita importar servidor no Vite).
 * Tupla: [productId, quantity, stampBackId, stampFrontId, size?].
 * `size` ausente = sem rastreamento por tamanho.
 */
export type CompactInventoryLine = [string, number, string, string, string?];

export function cartLinesFromStoreItems(
  items: Array<{
    productId: string;
    quantity: number;
    size?: string;
    stamp?: { id: string } | null;
    stampFront?: { id: string } | null;
  }>
): CompactInventoryLine[] {
  return items.map((i) => [
    i.productId,
    i.quantity,
    i.stamp?.id ?? '',
    i.stampFront?.id ?? '',
    i.size ?? '',
  ]);
}
