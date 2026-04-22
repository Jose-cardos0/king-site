import type { Product } from '@/services/products.service';
import { useStampsStore } from '@/store/useStampsStore';

/** Costas: campo ausente = todas as estampas do catálogo (Firebase); `[]` = nenhuma; array = só esses ids. */
export function getEffectiveBackStampIds(product: Product): string[] {
  const catalog = useStampsStore.getState().mergedBack;
  const raw = product.allowedBackStampIds;
  if (raw === undefined) return catalog.map((s) => s.id);
  return raw.filter((id) => catalog.some((s) => s.id === id));
}

/** Frente: ausente = logos oficiais + estampas de frente no Firebase; `[]` = nenhum; array = subset. */
export function getEffectiveFrontStampIds(product: Product): string[] {
  const catalog = useStampsStore.getState().mergedFront;
  const raw = product.allowedFrontStampIds;
  if (raw === undefined) return catalog.map((s) => s.id);
  return raw.filter((id) => catalog.some((s) => s.id === id));
}

export function productAllowsBackStamps(product: Product): boolean {
  return getEffectiveBackStampIds(product).length > 0;
}

export function productAllowsFrontStamps(product: Product): boolean {
  return getEffectiveFrontStampIds(product).length > 0;
}
