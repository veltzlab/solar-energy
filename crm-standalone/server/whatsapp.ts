import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import * as QRCode from 'qrcode';
import path from 'path';
import { EventEmitter } from 'events';
import { rm } from 'fs/promises';

const logger = pino({ level: 'silent' });
const SESSION_PATH = path.join(__dirname, 'session');

type WASocket = ReturnType<typeof makeWASocket>;

let sock: WASocket | null = null;
let isConnected = false;
let currentQRString: string | null = null;
let connectedPhone: string | null = null;
let cachedVersion: [number, number, number] | null = null;

// Função para limpar os dados da sessão
async function clearSession(): Promise<void> {
  try {
    await rm(SESSION_PATH, { recursive: true, force: true });
    console.log('🗑️  Dados da sessão removidos com sucesso');
  } catch (err) {
    console.error('❌ Erro ao remover dados da sessão:', err);
  }
}

// ─── Tipos de conversa ────────────────────────────────────────────────────────
export interface StoredMessage {
  id: string;
  fromMe: boolean;
  body: string;
  timestamp: number;
  pushName?: string;
}

export interface Conversation {
  jid: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastTimestamp: number;
  unread: number;
  messages: StoredMessage[];
}

// ─── Store em memória ─────────────────────────────────────────────────────────
const conversations = new Map<string, Conversation>();
const MAX_MESSAGES_PER_CONV = 200;

// ─── EventEmitter para SSE ────────────────────────────────────────────────────
export const waEvents = new EventEmitter();
waEvents.setMaxListeners(50);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function phoneDisplay(digits: string): string {
  const d = digits.replace(/\D/g, '');
  const local = d.startsWith('55') ? d.slice(2) : d;
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return d;
}

function extractBody(msg: any): string | null {
  let m = msg.message;
  if (!m) return null;

  // Desembrulha mensagens temporárias e view-once
  if (m.ephemeralMessage) m = m.ephemeralMessage.message;
  if (m.viewOnceMessage) m = m.viewOnceMessage.message;
  if (m.viewOnceMessageV2) m = m.viewOnceMessageV2.message;
  if (m.documentWithCaptionMessage) m = m.documentWithCaptionMessage.message;

  if (!m) return null;

  // Ignorar mensagens de sistema/protocolo invisíveis (ex: sincronização de chaves)
  if (m.protocolMessage || m.senderKeyDistributionMessage) return null;

  const text = m.conversation || m.extendedTextMessage?.text;
  if (text) return text;

  if (m.imageMessage) return m.imageMessage.caption || '[Imagem 🖼️]';
  if (m.videoMessage) return m.videoMessage.caption || '[Vídeo 🎥]';
  if (m.audioMessage) return '[Áudio 🎵]';
  if (m.documentMessage) return `[Documento 📄 ${m.documentMessage.fileName ?? ''}]`;
  if (m.stickerMessage) return '[Figurinha]';
  if (m.locationMessage) return '[Localização 📍]';
  if (m.contactMessage) return '[Contato 👤]';
  if (m.contactsArrayMessage) return '[Contatos 👥]';

  // Se a mensagem contiver apenas metadados, é lixo de protocolo
  const keys = Object.keys(m).filter(k => k !== 'messageContextInfo');
  if (keys.length === 0) return null;

  return '[Formato de mensagem não suportado]';
}

function upsertConversation(jid: string, msg: StoredMessage, pushName?: string) {
  const phone = jid.split('@')[0];

  if (!conversations.has(jid)) {
    conversations.set(jid, {
      jid,
      name: pushName || phoneDisplay(phone),
      phone,
      lastMessage: msg.body,
      lastTimestamp: msg.timestamp,
      unread: msg.fromMe ? 0 : 1,
      messages: [],
    });
  } else {
    const conv = conversations.get(jid)!;
    conv.lastMessage = msg.body;
    conv.lastTimestamp = msg.timestamp;
    if (!msg.fromMe) conv.unread++;
    if (pushName && pushName !== conv.name) conv.name = pushName;
  }

  const conv = conversations.get(jid)!;

  // Evita duplicatas (Baileys pode reemitir mensagens antigas)
  if (!conv.messages.find((m) => m.id === msg.id)) {
    conv.messages.push(msg);
    // Limita histórico para não vazar memória
    if (conv.messages.length > MAX_MESSAGES_PER_CONV) {
      conv.messages = conv.messages.slice(-MAX_MESSAGES_PER_CONV);
    }
  }

  waEvents.emit('update', { jid, conversation: { ...conv, messages: [...conv.messages] } });
}

// ─── Exports para as rotas ────────────────────────────────────────────────────
export function getConversations(): Conversation[] {
  return Array.from(conversations.values())
    .sort((a, b) => b.lastTimestamp - a.lastTimestamp)
    .map((c) => ({ ...c, messages: [...c.messages] }));
}

export function getConversation(jid: string): Conversation | undefined {
  const c = conversations.get(jid);
  return c ? { ...c, messages: [...c.messages] } : undefined;
}

export function markRead(jid: string): void {
  const conv = conversations.get(jid);
  if (conv) conv.unread = 0;
}

