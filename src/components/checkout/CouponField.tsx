import { useState } from 'react';
import toast from 'react-hot-toast';
import { Tag, X, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { validateCoupon, type Coupon } from '@/services/coupons.service';

export type AppliedCoupon = {
  id: string;
  code: string;
  discountPercent: number;
};

type Props = {
  applied: AppliedCoupon | null;
  onApply: (c: AppliedCoupon) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export default function CouponField({ applied, onApply, onRemove, disabled }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const apply = async () => {
    if (!code.trim()) {
      toast.error('Informe o código do cupom');
      return;
    }
    setLoading(true);
    try {
      const { coupon } = (await validateCoupon(code)) as { coupon: Coupon };
      onApply({
        id: coupon.id,
        code: coupon.code,
        discountPercent: coupon.discountPercent,
      });
      toast.success(`Cupom #${coupon.code} aplicado (${coupon.discountPercent}% OFF)`);
      setCode('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Cupom inválido';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5 text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em]">
              Cupom aplicado
            </p>
            <p className="mt-0.5 truncate font-mono text-sm uppercase tracking-[0.18em] text-king-fg">
              #{applied.code}{' '}
              <span className="text-emerald-300">— {applied.discountPercent}% OFF</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-king-silver transition hover:border-king-red hover:text-king-red disabled:opacity-40"
          aria-label="Remover cupom"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-white/10 bg-king-black/30 p-4">
      <div className="mb-2 flex items-center gap-2 text-king-silver">
        <Tag className="h-4 w-4" />
        <span className="font-mono text-[11px] uppercase tracking-[0.25em]">
          Cupom de desconto
        </span>
      </div>
      <div className="flex items-stretch gap-2">
        <div className="flex flex-1 items-stretch">
          <span className="flex items-center border border-r-0 border-white/10 bg-white/5 px-3 font-mono text-sm text-king-silver">
            #
          </span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void apply();
              }
            }}
            placeholder="EVANDSON10"
            disabled={disabled || loading}
            className="input-king flex-1 uppercase tracking-[0.2em]"
          />
        </div>
        <button
          type="button"
          onClick={apply}
          disabled={disabled || loading || !code.trim()}
          className={cn(
            'flex items-center gap-2 border px-4 font-mono text-[10px] uppercase tracking-[0.25em] transition',
            loading || !code.trim()
              ? 'cursor-not-allowed border-white/5 text-king-silver/40'
              : 'border-king-red text-king-red hover:bg-king-red hover:text-king-bone'
          )}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Aplicar
        </button>
      </div>
    </div>
  );
}
