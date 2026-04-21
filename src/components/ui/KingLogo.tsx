import { forwardRef, type ImgHTMLAttributes } from 'react';
import { logoBordo, logoBranco, logoPreto } from '@/assets/logos';
import { useThemeStore } from '@/store/useThemeStore';
import { cn } from '@/utils/cn';

export type KingLogoVariant = 'auto' | 'white' | 'black' | 'bordo';

export type KingLogoProps = ImgHTMLAttributes<HTMLImageElement> & {
  variant?: KingLogoVariant;
};

/**
 * Logo KING oficial.
 * - `auto`: branco no tema escuro, preto no tema claro (fundo claro).
 * - `white` | `black` | `bordo`: força a variante de cor.
 */
const KingLogo = forwardRef<HTMLImageElement, KingLogoProps>(function KingLogo(
  { variant = 'auto', className, alt = 'KING — Oversized', ...props },
  ref
) {
  const theme = useThemeStore((s) => s.theme);

  const src =
    variant === 'white'
      ? logoBranco
      : variant === 'black'
        ? logoPreto
        : variant === 'bordo'
          ? logoBordo
          : theme === 'dark'
            ? logoBranco
            : logoPreto;

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      draggable={false}
      className={cn('h-auto w-auto select-none object-contain', className)}
      {...props}
    />
  );
});

export default KingLogo;
