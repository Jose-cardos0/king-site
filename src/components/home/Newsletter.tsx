import { motion } from 'framer-motion';
import { useState } from 'react';
import { HiArrowNarrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Bem-vindo à realeza. Boas-vindas em sua caixa.');
    setEmail('');
  };

  return (
    <section className="relative overflow-hidden bg-king-jet py-32">
      <div className="light-rays opacity-20" />
      <div className="container-king relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-king-red">
            Inscreva-se na realeza
          </span>
          <h2 className="heading-display text-4xl md:text-6xl text-king-fg">
            DROPS EM <span className="text-gradient-red">PRIMEIRA MÃO</span>
          </h2>
          <p className="font-serif italic text-king-silver/80">
            Acesso antecipado, convites para tiragens limitadas e bênçãos digitais.
          </p>
          <form
            onSubmit={onSubmit}
            className="flex w-full max-w-md items-end gap-4"
          >
            <div className="flex-1">
              <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rei@dominio.com"
                className="input-king mt-1"
              />
            </div>
            <button
              type="submit"
              className="flex h-12 w-12 items-center justify-center bg-king-red/90 text-king-bone transition hover:bg-king-glow/95 hover:shadow-glow-red"
            >
              <HiArrowNarrowRight />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
