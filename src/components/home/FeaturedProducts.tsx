import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowNarrowRight } from 'react-icons/hi';
import SectionHeading from '@/components/ui/SectionHeading';
import ProductCard from '@/components/products/ProductCard';
import { useProductsStore } from '@/store/useProductsStore';
import jesus2Img from '@/assets/jesus2.png';

export default function FeaturedProducts() {
  const products = useProductsStore((s) => s.products);
  const fetch = useProductsStore((s) => s.fetch);
  const fetched = useProductsStore((s) => s.fetched);

  useEffect(() => {
    if (!fetched) fetch();
  }, [fetched, fetch]);

  const featured = products.filter((p) => p.featured).slice(0, 4);
  const display = featured.length > 0 ? featured : products.slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-king-jet py-24 md:py-32">
      {/* Arte sacrada — faixa esquerda (~30%), opacidade baixa + entrada */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[30%]"
        initial={{ opacity: 0, x: -56, scale: 1.06 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="h-full w-full opacity-[0.11] md:opacity-[0.14]"
          style={{
            backgroundImage: `url(${jesus2Img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'left center',
            backgroundRepeat: 'no-repeat',
            maskImage: 'linear-gradient(90deg, black 0%, black 55%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(90deg, black 0%, black 55%, transparent 100%)',
          }}
        />
      </motion.div>
      <div className="light-rays relative z-[2] opacity-20" />
      <div className="container-king relative z-[2]">
        <div className="mb-14 flex flex-col items-end justify-between gap-6 md:flex-row">
          <SectionHeading
            eyebrow="Em destaque"
            title="PEÇAS CORINGAS"
            subtitle="Selecionadas à mão. Tiragens limitadas. Reverência em cada ponto de costura."
          />
          <Link
            to="/produtos"
            className="group flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-king-silver transition hover:text-king-red"
          >
            Ver toda a coleção
            <HiArrowNarrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {display.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
