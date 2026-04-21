import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        center && 'items-center text-center',
        className
      )}
    >
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.4em] text-king-red"
        >
          <span className="h-[1px] w-8 bg-king-red" /> {eyebrow}
          {center && <span className="h-[1px] w-8 bg-king-red" />}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className="heading-display text-4xl md:text-6xl text-king-bone dark:text-king-bone"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className={cn(
            'font-serif text-base md:text-lg text-king-silver/80 max-w-2xl',
            center && 'mx-auto'
          )}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
