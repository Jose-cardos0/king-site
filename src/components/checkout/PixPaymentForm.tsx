import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineClipboardCopy, HiOutlineCheck } from 'react-icons/hi';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/utils/cn';
import GlowButton from '@/components/ui/GlowButton';
import { formatBRL } from '@/utils/format';
import { getPixSettings, type PixSettings } from '@/services/settings.service';
import { buildPixBRCode } from '@/services/pix';

interface Props {
  total: number;
  description?: string;
  disabled?: boolean;
  /** Chamado quando o cliente confirma "já paguei" — cria o pedido com paymentStatus 'pending'. */
  onConfirm: () => void | Promise<void>;
}

export default function PixPaymentForm({ total, description, disabled, onConfirm }: Props) {
  const [settings, setSettings] = useState<PixSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const s = await getPixSettings();
        setSettings(s);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const code = useMemo(() => {
    if (!settings || !settings.enabled || !settings.key.trim()) return '';
    try {
      return buildPixBRCode({
        key: settings.key.trim(),
        merchantName: settings.merchantName,
        merchantCity: settings.merchantCity,
        amount: total,
        description,
      });
    } catch {
      return '';
    }
  }, [settings, total, description]);

  const onCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Código PIX copiado');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error('Não foi possível copiar — selecione manualmente abaixo');
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="spinner-crown" />
      </div>
    );
  }

  if (!settings?.enabled || !settings.key.trim()) {
    return (
      <div className="rounded-md border border-amber-500/40 bg-amber-500/[0.06] p-5 font-serif italic text-sm text-amber-200">
        PIX ainda não configurado. Volte e escolha cartão, ou peça pro admin habilitar PIX no painel.
      </div>
    );
  }

  if (!code) {
    return (
      <div className="rounded-md border border-red-500/40 bg-red-500/[0.06] p-5 font-serif italic text-sm text-red-200">
        Não foi possível gerar o QR PIX. Verifique a chave configurada no admin.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-lg bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
          <QRCodeSVG value={code} size={208} level="M" />
        </div>
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-king-silver">
          Aponte a câmera do app do banco
        </p>
        <p className="heading-display text-2xl text-king-fg">{formatBRL(total)}</p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-king-red">
            PIX copia e cola
          </p>
          <div className="mt-2 max-h-32 overflow-y-auto break-all rounded-md border border-white/10 bg-king-black/60 p-3 font-mono text-[11px] leading-relaxed text-king-silver">
            {code}
          </div>
          <button
            type="button"
            onClick={onCopy}
            className={cn(
              'mt-2 inline-flex items-center gap-2 border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] transition',
              copied
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                : 'border-king-red/50 bg-king-red/10 text-king-red hover:bg-king-red/20'
            )}
          >
            {copied ? <HiOutlineCheck /> : <HiOutlineClipboardCopy />}
            {copied ? 'Copiado!' : 'Copiar código'}
          </button>
        </div>

        <ul className="flex flex-col gap-1.5 font-serif text-sm italic text-king-silver/85">
          <li>1. Abra o app do seu banco e escolha PIX.</li>
          <li>2. Use ler QR code OU cole o código acima em "Pix copia e cola".</li>
          <li>3. Confirme o pagamento de <strong className="not-italic font-mono">{formatBRL(total)}</strong>.</li>
          <li>4. Volte aqui e clique em "Já paguei" pra finalizar o pedido.</li>
        </ul>

        <div className="rounded-md border border-king-red/25 bg-king-red/[0.04] p-3 font-mono text-[10px] uppercase tracking-[0.25em] text-king-silver">
          Após confirmar, seu pedido entra como <span className="text-king-red">pendente de pagamento</span>.
          A KING confere o recebimento em poucos minutos e libera a produção.
        </div>

        <GlowButton onClick={handleConfirm} disabled={disabled || submitting}>
          {submitting ? 'Registrando…' : 'Já paguei — finalizar pedido'}
        </GlowButton>
      </div>
    </motion.div>
  );
}
