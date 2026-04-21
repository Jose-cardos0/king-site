import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import KingLogo from '@/components/ui/KingLogo';

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-king-black">
      <div className="light-rays" />
      <div className="noise-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center gap-6 text-center"
      >
        <KingLogo variant="white" className="mb-2 h-10 w-auto opacity-90" />
        <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-king-red">
          Página não encontrada
        </span>
        <h1 className="heading-display text-[clamp(6rem,22vw,16rem)] leading-none text-gradient-red text-glow">
          404
        </h1>
        <p className="max-w-md font-serif italic text-king-silver/80">
          O caminho que procuras não existe neste reino. Volta à terra firme.
        </p>
        <Link to="/" className="btn-king">
          Voltar à realeza
        </Link>
      </motion.div>
    </main>
  );
}
