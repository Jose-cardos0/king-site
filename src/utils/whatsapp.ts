export const WHATSAPP_NUMBER = '5579999062401';

export function openWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function buildOrderMessage(orderId: string, total: number, userName?: string) {
  const name = userName ? `, sou ${userName}` : '';
  return `Olá KING 👑${name}! Gostaria de informações sobre meu pedido #${orderId.slice(
    0,
    8
  )} (Total: R$ ${total.toFixed(2).replace('.', ',')}).`;
}

export function buildSupportMessage(userName?: string) {
  const name = userName ? `, aqui é ${userName}` : '';
  return `Olá KING 👑${name}! Preciso de ajuda com a minha conta.`;
}
