/**
 * Envia mensagem de boas-vindas via WhatsApp ao lead da calculadora.
 * Falha silenciosamente para não bloquear o fluxo do usuário.
 */
export async function sendWelcomeMessage(payload: {
  nome: string;
  whatsapp: string;
  economiaProjetada: number;
  sistemaKwp: number;
  payback: number;
}): Promise<void> {
  try {
    await fetch('/api/whatsapp/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Servidor offline ou WhatsApp desconectado — não interrompe o fluxo
  }
}

/**
 * Envia mensagem de confirmação via WhatsApp ao lead do formulário de contato.
 * Falha silenciosamente para não bloquear o fluxo do usuário.
 */
export async function sendContactMessage(payload: {
  nome: string;
  whatsapp: string;
}): Promise<void> {
  try {
    await fetch('/api/whatsapp/send-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Servidor offline ou WhatsApp desconectado — não interrompe o fluxo
  }
}
