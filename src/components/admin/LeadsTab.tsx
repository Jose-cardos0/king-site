import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { HiOutlineTrash, HiOutlineRefresh } from 'react-icons/hi';
import { MessageCircle, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import AdminPaginationBar, {
  ADMIN_PAGE_SIZE,
} from '@/components/admin/AdminPaginationBar';
import {
  buildWhatsAppUrl,
  deleteLead,
  formatBRPhone,
  listLeads,
  type Lead,
} from '@/services/leads.service';
import { useThemeStore } from '@/store/useThemeStore';

const DEFAULT_MESSAGE =
  'Olá! Aqui é da KING OVERSIZED 👑 Obrigado por assinar nossos drops. Quer ver o que acabou de chegar?';

function formatDate(value: unknown): string {
  if (!value) return '—';
  try {
    if (typeof value === 'object' && value !== null && 'toDate' in value) {
      const d = (value as { toDate: () => Date }).toDate();
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  } catch {
    // ignore
  }
  return '—';
}

export default function LeadsTab() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const isLight = useThemeStore((s) => s.theme === 'light');

  const load = async () => {
    try {
      setLoading(true);
      const list = await listLeads();
      setItems(list);
    } catch {
      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pageItems = useMemo(() => {
    const start = (page - 1) * ADMIN_PAGE_SIZE;
    return items.slice(start, start + ADMIN_PAGE_SIZE);
  }, [items, page]);

  const onDelete = async (id: string) => {
    if (!confirm('Remover este lead da lista?')) return;
    try {
      await deleteLead(id);
      toast.success('Lead removido');
      setItems((prev) => prev.filter((l) => l.id !== id));
    } catch {
      toast.error('Erro ao remover');
    }
  };

  const openWhatsApp = (lead: Lead) => {
    const url = buildWhatsAppUrl(lead.phoneDigits, DEFAULT_MESSAGE);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="spinner-crown" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-king-red" aria-hidden />
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-king-silver">
            {items.length} lead(s) capturado(s) via WhatsApp
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 border border-white/15 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.28em] text-king-silver transition hover:border-king-red hover:text-king-fg"
        >
          <HiOutlineRefresh /> Atualizar
        </button>
      </div>

      {items.length === 0 ? (
        <div
          className={cn(
            'border p-10 text-center font-serif italic',
            isLight
              ? 'border-black/[0.08] bg-white text-king-ink/70'
              : 'border-white/5 bg-king-jet/40 text-king-silver/70'
          )}
        >
          Nenhum lead ainda. Quando alguém digitar o WhatsApp no formulário da home, ele aparece aqui.
        </div>
      ) : (
        <div className="overflow-hidden border border-white/5">
          <table className="w-full">
            <thead className="bg-king-jet">
              <tr className="text-left font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver/70">
                <th className="p-4">WhatsApp</th>
                <th className="p-4 hidden md:table-cell">Origem</th>
                <th className="p-4 hidden md:table-cell">Capturado em</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-t border-white/5 transition hover:bg-white/[0.02]"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-king-red/10 text-king-red">
                        <MessageCircle className="h-4 w-4" aria-hidden />
                      </div>
                      <div>
                        <p className="heading-display text-sm text-king-fg">
                          {lead.phone || formatBRPhone(lead.phoneDigits)}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-king-silver/60 md:hidden">
                          {lead.source ?? '—'} · {formatDate(lead.createdAt)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell font-mono text-[11px] uppercase tracking-[0.25em] text-king-silver">
                    {lead.source ?? 'newsletter'}
                  </td>
                  <td className="p-4 hidden md:table-cell font-mono text-sm text-king-silver">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => openWhatsApp(lead)}
                        className="inline-flex items-center gap-2 border border-[#25D366]/40 bg-[#25D366]/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#25D366] transition hover:bg-[#25D366] hover:text-king-black"
                      >
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                        Abrir WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(lead.id)}
                        className="flex h-9 w-9 items-center justify-center border border-white/10 text-king-silver hover:border-red-500 hover:text-red-500"
                        aria-label="Remover lead"
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <AdminPaginationBar
            page={page}
            totalItems={items.length}
            onPageChange={setPage}
          />
        </div>
      )}
    </motion.div>
  );
}
