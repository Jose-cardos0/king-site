import { motion } from 'framer-motion';
import KingLogo from './KingLogo';

export default function LoadingScreen() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-king-black overflow-hidden"
    >
      <div className="light-rays opacity-35" />
      <div className="noise-overlay" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-8"
      >
        <motion.div
          animate={{
            filter: [
              'drop-shadow(0 0 10px rgba(220,20,60,0.18))',
              'drop-shadow(0 0 22px rgba(255,31,61,0.28))',
              'drop-shadow(0 0 10px rgba(220,20,60,0.18))',
            ],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <KingLogo variant="bordo" className="h-20 w-auto sm:h-28" />
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ delay: 0.8 }}
        className="font-serif italic text-sm tracking-[0.3em] text-king-silver"
      >
        Oversized · Sagrado · Soberano
      </motion.p>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-transparent via-king-red/45 to-transparent"
      />
    </motion.div>
  );
}
