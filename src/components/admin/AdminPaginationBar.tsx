import { cn } from '@/utils/cn';

export const ADMIN_PAGE_SIZE = 20;

type Props = {
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
};

export default function AdminPaginationBar({
  page,
  totalItems,
  onPageChange,
  pageSize = ADMIN_PAGE_SIZE,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= pageSize) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-king-silver">
      <span className="text-king-silver/80">
        {from}–{to} de {totalItems}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(
            'border px-3 py-2 transition',
            page <= 1
              ? 'cursor-not-allowed border-white/5 text-king-silver/30'
              : 'border-white/15 text-king-fg hover:border-king-red hover:text-king-red'
          )}
        >
          Anterior
        </button>
        <span className="px-2 text-king-silver/70">
          Página {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={cn(
            'border px-3 py-2 transition',
            page >= totalPages
              ? 'cursor-not-allowed border-white/5 text-king-silver/30'
              : 'border-white/15 text-king-fg hover:border-king-red hover:text-king-red'
          )}
        >
          Seguinte
        </button>
      </div>
    </div>
  );
}