// ─── Conexão Baileys ──────────────────────────────────────────────────────────
export async function connectWhatsApp(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);
  if (!cachedVersion) {
    try {
      const result = await fetchLatestBaileysVersion();
      cachedVersion = result.version;
    } catch (error) {
      console.error('⚠️ Erro ao buscar versão do Baileys, usando versão de fallback:', error);
      cachedVersion = [2, 3000, 1015901307];
    }
  }
  const version = cachedVersion;

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false, // Desativado para não poluir o terminal
    logger,
    browser: ['Solar Energy CRM', 'Chrome', '120.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      if (!currentQRString) {
        console.log('\n📱 QR Code gerado! Acesse o CRM → WhatsApp para escanear.\n');
      }
      currentQRString = qr;
      isConnected = false;
      connectedPhone = null;
      
      // Emite o QR imediatamente via SSE para o frontend não precisar esperar o polling
      try {
        const qrImage = await QRCode.toDataURL(qr, {
          width: 320,
          margin: 2,
          color: { dark: '#09090b', light: '#ffffff' },
        });
        waEvents.emit('qr', { qrImage });
      } catch { /* ignora erro de geração */ }
    }

    if (connection === 'open') {
      isConnected = true;
      currentQRString = null;
      connectedPhone = sock?.user?.id?.split(':')[0] ?? null;
      console.log(`✅ WhatsApp conectado! Número: ${connectedPhone}`);
      // Notifica o frontend via SSE que conectou
      waEvents.emit('connected', { phone: connectedPhone });
    }

    if (connection === 'close') {
      isConnected = false;
      connectedPhone = null;
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`⚠️  Conexão encerrada (código: ${statusCode}). Reconectar: ${shouldReconnect}`);

      if (statusCode === DisconnectReason.loggedOut) {
        console.log('🔒 Sessão encerrada (logout). Removendo dados da sessão...');
        // Notifica o frontend que foi desconectado
        waEvents.emit('connected', { phone: null }); // Envia phone: null para indicar desconectado
        // Limpa o QR e notifica via SSE
        currentQRString = null;
        waEvents.emit('qr', { qrImage: null });
        // Remove os dados da sessão
        await clearSession();
      } else if (shouldReconnect) {
        setTimeout(connectWhatsApp, 5000);
      } else {
        currentQRString = null;
        console.log('🔒 Sessão encerrada (logout). Delete a pasta ./session e reinicie.');
      }
    }
  });

  // ── Recebe mensagens em tempo real ─────────────────────────────────────────
  sock.ev.on('messages.upsert', ({ messages, type }) => {
    // 'notify' = mensagem nova; 'append' = histórico antigo
    if (type !== 'notify') return;

    for (const raw of messages) {
      if (!raw.message) continue;

      const jid = raw.key.remoteJid;
      if (!jid || jid.endsWith('@g.us') || jid === 'status@broadcast') continue;

      const body = extractBody(raw);
      if (!body) continue; // Ignora eventos silenciosos

      const ts = Number(raw.messageTimestamp ?? Math.floor(Date.now() / 1000));
      const fromMe = raw.key.fromMe ?? false;
      const pushName = raw.pushName ?? undefined;

      const stored: StoredMessage = {
        id: raw.key.id ?? `msg_${Date.now()}`,
        fromMe,
        body,
        timestamp: ts,
        pushName,
      };

      upsertConversation(jid, stored, pushName);
    }
  });
}

// ─── Envio de mensagem (também registra na conversa) ─────────────────────────
export async function sendWhatsAppMessage(phone: string, message: string): Promise<void> {
  if (!sock || !isConnected) {
    throw new Error('WhatsApp não está conectado. Escaneie o QR Code no painel do CRM.');
  }

  const digits = phone.replace(/\D/g, '');
  const fullNumber = digits.startsWith('55') ? digits : `55${digits}`;
  const jid = `${fullNumber}@s.whatsapp.net`;

  await sock.sendMessage(jid, { text: message });

  // Registra como mensagem enviada
  const stored: StoredMessage = {
    id: `sent_${Date.now()}`,
    fromMe: true,
    body: message,
    timestamp: Math.floor(Date.now() / 1000),
  };

  upsertConversation(jid, stored);
}

// ─── QR Code ──────────────────────────────────────────────────────────────────
export async function getQRCodeImage(): Promise<string | null> {
  if (!currentQRString) return null;
  return QRCode.toDataURL(currentQRString, {
    width: 320,
    margin: 2,
    color: { dark: '#09090b', light: '#ffffff' },
  });
}

export function getStatus(): { connected: boolean; phone: string | null; hasQR: boolean } {
  return {
    connected: isConnected,
    phone: connectedPhone,
    hasQR: currentQRString !== null,
  };
}

// Função para desconectar o WhatsApp manualmente
export async function disconnectWhatsApp(): Promise<void> {
  // Close the socket if exists
  if (sock) {
    try {
      await sock.close();
    } catch (err) {
      console.error('Error closing socket:', err);
    }
    sock = null;
  }

  // Reset state and clear session
  isConnected = false;
  currentQRString = null;
  connectedPhone = null;
  await clearSession();
  // Emit events to update frontend
  waEvents.emit('connected', { phone: null });
  waEvents.emit('qr', { qrImage: null });

  // After disconnecting, start a new connection process to generate a new QR
  // This ensures the user can scan a new QR code to reconnect
  connectWhatsApp().catch(console.error);
}
