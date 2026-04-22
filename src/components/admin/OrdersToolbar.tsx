import { useMemo, useState } from 'react';
import { ChevronDown, Download, Filter, Hash, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  type Order,
  type OrderStatus,
} from '@/services/orders.service';
import { formatBRL } from '@/utils/format';
import { exportOrdersToExcel } from '@/utils/orderExport';

const SELECT =
  'select-king-dark h-11 w-full min-w-0 font-mono text-[10px] uppercase tracking-[0.18em]';

export type DatePreset =
  | 'all'
  | 'today'
  | '7d'
  | '30d'
  | 'this_month'
  | 'last_month'
  | 'year'
  | 'custom';

export type CouponFilter = 'all' | 'with' | 'without';

export type ShippingKindFilter = 'all' | 'free' | 'pac' | 'sedex' | 'other';

export type OrdersFilters = {
  datePreset: DatePreset;
  from: string;
  to: string;
  status: OrderStatus | 'all';
  paymentStatus: 'all' | 'pending' | 'paid' | 'failed' | 'refunded';
  coupon: CouponFilter;
  shippingKind: ShippingKindFilter;
  customerEmail: 'all' | string;
  /** Parte ou ID completo do documento do pedido (Firestore). */
  orderId: string;
};

export const EMPTY_FILTERS: OrdersFilters = {
  datePreset: 'all',
  from: '',
  to: '',
  status: 'all',
  paymentStatus: 'all',
  coupon: 'all',
  shippingKind: 'all',
  customerEmail: 'all',
  orderId: '',
};

type Props = {
  orders: Order[];
  filters: OrdersFilters;
  onFiltersChange: (f: OrdersFilters) => void;
  filtered: Order[];
  totalAll: number;
};

function tsFromOrder(o: Order): number {
  const raw = o.createdAt as
    | { toDate?: () => Date; seconds?: number }
    | Date
    | string
    | undefined;
  if (!raw) return 0;
  if (raw instanceof Date) return raw.getTime();
  if (typeof raw === 'string') {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? 0 : d.getTime();
  }
  if (typeof raw === 'object' && raw) {
    if (typeof raw.toDate === 'function') return raw.toDate().getTime();
    if (typeof raw.seconds === 'number') return raw.seconds * 1000;
  }
  return 0;
}

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function endOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.getTime();
}

function rangeForPreset(preset: DatePreset): { fromMs?: number; toMs?: number } {
  const now = new Date();
  if (preset === 'all') return {};
  if (preset === 'today') {
    return { fromMs: startOfDay(now), toMs: endOfDay(now) };
  }
  if (preset === '7d') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return { fromMs: startOfDay(start), toMs: endOfDay(now) };
  }
  if (preset === '30d') {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    return { fromMs: startOfDay(start), toMs: endOfDay(now) };
  }
  if (preset === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { fromMs: startOfDay(start), toMs: endOfDay(now) };
  }
  if (preset === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { fromMs: startOfDay(start), toMs: endOfDay(end) };
  }
  if (preset === 'year') {
    const start = new Date(now.getFullYear(), 0, 1);
    return { fromMs: startOfDay(start), toMs: endOfDay(now) };
  }
  return {};
}

function isFreeShipping(o: Order): boolean {
  if ((o.shippingCost ?? 0) === 0) return true;
  const id = o.shippingService?.id ?? '';
  const name = (o.shippingService?.name ?? '').toLowerCase();
  return id === 'local-pickup' || name.includes('grátis') || name.includes('gratis');
}

function isPac(o: Order): boolean {
  const id = o.shippingService?.id ?? '';
  const name = (o.shippingService?.name ?? '').toUpperCase();
  return id === '1' || name.includes('PAC');
}

function isSedex(o: Order): boolean {
  const id = o.shippingService?.id ?? '';
  const name = (o.shippingService?.name ?? '').toUpperCase();
  return id === '2' || name.includes('SEDEX');
}

