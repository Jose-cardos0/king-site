import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiArrowNarrowLeft,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useProductsStore } from '@/store/useProductsStore';
import { useCartStore } from '@/store/useCartStore';
import { formatBRL } from '@/utils/format';
import type { Product, ProductSize } from '@/services/products.service';
import { getProduct } from '@/services/products.service';
import { SEED_PRODUCTS } from '@/data/seedProducts';
import { cn } from '@/utils/cn';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const storeProducts = useProductsStore((s) => s.products);
  const fetchStore = useProductsStore((s) => s.fetch);
  const fetched = useProductsStore((s) => s.fetched);
  const add = useCartStore((s) => s.add);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [size, setSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!fetched) fetchStore();
  }, [fetched, fetchStore]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const local = storeProducts.find((p) => p.id === id);
      if (local) {
        setProduct(local);
        setLoading(false);
        return;
      }
      try {
        const remote = await getProduct(id);
        if (remote) {
          setProduct(remote);
        } else {
          const seed = SEED_PRODUCTS.find((p) => p.id === id);
          if (seed) setProduct(seed);
        }
      } catch {
        const seed = SEED_PRODUCTS.find((p) => p.id === id);
        if (seed) setProduct(seed);
      }
      setLoading(false);
    };
    load();
  }, [id, storeProducts]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="spinner-crown" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h2 className="heading-display text-3xl text-king-bone">Peça não encontrada</h2>
        <Link to="/produtos" className="font-mono text-xs uppercase tracking-[0.3em] text-king-red">
          ← Voltar para a coleção
        </Link>
      </main>
    );
  }

  const addToCart = () => {
    if (!size) {
      toast.error('Selecione um tamanho');
      return;
    }
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size,
      quantity,
    });
    toast.success('Adicionado à sacola real');
  };

  const buyNow = () => {
    if (!size) {
      toast.error('Selecione um tamanho');
      return;
    }
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size,
      quantity,
    });
    navigate('/checkout');
  };

  return (
    <main className="relative bg-king-black py-16">
      <div className="light-rays opacity-20" />
      <div className="container-king relative">
        <Link
          to="/produtos"
          className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-king-silver hover:text-king-red"
        >
          <HiArrowNarrowLeft /> Voltar à coleção
        </Link>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Gallery */}
          <div>
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[3/4] overflow-hidden bg-king-graphite"
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 shadow-inner-glow pointer-events-none" />
            </motion.div>

            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'aspect-square overflow-hidden border transition',
                      selectedImage === i
                        ? 'border-king-red shadow-glow-red'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            {product.tag && (
              <span className="self-start bg-king-red/88 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-king-bone">
                {product.tag}
              </span>
            )}

            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-king-silver">
              {product.category.replace('-', ' ')}
            </p>

            <h1 className="mt-2 heading-display text-4xl md:text-6xl leading-[0.95] text-king-bone">
              {product.name}
            </h1>

            <div className="mt-6 flex items-baseline gap-4">
              <span className="heading-display text-3xl text-king-bone">
                {formatBRL(product.price)}
              </span>
              {product.oldPrice && (
                <span className="font-mono text-sm text-king-silver/50 line-through">
                  {formatBRL(product.oldPrice)}
                </span>
              )}
            </div>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-king-silver/70">
              Em até 6x de {formatBRL(product.price / 6)} sem juros
            </p>

            <div className="my-8 h-px w-full bg-gradient-to-r from-king-red/22 to-transparent" />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-serif text-base leading-relaxed text-king-silver/90 md:text-lg"
            >
              {product.description}
            </motion.p>

            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-king-silver">
                  Tamanho
                </p>
                <button className="font-mono text-[11px] uppercase tracking-[0.3em] text-king-red hover:underline">
                  Guia de medidas
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      'h-12 min-w-[52px] border px-4 font-mono text-sm uppercase tracking-[0.25em] transition',
                      size === s
                        ? 'border-king-red bg-king-red text-king-bone shadow-glow-red'
                        : 'border-white/15 text-king-silver hover:border-king-red hover:text-king-bone'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-king-silver">
                Quantidade
              </p>
              <div className="inline-flex items-center border border-white/15">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-11 w-11 text-king-silver hover:text-king-red"
                >
                  −
                </button>
                <span className="min-w-[52px] text-center font-display text-base text-king-bone">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-11 w-11 text-king-silver hover:text-king-red"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={addToCart}
                className="btn-king flex-1 group"
              >
                <HiOutlineShoppingBag /> Adicionar à sacola
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={buyNow}
                className="btn-ghost flex-1"
              >
                Comprar agora
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="flex h-14 w-14 items-center justify-center border border-white/15 text-king-silver transition hover:border-king-red hover:text-king-red"
                aria-label="Favoritar"
              >
                <HiOutlineHeart className="text-lg" />
              </motion.button>
            </div>

            <AnimatePresence>
              {product.stock <= 10 && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-king-glow"
                >
                  ⚡ Apenas {product.stock} peças em estoque
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/5 pt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-king-silver/80">
              <div>✝ Envio em 24h</div>
              <div>👑 Trocas em 30 dias</div>
              <div>🔒 Pagamento seguro</div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
