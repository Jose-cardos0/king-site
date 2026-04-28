import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import chipImg from '@/assets/card/chip.png';
import { useThemeStore } from '@/store/useThemeStore';

type Props = {
  children: ReactNode;
};

/**
 * Moldura estilo cartão físico.
 * Modo **claro** do site: gradiente roxo estilo Nubank (#7a32df → #690f85).
 * Modo **escuro**: gradiente grafite KING (como antes).
 */
export default function PaymentCardShell({ children }: Props) {
  const siteTheme = useThemeStore((s) => s.theme);
  const nu = siteTheme === 'light';

  return (
    <div className="relative mx-auto w-full max-w-xl max-sm:max-w-none sm:px-1 sm:pt-6 sm:pb-1">
      {/*
        Espaço extra no topo: o verso absoluto + rotação (5°) se projetava acima e cobria
        títulos de secção irmãos. padding-top e top maiores alinham tudo com o fluxo.
      */}
      {/* Verso decorativo — só a partir de sm */}
      <div
        className={cn(
          'absolute z-0 hidden rounded-2xl shadow-lg sm:block',
          'left-4 right-0 top-6 h-[min(200px,42vw)] max-h-[220px] rotate-[5deg] sm:top-10',
          nu
            ? 'bg-gradient-to-br from-[#9b4dff] via-[#7a32df] to-[#4a0a72] ring-1 ring-white/25'
            : 'bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-900 ring-1 ring-white/10'
        )}
        aria-hidden
      >
        <div
          className={cn(
            'absolute left-0 right-0 top-[28%] h-9',
            nu ? 'bg-[#1f0528]/90' : 'bg-zinc-900/90'
          )}
        />
        <div className="absolute bottom-6 right-8 flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'h-2 w-6 rounded-sm',
                nu ? 'bg-white/35' : 'bg-fuchsia-300/80'
              )}
            />
          ))}
        </div>
        <img
          src={chipImg}
          alt=""
          className={cn(
            'absolute bottom-6 left-8 h-7 w-11 rounded object-contain p-px shadow-md',
            nu
              ? 'bg-white/10 ring-1 ring-white/30'
              : 'bg-black/25 ring-1 ring-black/30'
          )}
          aria-hidden
        />
      </div>

      {/* Frente */}
      <div
        className={cn(
          'relative z-10 overflow-hidden shadow-xl ring-1 ring-inset sm:rounded-2xl sm:shadow-2xl max-sm:rounded-xl',
          nu
            ? 'border border-white/20 bg-gradient-to-br from-[#7a32df] via-[#7319a8] to-[#690f85] ring-white/15'
            : 'border border-white/10 bg-gradient-to-br from-[#1a1228] via-[#15101f] to-king-black ring-white/5'
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute inset-0',
            nu
              ? 'opacity-[0.22] bg-[radial-gradient(ellipse_at_88%_8%,rgba(255,255,255,0.35),transparent_52%)]'
              : 'opacity-[0.07] bg-[radial-gradient(ellipse_at_20%_0%,rgba(193,18,31,0.9),transparent_50%)]'
          )}
          aria-hidden
        />

        <div className="relative px-3 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-5">
          <div className="mb-3 flex items-center justify-between gap-2 sm:mb-5 sm:items-start sm:gap-3">
            <div className="flex min-w-0 items-center gap-2 sm:items-start sm:gap-3">
              <img
                src={chipImg}
                alt=""
                className={cn(
                  'h-8 w-10 shrink-0 rounded-md object-contain p-0.5 shadow-md sm:h-10 sm:w-[2.75rem]',
                  nu ? 'bg-white/10 ring-1 ring-white/25' : 'bg-black/20 ring-1 ring-black/25'
                )}
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
                            nu ? 'bg-white/40' : 'bg-fuchsia-300/75'
                          )}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div
                  className={cn(
                    'h-2 w-24 rounded sm:h-2.5 sm:w-32',
                    nu ? 'bg-white/25' : 'bg-white/15'
                  )}
                />
              </div>
            </div>
            <span
              className={cn(
                'shrink-0 font-display text-[9px] tracking-[0.28em] sm:text-xs sm:tracking-[0.35em]',
                nu ? 'text-white/55' : 'text-white/40'
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
