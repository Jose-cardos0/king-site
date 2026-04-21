import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
} from 'react-icons/hi';
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
  type Product,
  type ProductCategory,
  type ProductInput,
  type ProductSize,
} from '@/services/products.service';
import { listAllOrders, updateOrderStatus, type Order, type OrderStatus } from '@/services/orders.service';
import { formatBRL, formatDate } from '@/utils/format';
import GlowButton from '@/components/ui/GlowButton';
import KingLogo from '@/components/ui/KingLogo';
import { cn } from '@/utils/cn';

const ALL_SIZES: ProductSize[] = ['P', 'M', 'G', 'GG', 'XGG'];
const CATEGORIES: ProductCategory[] = [
  'oversized',
  'camiseta',
  'moletom',
  'regata',
  'colecao-sacra',
];

const STATUS_OPTIONS: OrderStatus[] = [
  'pendente',
  'confirmado',
  'enviado',
  'entregue',
  'cancelado',
];

export default function Admin() {
  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; product?: Product } | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const p = await listProducts();
      setProducts(p);
    } catch {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const o = await listAllOrders();
      setOrders(o);
    } catch {
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'products') loadProducts();
    else loadOrders();
  }, [tab]);

  const onDelete = async (id: string) => {
    if (!confirm('Excluir este produto definitivamente?')) return;
    try {
      await deleteProduct(id);
      toast.success('Produto removido');
      loadProducts();
    } catch {
      toast.error('Erro ao remover');
    }
  };

  const onStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      toast.success('Status atualizado');
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch {
      toast.error('Erro ao atualizar');
    }
  };

  return (
    <main className="relative min-h-screen bg-king-black py-12">
      <div className="light-rays opacity-20" />
      <div className="container-king relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-king-red/25 bg-king-red/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-king-glow">
            ✝ Painel Real
          </span>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
            <KingLogo variant="white" className="h-12 w-auto max-w-[220px] sm:h-16" />
            <h1 className="heading-display text-4xl text-king-bone md:text-6xl">
              <span className="text-gradient-red">ADMIN</span>
            </h1>
          </div>
          <p className="mt-3 font-serif italic text-king-silver/80">
            Governe o reino. Gerencie produtos e pedidos.
          </p>
        </motion.div>

        <div className="mb-8 flex gap-2">
          {(['products', 'orders'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.3em] transition',
                tab === t
                  ? 'border-king-red bg-king-red text-king-bone shadow-glow-red'
                  : 'border-white/10 text-king-silver hover:border-king-red'
              )}
            >
              {t === 'products' ? 'Produtos' : 'Pedidos'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner-crown" />
          </div>
        ) : tab === 'products' ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-king-silver">
                {products.length} produtos no reino
              </p>
              <GlowButton onClick={() => setModal({ mode: 'create' })}>
                <HiOutlinePlus /> Novo produto
              </GlowButton>
            </div>

            <div className="overflow-hidden border border-white/5">
              <table className="w-full">
                <thead className="bg-king-jet">
                  <tr className="text-left font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver/70">
                    <th className="p-4">Produto</th>
                    <th className="p-4 hidden md:table-cell">Categoria</th>
                    <th className="p-4">Preço</th>
                    <th className="p-4 hidden md:table-cell">Estoque</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-white/5 transition hover:bg-white/[0.02]"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-12 overflow-hidden bg-king-graphite">
                            <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="heading-display text-sm text-king-bone">{p.name}</p>
                            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-king-silver/60 md:hidden">
                              {p.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell font-mono text-[11px] uppercase tracking-[0.25em] text-king-silver">
                        {p.category}
                      </td>
                      <td className="p-4 font-display text-king-bone">
                        {formatBRL(p.price)}
                      </td>
                      <td className="p-4 hidden md:table-cell font-mono text-sm text-king-silver">
                        {p.stock}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => setModal({ mode: 'edit', product: p })}
                            className="flex h-9 w-9 items-center justify-center border border-white/10 text-king-silver hover:border-king-red hover:text-king-bone"
                          >
                            <HiOutlinePencil />
                          </button>
                          <button
                            onClick={() => onDelete(p.id)}
                            className="flex h-9 w-9 items-center justify-center border border-white/10 text-king-silver hover:border-red-500 hover:text-red-500"
                          >
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center font-serif italic text-king-silver/70">
                        Nenhum produto cadastrado ainda. Adicione o primeiro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {orders.length === 0 && (
              <p className="py-10 text-center font-serif italic text-king-silver/70">
                Nenhum pedido recebido ainda.
              </p>
            )}
            {orders.map((o) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver">
                    #{o.id.slice(0, 10)}
                  </p>
                  <p className="heading-display text-base text-king-bone">
                    {o.shipping.fullName}
                  </p>
                  <p className="font-serif italic text-xs text-king-silver/70">
                    {o.userEmail} · {formatDate(o.createdAt)}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-king-silver/70">
                    {o.items.length} itens · {formatBRL(o.total)} · {o.paymentMethod.toUpperCase()}
                  </p>
                </div>
                <select
                  value={o.status}
                  onChange={(e) => onStatusChange(o.id, e.target.value as OrderStatus)}
                  className="bg-king-jet border border-white/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-king-bone focus:border-king-red outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <ProductModal
            mode={modal.mode}
            product={modal.product}
            onClose={() => setModal(null)}
            onSaved={() => {
              setModal(null);
              loadProducts();
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function ProductModal({
  mode,
  product,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit';
  product?: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductInput>({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    oldPrice: product?.oldPrice,
    images: product?.images ?? [],
    category: product?.category ?? 'oversized',
    sizes: product?.sizes ?? ['M', 'G'],
    stock: product?.stock ?? 10,
    featured: product?.featured ?? false,
    tag: product?.tag,
  });
  const [imagesText, setImagesText] = useState((product?.images ?? []).join('\n'));
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleSize = (s: ProductSize) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s],
    }));
  };

  const save = async () => {
    const images = imagesText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (!form.name || !form.description || form.price <= 0 || images.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setSaving(true);
    try {
      const payload: ProductInput = { ...form, images };
      if (mode === 'create') {
        await createProduct(payload);
        toast.success('Produto adicionado ao reino');
      } else if (product) {
        await updateProduct(product.id, payload);
        toast.success('Produto atualizado');
      }
      onSaved();
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:top-1/2 md:h-auto md:max-h-[90vh] md:w-[640px] md:-translate-x-1/2 md:-translate-y-1/2 z-[81] overflow-y-auto glass p-6 md:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="heading-display text-2xl text-king-bone">
            {mode === 'create' ? 'Novo produto' : 'Editar produto'}
          </h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center border border-white/10"
          >
            <HiOutlineX />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Nome" value={form.name} onChange={(v) => set('name', v)} />
          <Field label="Tag (opcional)" value={form.tag ?? ''} onChange={(v) => set('tag', v)} />
          <Field
            label="Preço (R$)"
            value={String(form.price)}
            onChange={(v) => set('price', parseFloat(v) || 0)}
            type="number"
          />
          <Field
            label="Preço antigo (opcional)"
            value={form.oldPrice ? String(form.oldPrice) : ''}
            onChange={(v) => set('oldPrice', v ? parseFloat(v) : undefined)}
            type="number"
          />
          <Field
            label="Estoque"
            value={String(form.stock)}
            onChange={(v) => set('stock', parseInt(v) || 0)}
            type="number"
          />
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver/80">
              Categoria
            </span>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value as ProductCategory)}
              className="bg-king-jet border border-white/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-king-bone focus:border-king-red outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver/80">
            Tamanhos
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={cn(
                  'h-10 min-w-[46px] border px-3 font-mono text-[11px]',
                  form.sizes.includes(s)
                    ? 'border-king-red bg-king-red text-king-bone'
                    : 'border-white/10 text-king-silver'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver/80">
              Descrição
            </span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="bg-king-jet border border-white/10 p-3 text-sm text-king-bone focus:border-king-red outline-none"
            />
          </label>
        </div>

        <div className="mt-5">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver/80">
              URLs das imagens (uma por linha)
            </span>
            <textarea
              rows={4}
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              placeholder="https://..."
              className="bg-king-jet border border-white/10 p-3 text-xs font-mono text-king-bone focus:border-king-red outline-none"
            />
          </label>
        </div>

        <label className="mt-5 flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured ?? false}
            onChange={(e) => set('featured', e.target.checked)}
            className="h-4 w-4 accent-king-red"
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-king-silver">
            Destaque na home
          </span>
        </label>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="font-mono text-[11px] uppercase tracking-[0.3em] text-king-silver hover:text-king-red"
          >
            Cancelar
          </button>
          <GlowButton onClick={save} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar produto'}
          </GlowButton>
        </div>
      </motion.div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver/80">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-king"
      />
    </label>
  );
}