export default function OrdersToolbar({
  orders,
  filters,
  onFiltersChange,
  filtered,
  totalAll,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const revenue = useMemo(
    () => filtered.reduce((acc, o) => acc + (o.total ?? 0), 0),
    [filtered]
  );

  const customerOptions = useMemo(() => {
    const byEmail = new Map<string, string>();
    for (const o of orders) {
      const em = (o.userEmail || '').trim();
      if (!em) continue;
      const name = (o.shipping.fullName || '').trim();
      const label = name ? `${name} — ${em}` : em;
      if (!byEmail.has(em)) byEmail.set(em, label);
    }
    return [...byEmail.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], 'pt-BR', { sensitivity: 'base' })
    );
  }, [orders]);

  const filtersActive =
    filters.datePreset !== 'all' ||
    filters.status !== 'all' ||
    filters.paymentStatus !== 'all' ||
    filters.coupon !== 'all' ||
    filters.shippingKind !== 'all' ||
    filters.customerEmail !== 'all' ||
    filters.orderId.trim() !== '';

  const set = <K extends keyof OrdersFilters>(k: K, v: OrdersFilters[K]) =>
    onFiltersChange({ ...filters, [k]: v });

  const onPeriodChange = (preset: DatePreset) => {
    if (preset === 'custom') {
      onFiltersChange({ ...filters, datePreset: 'custom' });
    } else {
      onFiltersChange({ ...filters, datePreset: preset, from: '', to: '' });
    }
  };

  const clear = () => onFiltersChange(EMPTY_FILTERS);

  const exportExcel = () => {
    if (filtered.length === 0) {
      toast.error('Nenhum pedido para exportar com os filtros atuais.');
      return;
    }
    const suffix = filtersActive ? 'filtrado' : 'todos';
    exportOrdersToExcel(filtered, suffix);
    toast.success(`${filtered.length} pedido(s) exportado(s).`);
  };

  return (
    <div className="mb-5 border border-white/5 bg-white/[0.02]">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 text-king-silver">
            <Filter className="h-4 w-4 shrink-0" />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em]">
              Filtros & Export
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            className={cn(
              'inline-flex items-center gap-2 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] transition',
              filtersOpen
                ? 'border-king-red bg-king-red/15 text-king-bone'
                : 'border-white/15 text-king-silver hover:border-king-red hover:text-king-fg'
            )}
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 transition-transform duration-200',
                filtersOpen && 'rotate-180'
              )}
            />
            {filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
          {filtersActive && !filtersOpen && (
            <span className="rounded-full border border-king-red/40 bg-king-red/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-king-red">
              Filtros ativos
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-king-silver/70">
            <span>
              {filtered.length}/{totalAll} pedidos
            </span>
            <span className="ml-2 text-king-fg">{formatBRL(revenue)}</span>
          </div>
          <button
            type="button"
            onClick={exportExcel}
            className="inline-flex items-center gap-2 rounded-sm border border-king-red bg-king-red/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-king-red transition hover:bg-king-red hover:text-king-bone"
          >
            <Download className="h-3.5 w-3.5" />
            Excel
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="space-y-4 border-t border-white/5 p-4 pt-4">
      <label className="flex flex-col gap-1">
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-king-silver/70">
          ID do pedido
        </span>
        <div className="relative">
          <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-king-silver/50" />
          <input
            type="text"
            value={filters.orderId}
            onChange={(e) => set('orderId', e.target.value)}
            placeholder="Digite parte ou o ID completo (ex.: FINNRXSXJC)"
            className="input-king h-11 w-full pl-10 font-mono text-[12px] uppercase tracking-[0.12em] placeholder:normal-case placeholder:tracking-normal placeholder:text-king-silver/40"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-king-silver/70">
            Período
          </span>
          <select
            value={filters.datePreset}
            onChange={(e) => onPeriodChange(e.target.value as DatePreset)}
            className={SELECT}
          >
            <option value="all">Todos os períodos</option>
            <option value="today">Hoje</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="this_month">Este mês</option>
            <option value="last_month">Mês anterior</option>
            <option value="year">Este ano</option>
            <option value="custom">Personalizado (datas)</option>
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-king-silver/70">
            Status
          </span>
          <select
            value={filters.status}
            onChange={(e) => set('status', e.target.value as OrdersFilters['status'])}
            className={SELECT}
          >
            <option value="all">Todos</option>
            {ORDER_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-king-silver/70">
            Pagamento
          </span>
          <select
            value={filters.paymentStatus}
            onChange={(e) =>
              set('paymentStatus', e.target.value as OrdersFilters['paymentStatus'])
            }
            className={SELECT}
          >
            <option value="all">Todos</option>
            <option value="paid">Pago</option>
            <option value="pending">Pendente</option>
            <option value="failed">Falhou</option>
            <option value="refunded">Estornado</option>
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-king-silver/70">
            Cupom
          </span>
          <select
            value={filters.coupon}
            onChange={(e) => set('coupon', e.target.value as CouponFilter)}
            className={SELECT}
          >
            <option value="all">Todos</option>
            <option value="with">Com cupom</option>
            <option value="without">Sem cupom</option>
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-king-silver/70">
            Frete
          </span>
          <select
            value={filters.shippingKind}
            onChange={(e) => set('shippingKind', e.target.value as ShippingKindFilter)}
            className={SELECT}
          >
            <option value="all">Todos</option>
            <option value="free">Grátis / região</option>
            <option value="pac">PAC</option>
            <option value="sedex">SEDEX</option>
            <option value="other">Outro (pago)</option>
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-king-silver/70">
            Cliente
          </span>
          <select
            value={filters.customerEmail}
            onChange={(e) => set('customerEmail', e.target.value)}
            className={SELECT}
          >
            <option value="all">Todos os clientes</option>
            {customerOptions.map(([email, label]) => (
              <option key={email} value={email}>
                {label.length > 48 ? `${label.slice(0, 45)}…` : label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filters.datePreset === 'custom' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-king-silver/70">
              Data inicial
            </span>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => set('from', e.target.value)}
              className="input-king h-11"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-king-silver/70">
              Data final
            </span>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => set('to', e.target.value)}
              className="input-king h-11"
            />
          </label>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-start gap-2">
        <button
          type="button"
          onClick={clear}
          disabled={!filtersActive}
          className={cn(
            'inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.25em] transition',
            filtersActive
              ? 'text-king-silver hover:text-king-red'
              : 'cursor-not-allowed text-king-silver/30'
          )}
        >
          <X className="h-3 w-3" /> Limpar filtros
        </button>
      </div>
        </div>
      )}
    </div>
  );
}

export function matchesFilters(o: Order, f: OrdersFilters): boolean {
  const idQ = f.orderId.trim().toLowerCase().replace(/\s+/g, '');
  if (idQ && !o.id.toLowerCase().includes(idQ)) return false;

  if (f.status !== 'all' && o.status !== f.status) return false;
  if (f.paymentStatus !== 'all' && (o.paymentStatus ?? 'pending') !== f.paymentStatus)
    return false;

  if (f.coupon === 'with' && !o.coupon?.code) return false;
  if (f.coupon === 'without' && o.coupon?.code) return false;

  if (f.customerEmail !== 'all' && o.userEmail !== f.customerEmail) return false;

  if (f.shippingKind !== 'all') {
    const free = isFreeShipping(o);
    const pac = isPac(o);
    const sedex = isSedex(o);
    if (f.shippingKind === 'free' && !free) return false;
    if (f.shippingKind === 'pac' && !pac) return false;
    if (f.shippingKind === 'sedex' && !sedex) return false;
    if (f.shippingKind === 'other' && (free || pac || sedex)) return false;
  }

  const ts = tsFromOrder(o);
  if (f.datePreset === 'custom') {
    if (f.from) {
      const fromMs = new Date(`${f.from}T00:00:00`).getTime();
      if (Number.isFinite(fromMs) && ts < fromMs) return false;
    }
    if (f.to) {
      const toMs = new Date(`${f.to}T23:59:59`).getTime();
      if (Number.isFinite(toMs) && ts > toMs) return false;
    }
  } else if (f.datePreset !== 'all') {
    const { fromMs, toMs } = rangeForPreset(f.datePreset);
    if (fromMs != null && ts < fromMs) return false;
    if (toMs != null && ts > toMs) return false;
  }

  return true;
}
