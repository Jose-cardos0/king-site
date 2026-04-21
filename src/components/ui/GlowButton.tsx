import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  fullWidth?: boolean;
}

export default function GlowButton({
  children,
  variant = 'primary',
  fullWidth,
  className,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={cn(
        variant === 'primary' ? 'btn-king' : 'btn-ghost',
        fullWidth && 'w-full',
        'disabled:opacity-40 disabled:pointer-events-none',
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
