/**
 * Regras de estoque: `null`/`undefined` no Firestore = sem limite (não desconta no webhook).
 * Número ≤ 0 = esgotado na loja.
 */

import type { Product, ProductSize } from '@/services/products.service';

export function isProductSoldOut(stock: number | null | undefined): boolean {
  return typeof stock === 'number' && stock <= 0;
}

export function effectiveProductStock(stock: number | null | undefined): number {
  if (stock === null || stock === undefined) return Number.POSITIVE_INFINITY;
  return stock;
}

type ProductLikeStock = Pick<Product, 'sizes' | 'stock' | 'stockBySize'>;

/** Lê o estoque do tamanho específico. `Infinity` = sem limite naquele tamanho. */
export function effectiveProductSizeStock(
  product: ProductLikeStock,
  size: ProductSize
): number {
  const map = product.stockBySize;
  if (map && size in map) {
    const v = map[size];
    if (v === null || v === undefined) return Number.POSITIVE_INFINITY;
    return v;
  }
  return effectiveProductStock(product.stock);
}

export function isProductSizeSoldOut(
  product: ProductLikeStock,
  size: ProductSize
): boolean {
  return effectiveProductSizeStock(product, size) <= 0;
}

/** True quando o produto tem estoque por tamanho rastreado (qualquer chave numérica). */
export function hasSizeStock(product: ProductLikeStock): boolean {
  const map = product.stockBySize;
  if (!map) return false;
  return Object.values(map).some((v) => typeof v === 'number');
}

/** Soma das quantidades por tamanho rastreadas (ignora null/undefined). */
export function totalStockFromBySize(
  bySize: ProductLikeStock['stockBySize']
): number | null {
  if (!bySize) return null;
  let total = 0;
  let any = false;
  for (const v of Object.values(bySize)) {
    if (typeof v === 'number') {
      total += Math.max(0, Math.floor(v));
      any = true;
    }
  }
  return any ? total : null;
}

/** Lista os tamanhos do produto que ainda têm estoque (ou sem limite). */
export function availableSizesForProduct(product: ProductLikeStock): ProductSize[] {
  return product.sizes.filter((s) => !isProductSizeSoldOut(product, s));
}

export function isStampSoldOut(stock: number | null | undefined): boolean {
  return typeof stock === 'number' && stock <= 0;
}

export function effectiveStampStock(stock: number | null | undefined): number {
  if (stock === null || stock === undefined) return Number.POSITIVE_INFINITY;
  return stock;
}

/** Denominador do rácio “atual / máx.” na vitrine (gatilho de escassez). */
export function stampStockDenominator(
  stock: number,
  stockInitial?: number | null
): number {
  const ini =
    typeof stockInitial === 'number' && !Number.isNaN(stockInitial) ? stockInitial : stock;
  return Math.max(ini, stock);
}

export function stampStockRatioLabel(stock: number, stockInitial?: number | null): string {
  return `${stock}/${stampStockDenominator(stock, stockInitial)}`;
}

export function stampIsLastUnit(stock: number | null | undefined): boolean {
  return typeof stock === 'number' && stock === 1;
}
