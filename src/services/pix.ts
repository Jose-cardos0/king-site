/**
 * Gerador de PIX BR Code (EMV QR) — 100% local, sem API externa.
 * Compatível com qualquer app de banco brasileiro.
 *
 * Spec: Manual do BR Code (Banco Central) + EMV QR Code Specification.
 */

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

export interface PixPayload {
  key: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  /** TXID — identificador alfanumérico até 25 chars. Use "***" pra estático sem id. */
  txid?: string;
  /** Mensagem opcional (ex.: número do pedido). */
  description?: string;
}

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function sanitizeAscii(s: string, max: number): string {
  // Remove acentos e mantém só ASCII visível.
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .trim()
    .slice(0, max);
}

function formatAmount(value: number): string {
  // BR Code aceita ponto como separador decimal, máx. 13 chars (ex.: "1234567890.99")
  if (!Number.isFinite(value) || value <= 0) return '';
  return value.toFixed(2);
}

/** CRC16 CCITT-FALSE (poly 0x1021, init 0xFFFF). Usado pelo padrão BR Code. */
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildPixBRCode(p: PixPayload): string {
  const merchantName = sanitizeAscii(p.merchantName || 'KING', 25);
  const merchantCity = sanitizeAscii(p.merchantCity || 'BRASIL', 15);
  const key = (p.key || '').trim();
  if (!key) throw new Error('Chave PIX obrigatória');

  // Merchant Account Information (campo 26 — PIX)
  let mai = tlv('00', 'BR.GOV.BCB.PIX') + tlv('01', key);
  if (p.description) {
    const desc = sanitizeAscii(p.description, 50);
    if (desc) mai += tlv('02', desc);
  }

  // Additional Data Field (campo 62)
  const txid = sanitizeAscii(p.txid || '***', 25) || '***';
  const adf = tlv('05', txid);

  let payload =
    tlv('00', '01') + // Payload Format Indicator
    tlv('01', '12') + // Point of Initiation Method (12 = "uso único" — força app a usar o valor)
    tlv('26', mai) +
    tlv('52', '0000') + // Merchant Category Code
    tlv('53', '986'); // Currency BRL

  const amount = formatAmount(p.amount ?? 0);
  if (amount) payload += tlv('54', amount);

  payload +=
    tlv('58', 'BR') +
    tlv('59', merchantName) +
    tlv('60', merchantCity) +
    tlv('62', adf);

  // CRC16 — calculado sobre payload + "6304"
  const toCrc = `${payload}6304`;
  const crc = crc16(toCrc);
  return `${payload}6304${crc}`;
}

/** Helper pra montar TXID a partir do orderId (curto, alfanumérico). */
export function txidFromOrderId(orderId: string): string {
  return orderId.replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***';
}
