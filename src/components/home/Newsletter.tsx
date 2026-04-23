import { motion } from 'framer-motion';
import { useState } from 'react';
import { HiArrowNarrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import {
  createLead,
  formatBRPhone,
  isValidBRPhone,
  normalizePhoneDigits,
} from '@/services/leads.service';

export default function Newsletter() {
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = normalizePhoneDigits(phone);
    if (!isValidBRPhone(digits)) {
      toast.error('Digite um WhatsApp válido com DDD');
      return;
    }
    setSubmitting(true);
    try {
      await createLead(digits, 'newsletter');
      toast.success('Bem-vindo à realeza. Avisaremos em primeira mão.');
      setPhone('');
    } catch {
      toast.error('Não foi possível salvar agora. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
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
            QUER RECEBER NOVIDADES?
          </span>
          <h2 className="heading-display text-4xl md:text-6xl text-king-fg">
            DROPS EM <span className="text-gradient-red">PRIMEIRA MÃO</span>
          </h2>
          <p className="font-serif italic text-king-silver/80">
            Acesso antecipado, convites para tiragens limitadas e bênçãos digitais no seu WhatsApp.
          </p>
          <form
            onSubmit={onSubmit}
            className="flex w-full max-w-md items-end gap-4"
          >
            <div className="flex-1">
              <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver">
                WhatsApp
              </label>
              <input
                type="tel"
                inputMode="numeric"
                required
                value={phone}
                onChange={(e) => setPhone(formatBRPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                maxLength={16}
                className="input-king mt-1"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-12 items-center justify-center bg-king-red/90 text-king-bone transition hover:bg-king-glow/95 hover:shadow-glow-red disabled:opacity-50"
            >
              <HiArrowNarrowRight />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
