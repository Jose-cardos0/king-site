import type { Shipping } from '@/services/orders.service';

const PREFIX = 'king-checkout-shipping:v1:';

function key(userId: string): string {
  return `${PREFIX}${userId}`;
}

const REQUIRED: (keyof Shipping)[] = [
  'fullName',
  'phone',
  'address',
  'number',
  'city',
  'state',
  'zip',
];

export function isShippingComplete(s: Partial<Shipping> | null | undefined): s is Shipping {
  if (!s) return false;
  return REQUIRED.every((k) => String(s[k] ?? '').trim().length > 0);
}

export function readSavedShipping(userId: string): Shipping | null {
  if (!userId || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key(userId));
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== 'object') return null;
    const o = data as Record<string, unknown>;
    const z = String(o.zip ?? '').replace(/\D/g, '').slice(0, 8);
    const zipFormatted =
      z.length === 8 ? `${z.slice(0, 5)}-${z.slice(5)}` : z;
    const candidate: Shipping = {
      fullName: String(o.fullName ?? ''),
      phone: String(o.phone ?? ''),
      address: String(o.address ?? ''),
      number: String(o.number ?? ''),
      complement: o.complement != null ? String(o.complement) : '',
      city: String(o.city ?? ''),
      state: String(o.state ?? '').toUpperCase().slice(0, 2),
      zip: zipFormatted,
    };
    if (!isShippingComplete(candidate)) return null;
    return candidate;
  } catch {
    return null;
  }
}

export function writeSavedShipping(userId: string, shipping: Shipping): void {
  if (!userId || typeof window === 'undefined') return;
  try {
    localStorage.setItem(key(userId), JSON.stringify(shipping));
  } catch {
    // quota / private mode
  }
}

export function clearSavedShipping(userId: string): void {
  if (!userId || typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key(userId));
  } catch {
    // ignore
  }
}
