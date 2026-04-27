import type { OrderItem } from '@/services/orders.service';
import { cn } from '@/utils/cn';

type Size = 'sm' | 'md';

const dims: Record<
  Size,
  { product: string; stamp: string; label: string }
> = {
  sm: {
    product: 'h-16 w-14 shrink-0',
    stamp: 'h-[3.25rem] w-[2.85rem] shrink-0 sm:h-14 sm:w-[3.1rem]',
    label: 'max-w-[3.1rem] text-[6px] tracking-[0.12em] sm:text-[7px]',
  },
  md: {
    product: 'h-[4.5rem] w-[3.75rem] shrink-0 sm:h-20 sm:w-16',
    stamp: 'h-[3.75rem] w-[3.15rem] shrink-0 sm:h-[4.25rem] sm:w-[3.5rem]',
    label: 'max-w-[3.5rem] text-[7px] tracking-[0.14em] sm:text-[8px]',
  },
};

function StampThumb({
  label,
  name,
  src,
  variant,
  boxClass,
  labelClass,
}: {
  label: string;
  name: string;
  src?: string | null;
  variant: 'back' | 'front';
  boxClass: string;
  labelClass: string;
}) {
  const hasImg = Boolean(src?.trim());
  const ring =
    variant === 'back'
      ? 'border-king-red/55 ring-1 ring-king-red/25'
      : 'border-white/25 ring-1 ring-white/10';

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'overflow-hidden rounded-md border bg-king-black/50 [html.light_&]:bg-stone-900/40',
          ring,
          boxClass
        )}
        title={`${label}: ${name}`}
      >
        {hasImg ? (
          <img src={src!.trim()} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-0.5 text-center font-mono text-[7px] font-semibold uppercase leading-tight tracking-tight text-king-silver/80 sm:text-[8px]">
            {name.slice(0, 4)}
          </div>
        )}
      </div>
      <span
        className={cn(
          'text-center font-mono uppercase leading-tight text-king-silver/65',
          labelClass,
          variant === 'back' ? 'text-king-red/85' : 'text-king-silver/70'
        )}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * Miniaturas do produto + estampas escolhidas (crossover frente/costas) para pedidos.
 */
export default function OrderItemVisualRow({
  item,
  size = 'sm',
}: {
  item: OrderItem;
  size?: Size;
}) {
  const d = dims[size];

  return (
    <div className="flex flex-wrap items-end gap-2 sm:gap-2.5">
      <div className="flex flex-col items-center gap-1">
        <div
          className={cn(
            'overflow-hidden rounded-md border border-white/15 bg-king-black/30 [html.light_&]:border-king-ink/20 [html.light_&]:bg-stone-200/40',
            d.product
          )}
        >
          <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
        <span className={cn('text-center font-mono uppercase text-king-silver/55', d.label)}>
          Peça
        </span>
      </div>

      {item.stamp && (
        <StampThumb
          label="Costas"
          name={item.stamp.name}
          src={item.stamp.src}
          variant="back"
          boxClass={d.stamp}
          labelClass={d.label}
        />
      )}
      {item.stampFront && (
        <StampThumb
          label="Frente"
          name={item.stampFront.name}
          src={item.stampFront.src}
          variant="front"
          boxClass={d.stamp}
          labelClass={d.label}
        />
      )}
    </div>
  );
}
