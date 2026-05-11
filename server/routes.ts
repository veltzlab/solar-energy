import { Router, Request, Response } from 'express';
import {
  sendWhatsAppMessage,
  getStatus,
  getQRCodeImage,
  getConversations,
  getConversation,
  markRead,
  waEvents,
  connectWhatsApp,
  disconnectWhatsApp,
} from './whatsapp';

export const router = Router();

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

// ─── Status da conexão ────────────────────────────────────────────────────────
router.get('/whatsapp/status', (_req: Request, res: Response) => {
  res.json(getStatus());
});

// ─── QR Code como imagem base64 ──────────────────────────────────────────────
router.get('/whatsapp/qr', async (_req: Request, res: Response) => {
  try {
    const qrImage = await getQRCodeImage();
    res.json({ qr: qrImage ?? null });
  } catch {
    res.status(500).json({ error: 'Erro ao gerar QR Code' });
  }
});

// ─── SSE: stream de eventos em tempo real ─────────────────────────────────────
router.get('/whatsapp/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (data: object) => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch {
      // cliente desconectou
    }
  };

  // Estado inicial (inclui o QR se já disponível)
  const { connected, phone, hasQR } = getStatus();
  send({ type: 'init', conversations: getConversations(), connected, phone, hasQR });

  // Se já há QR gerado, envia a imagem imediatamente para este cliente
  // (resolve o race condition: QR gerado antes do SSE conectar)
  if (!connected && hasQR) {
    getQRCodeImage().then((qrImage) => {
      if (qrImage) send({ type: 'qr', qrImage });
    }).catch(() => {});
  }

  // Heartbeat para manter a conexão viva através de proxies
  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n'); } catch { clearInterval(heartbeat); }
  }, 20_000);

  const onUpdate = (payload: object) => send({ type: 'update', ...payload });
  const onQR = (payload: { qrImage: string }) => send({ type: 'qr', ...payload });
  const onConnected = (payload: { phone: string | null }) => send({ type: 'connected', ...payload });

  waEvents.on('update', onUpdate);
  waEvents.on('qr', onQR);
  waEvents.on('connected', onConnected);

  req.on('close', () => {
    clearInterval(heartbeat);
    waEvents.off('update', onUpdate);
    waEvents.off('qr', onQR);
    waEvents.off('connected', onConnected);
  });
});

// ─── Lista de conversas ───────────────────────────────────────────────────────
router.get('/whatsapp/conversations', (_req: Request, res: Response) => {
  res.json(getConversations());
});

// ─── Mensagens de uma conversa ────────────────────────────────────────────────
router.get('/whatsapp/messages', (req: Request, res: Response) => {
  const jid = req.query.jid as string;
  if (!jid) { res.status(400).json({ error: 'jid é obrigatório' }); return; }
  const conv = getConversation(jid);
  res.json(conv?.messages ?? []);
});

// ─── Marcar conversa como lida ────────────────────────────────────────────────
router.post('/whatsapp/mark-read', (req: Request, res: Response) => {
  const { jid } = req.body as { jid?: string };
  if (jid) markRead(jid);
  res.json({ success: true });
});

// ─── Envio manual de mensagem ─────────────────────────────────────────────────
router.post('/whatsapp/send', async (req: Request, res: Response) => {
  const { phone, message } = req.body as { phone: string; message: string };

  if (!phone || !message?.trim()) {
    res.status(400).json({ error: 'phone e message são obrigatórios.' });
    return;
  }

  console.log(`📤 [SEND] Para: ${phone} | Mensagem: ${message.substring(0, 50)}...`);

  try {
    await sendWhatsAppMessage(phone, message);
    console.log(`✅ [SEND] Mensagem enviada para ${phone}`);
    res.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('❌ [whatsapp/send]', msg);
    res.status(503).json({ error: msg });
  }
});

// ─── Desconectar WhatsApp ─────────────────────────────────────────────────────
router.post('/whatsapp/disconnect', async (_req: Request, res: Response) => {
  try {
    await disconnectWhatsApp();
    res.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[whatsapp/disconnect]', msg);
    res.status(500).json({ error: msg });
  }
});

// ─── Boas-vindas automáticas (Calculadora) ───────────────────────────────────
router.post('/whatsapp/send-welcome', async (req: Request, res: Response) => {
  const { nome, whatsapp, economiaProjetada, sistemaKwp, payback, template } = req.body as {
    nome: string;
    whatsapp: string;
    economiaProjetada: number;
    sistemaKwp: number;
    payback: number;
    template?: string;
  };

  if (!nome || !whatsapp) {
    res.status(400).json({ error: 'nome e whatsapp são obrigatórios.' });
    return;
  }

  const firstName = nome.trim().split(' ')[0];
  const message = template
    ? applyVars(template, { nome: firstName, economia: formatBRL(economiaProjetada), sistema: String(sistemaKwp), payback: String(payback) })
    : `Olá, ${firstName}! 👋\n\nRecebemos sua simulação de energia solar e ficamos felizes com seu interesse! ☀️\n\n📊 *Resumo da sua simulação:*\n• Economia mensal estimada: *${formatBRL(economiaProjetada)}*\n• Sistema indicado: *${sistemaKwp} kWp*\n• Retorno do investimento: *${payback} anos*\n\nEm breve nossa equipe entrará em contato para apresentar sua proposta personalizada!\n\n_Solar Energy — Transformando o sol em economia real_ 🌱`;

  try {
    await sendWhatsAppMessage(whatsapp, message);
    res.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao enviar';
    console.error('[send-welcome]', msg);
    res.status(503).json({ error: msg });
  }
});

// ─── Confirmação de contato ───────────────────────────────────────────────────
router.post('/whatsapp/send-contact', async (req: Request, res: Response) => {
  const { nome, whatsapp, template } = req.body as { nome: string; whatsapp: string; template?: string };

  if (!nome || !whatsapp) {
    res.status(400).json({ error: 'nome e whatsapp são obrigatórios.' });
    return;
  }

  const firstName = nome.trim().split(' ')[0];
  const message = template
    ? applyVars(template, { nome: firstName, economia: '', sistema: '', payback: '' })
    : `Olá, ${firstName}! 👋\n\nRecebemos sua mensagem no site da *Solar Energy*! 🌞\n\nNossa equipe de especialistas retornará em breve.\n\n_Solar Energy — Energia limpa e acessível_ 🌱`;

  try {
    await sendWhatsAppMessage(whatsapp, message);
    res.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao enviar';
    console.error('[send-contact]', msg);
    res.status(503).json({ error: msg });
  }
});

// ─── Helper ───────────────────────────────────────────────────────────────────
function applyVars(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}
