import type { Request, Response } from 'express';

/**
 * SuperFrete quote — chamada server-side com Bearer token.
 * Docs: https://docs.superfrete.com
 */

const SUPERFRETE_BASE = 'https://api.superfrete.com';
const ORIGIN_CEP = '49680000';
const FREE_SHIPPING_CEPS = new Set(['49680000']);

export interface SuperFreteService {
  id: number;
  name: string;
  price: string | number;
  discount?: string | number;
  delivery_time?: number;
  delivery_range?: { min: number; max: number };
  company?: { name: string; picture?: string };
  error?: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  deliveryDays: number;
  carrier: string;
  free?: boolean;
}

function onlyDigits(v: string): string {
  return (v || '').replace(/\D/g, '');
}

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v.replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** A API às vezes devolve array na raiz ou dentro de `content` / `data` / etc. */
function normalizeCalculatorPayload(raw: unknown): SuperFreteService[] {
  if (Array.isArray(raw)) {
    return raw as SuperFreteService[];
  }
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    for (const k of ['content', 'data', 'quotes', 'services', 'result', 'payload', 'items']) {
      const v = o[k];
      if (Array.isArray(v)) return v as SuperFreteService[];
    }
    const nested = o.data;
    if (nested && typeof nested === 'object') {
      const inner = nested as Record<string, unknown>;
      for (const k of ['quotes', 'content', 'services']) {
        const v = inner[k];
        if (Array.isArray(v)) return v as SuperFreteService[];
      }
    }
  }
  return [];
}

export async function quoteShipping(opts: {
  destinationCep: string;
  totalWeightKg: number;
  itemsCount: number;
}): Promise<{ options: ShippingOption[]; freeByLocation: boolean }> {
  const cep = onlyDigits(opts.destinationCep);

  if (cep.length !== 8) {
    throw new Error('CEP inválido');
  }

  if (FREE_SHIPPING_CEPS.has(cep)) {
    return {
      freeByLocation: true,
      options: [
        {
          id: 'local-pickup',
          name: 'Entrega Grátis (Região KING)',
          price: 0,
          deliveryDays: 1,
          carrier: 'KING',
          free: true,
        },
      ],
    };
  }

  const token = (
    process.env.SUPER_FRETE_API ||
    process.env.SUPERFRETE_API ||
    process.env.SUPERFRETE_API_KEY ||
    ''
  ).trim();
  if (!token) {
    throw new Error(
      'Chave SuperFrete ausente. Na Vercel define SUPER_FRETE_API (ou SUPERFRETE_API) em Environment Variables.'
    );
  }

  const weight = Math.max(0.3, Math.min(30, opts.totalWeightKg));
  const body = {
    from: { postal_code: ORIGIN_CEP },
    to: { postal_code: cep },
    services: '1,2,17',
    options: {
      own_hand: false,
      receipt: false,
      insurance_value: 0,
      use_insurance_value: false,
    },
    package: {
      height: 4,
      width: 20,
      length: 30,
      weight,
    },
  };

  const res = await fetch(`${SUPERFRETE_BASE}/api/v0/calculator`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      /** Alguns gateways bloqueiam User-Agent “curto”; usar UA de browser reduz 403 em serverless. */
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 KING-Site/1.0',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`SuperFrete ${res.status}: ${txt.slice(0, 400)}`);
  }

  const raw = (await res.json()) as unknown;
  const data = normalizeCalculatorPayload(raw);
  if (!data.length) {
    throw new Error(
      `SuperFrete devolveu lista vazia ou formato desconhecido: ${JSON.stringify(raw).slice(0, 280)}`
    );
  }

  const options: ShippingOption[] = data
    .filter((s) => !s.error && s.price !== undefined)
    .map((s) => {
      const price = num(s.discount ?? s.price);
      const days =
        s.delivery_time ??
        s.delivery_range?.max ??
        s.delivery_range?.min ??
        7;
      return {
        id: String(s.id),
        name: s.name ?? s.company?.name ?? `Serviço ${s.id}`,
        price,
        deliveryDays: days,
        carrier: s.company?.name ?? 'Correios',
      };
    })
    .filter((o) => o.price > 0);

  options.sort((a, b) => a.price - b.price);

  return { options, freeByLocation: false };
}

export function handleQuote(req: Request, res: Response): void {
  const body = req.body;
  if (body == null || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({ error: 'JSON inválido no corpo do pedido' });
    return;
  }
  const { cep, itemsCount, totalWeightKg } = body as {
    cep?: string;
    itemsCount?: number;
    totalWeightKg?: number;
  };
  if (!cep) {
    res.status(400).json({ error: 'CEP obrigatório' });
    return;
  }
  const perItem = 0.35;
  const weight =
    typeof totalWeightKg === 'number' && totalWeightKg > 0
      ? totalWeightKg
      : Math.max(0.3, (itemsCount ?? 1) * perItem);

  quoteShipping({ destinationCep: cep, totalWeightKg: weight, itemsCount: itemsCount ?? 1 })
    .then((r) => res.json(r))
    .catch((err: Error) => {
      console.error('[superfrete] quote error', err.message);
      res.status(500).json({ error: err.message });
    });
}
