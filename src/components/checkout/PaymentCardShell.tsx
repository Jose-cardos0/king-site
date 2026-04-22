import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import chipImg from '@/assets/card/chip.png';

type Props = {
  children: ReactNode;
  theme: 'light' | 'dark';
};

/**
 * Moldura estilo cartão em volta do Payment Element.
 * Em mobile: sem cartão de trás, menos decoração, mais padding — evita “torre” e overflow.
 */
export default function PaymentCardShell({ children, theme }: Props) {
  const isDark = theme === 'dark';

  return (
    <div className="relative mx-auto w-full max-w-xl max-sm:max-w-none sm:px-1 sm:pt-5 sm:pb-1">
      {/* Verso decorativo — só a partir de sm (em mobile polui e empurra layout) */}
      <div
        className={cn(
          'absolute z-0 hidden rounded-2xl shadow-lg sm:block',
          'left-4 right-0 top-1 h-[min(200px,42vw)] max-h-[220px] rotate-[5deg]',
          'bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-900',
          'ring-1 ring-white/10'
        )}
        aria-hidden
      >
        <div className="absolute left-0 right-0 top-[28%] h-9 bg-zinc-900/90" />
        <div className="absolute bottom-6 right-8 flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-6 rounded-sm bg-fuchsia-300/80"
            />
          ))}
        </div>
        <img
          src={chipImg}
          alt=""
          className="absolute bottom-6 left-8 h-7 w-11 rounded bg-black/25 object-contain p-px shadow-md ring-1 ring-black/30"
          aria-hidden
        />
      </div>

      {/* Frente */}
      <div
        className={cn(
          'relative z-10 overflow-hidden border shadow-xl sm:rounded-2xl sm:shadow-2xl',
          'ring-1 ring-inset max-sm:rounded-xl',
          isDark
            ? 'border-white/10 bg-gradient-to-br from-[#1a1228] via-[#15101f] to-king-black ring-white/5'
            : 'border-king-red/15 bg-gradient-to-br from-king-bone via-white to-king-silver/20 ring-king-red/10'
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute inset-0 opacity-[0.07]',
            'bg-[radial-gradient(ellipse_at_20%_0%,rgba(193,18,31,0.9),transparent_50%)]'
          )}
          aria-hidden
        />

        <div className="relative px-3 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-5">
          {/* Cabeçalho: mobile só chip + marca (pouca altura) */}
          <div className="mb-3 flex items-center justify-between gap-2 sm:mb-5 sm:items-start sm:gap-3">
            <div className="flex min-w-0 items-center gap-2 sm:items-start sm:gap-3">
              <img
                src={chipImg}
                alt=""
                className="h-8 w-10 shrink-0 rounded-md bg-black/20 object-contain p-0.5 shadow-md ring-1 ring-black/25 sm:h-10 sm:w-[2.75rem]"
                aria-hidden
              />
              <div className="hidden flex-col gap-1.5 pt-1 sm:flex" aria-hidden>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {[0, 1, 2, 3].map((group) => (
                    <div key={group} className="flex gap-0.5 sm:gap-1">
                      {Array.from({ length: 4 }).map((__, j) => (
                        <div
                          key={j}
                          className={cn(
                            'h-1.5 w-1.5 rounded-[1px] sm:h-2 sm:w-2 sm:rounded-sm',
                            isDark ? 'bg-fuchsia-300/75' : 'bg-king-red/35'
                          )}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div
                  className={cn(
                    'h-2 w-24 rounded sm:h-2.5 sm:w-32',
                    isDark ? 'bg-white/15' : 'bg-king-graphite/25'
                  )}
                />
              </div>
            </div>
            <span
              className={cn(
                'shrink-0 font-display text-[9px] tracking-[0.28em] sm:text-xs sm:tracking-[0.35em]',
                isDark ? 'text-white/40' : 'text-king-silver'
              )}
            >
              KING
            </span>
          </div>

          <div className="relative -mx-0.5 max-sm:px-0 sm:mx-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
