import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
} from 'react-icons/hi';
import { Tag, Power } from 'lucide-react';
import { cn } from '@/utils/cn';
import GlowButton from '@/components/ui/GlowButton';
import AdminPaginationBar, {
  ADMIN_PAGE_SIZE,
} from '@/components/admin/AdminPaginationBar';
import {
  createCoupon,
  deleteCoupon,
  listCoupons,
  normalizeCode,
  updateCoupon,
  type Coupon,
} from '@/services/coupons.service';
import { useThemeStore } from '@/store/useThemeStore';

export default function CouponsTab() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [creating, setCreating] = useState(false);
  const [page, setPage] = useState(1);

  const load = async () => {
    try {
      setLoading(true);
      const list = await listCoupons();
      setItems(list);
    } catch {
      toast.error('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pageItems = useMemo(() => {
    const start = (page - 1) * ADMIN_PAGE_SIZE;
    return items.slice(start, start + ADMIN_PAGE_SIZE);
  }, [items, page]);

  const onDelete = async (id: string) => {
    if (!confirm('Apagar este cupom?')) return;
    try {
      await deleteCoupon(id);
      toast.success('Cupom removido');
      load();
    } catch {
      toast.error('Erro ao remover');
    }
  };

  const toggleActive = async (c: Coupon) => {
    try {
      await updateCoupon(c.id, { active: !c.active });
      setItems((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x))
      );
    } catch {
      toast.error('Erro ao atualizar');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="spinner-crown" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-king-silver">
            {items.length} cupom(ns) cadastrado(s)
          </p>
          <p className="mt-1 font-serif italic text-xs text-king-silver/70">
            Códigos são case-insensitive e salvos em maiúsculas. Use apenas letras,
            números, hífen e underscore.
          </p>
        </div>
        <GlowButton onClick={() => setCreating(true)}>
          <HiOutlinePlus /> Novo cupom
        </GlowButton>
      </div>

      <div className="overflow-hidden border border-white/5">
        <table className="w-full">
          <thead className="bg-king-jet">
            <tr className="text-left font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver/70">
              <th className="p-4">Código</th>
              <th className="p-4">Desconto</th>
              <th className="p-4 hidden md:table-cell">Usos</th>
              <th className="p-4 hidden md:table-cell">Validade</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((c) => (
              <tr
                key={c.id}
                className="border-t border-white/5 transition hover:bg-white/[0.02]"
              >
                <td className="p-4">
                  <span className="inline-flex items-center gap-2 rounded-sm border border-king-red/40 bg-king-red/10 px-3 py-1 font-mono text-[11px] tracking-[0.22em] text-king-red">
                    <Tag className="h-3 w-3" /> #{c.code}
                  </span>
                </td>
                <td className="p-4 font-display text-king-fg">
                  {c.discountPercent}%
                </td>
                <td className="p-4 hidden md:table-cell font-mono text-xs text-king-silver">
                  {c.usedCount}
                  {c.maxUses ? ` / ${c.maxUses}` : ''}
                </td>
                <td className="p-4 hidden md:table-cell font-mono text-xs text-king-silver">
                  {c.expiresAt
                    ? new Date(c.expiresAt).toLocaleDateString('pt-BR')
                    : '—'}
                </td>
                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => toggleActive(c)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] transition',
                      c.active
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:brightness-110'
                        : 'border-white/15 bg-white/5 text-king-silver hover:border-king-red'
                    )}
                    title="Alternar ativo/inativo"
                  >
                    <Power className="h-3 w-3" />
                    {c.active ? 'ativo' : 'inativo'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => setEditing(c)}
                      className="flex h-9 w-9 items-center justify-center border border-white/10 text-king-silver hover:border-king-red hover:text-king-fg"
                      aria-label="Editar"
                    >
                      <HiOutlinePencil />
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="flex h-9 w-9 items-center justify-center border border-white/10 text-king-silver hover:border-red-500 hover:text-red-500"
                      aria-label="Apagar"
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center font-serif italic text-king-silver/70"
                >
                  Nenhum cupom cadastrado. Crie o primeiro com “Novo cupom”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <AdminPaginationBar
          page={page}
          totalItems={items.length}
          onPageChange={setPage}
        />
      </div>

      {(creating || editing) && (
        <CouponEditor
          coupon={editing ?? null}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            load();
          }}
        />
      )}
    </>
  );
}

function CouponEditor({
  coupon,
  onClose,
  onSaved,
}: {
  coupon: Coupon | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isLight = useThemeStore((s) => s.theme === 'light');
  const [code, setCode] = useState(coupon?.code ?? '');
  const [discount, setDiscount] = useState(coupon?.discountPercent ?? 10);
  const [active, setActive] = useState(coupon?.active ?? true);
  const [maxUses, setMaxUses] = useState(
    coupon?.maxUses ? String(coupon.maxUses) : ''
  );
  const [expiresAt, setExpiresAt] = useState(coupon?.expiresAt ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const save = async () => {
    const normalized = normalizeCode(code);
    if (!normalized) {
      toast.error('Informe um código válido');
      return;
    }
    if (!discount || discount <= 0 || discount > 100) {
      toast.error('Desconto precisa ser entre 1 e 100');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: normalized,
        discountPercent: discount,
        active,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? expiresAt : null,
      };
      if (coupon) {
        await updateCoupon(coupon.id, payload);
        toast.success('Cupom atualizado');
      } else {
        await createCoupon(payload);
        toast.success('Cupom criado');
      }
      onSaved();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      data-king-modal
      className="fixed inset-0 z-[10050] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full max-w-md overflow-hidden rounded-2xl border shadow-[0_24px_100px_rgba(0,0,0,0.75)]',
          isLight ? 'border-king-ash/40 bg-white' : 'border-king-ash/40 bg-king-jet'
        )}
      >
        <header className="flex items-center justify-between border-b border-white/5 p-5">
          <h3 className="heading-display text-xl text-king-fg">
            {coupon ? 'Editar cupom' : 'Novo cupom'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-king-silver hover:border-king-red hover:text-king-fg"
          >
            <HiOutlineX />
          </button>
        </header>

        <div className="space-y-5 p-5">
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver/80">
              Código
            </span>
            <div className="flex items-stretch">
              <span className="flex items-center border border-r-0 border-white/10 bg-white/5 px-3 font-mono text-sm text-king-silver">
                #
              </span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="EVANDSON10"
                className="input-king flex-1 uppercase tracking-[0.2em]"
                autoFocus
              />
            </div>
            <span className="font-serif text-[11px] italic text-king-silver/60">
              Salvo como <code className="font-mono">#{normalizeCode(code) || '...'}</code>.
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver/80">
              Desconto (%)
            </span>
            <input
              type="number"
              min={1}
              max={100}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              className="input-king"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver/80">
                Limite de usos
              </span>
              <input
                type="number"
                min={0}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Ilimitado"
                className="input-king"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver/80">
                Expira em
              </span>
              <input
                type="date"
                value={expiresAt ? expiresAt.slice(0, 10) : ''}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="input-king"
              />
            </label>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2.5">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 accent-king-red"
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-king-silver">
              Ativo (aceita no checkout)
            </span>
          </label>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-white/5 p-5">
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] uppercase tracking-[0.28em] text-king-silver hover:text-king-red"
          >
            Cancelar
          </button>
          <GlowButton onClick={save} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </GlowButton>
        </footer>
      </motion.div>
    </div>
  );
}
