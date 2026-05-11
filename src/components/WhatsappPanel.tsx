import {
  useState, useEffect, useRef, useCallback,
} from 'react';
import type { KeyboardEvent } from 'react';
import {
  WhatsappLogo, CheckCircle, XCircle, ArrowClockwise,
  PaperPlaneTilt, PencilSimple, Plus, Trash, Eye, Warning,
  Spinner, Phone, ChatCircleDots, Gear, ArrowLeft,
  MagnifyingGlass, SmileyWink,
} from '@phosphor-icons/react';
import { useAuthStore } from '../store/useAuthStore';
import { useCrmStore } from '../store/useCrmStore';
import { useWhatsappStore } from '../store/useWhatsappStore';
import type { MessageTemplate } from '../store/useWhatsappStore';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface WaStatus {
  connected: boolean;
  phone: string | null;
  hasQR: boolean;
}

interface StoredMessage {
  id: string;
  fromMe: boolean;
  body: string;
  timestamp: number;
  pushName?: string;
}

interface Conversation {
  jid: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastTimestamp: number;
  unread: number;
  messages: StoredMessage[];
}

type PanelTab = 'inbox' | 'connection' | 'templates';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function applyVars(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digits;
}

function formatTime(ts: number): string {
  const d = new Date(ts * 1000);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function initials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ─── Badge de status ──────────────────────────────────────────────────────────
function StatusBadge({ serverOnline, status }: { serverOnline: boolean | null; status: WaStatus | null }) {
  if (serverOnline === null) {
    return (
      <span className="flex items-center gap-1.5 text-zinc-500 text-xs">
        <Spinner size={13} className="animate-spin" /> Verificando...
      </span>
    );
  }
  if (!serverOnline) {
    return (
      <span className="flex items-center gap-1.5 text-red-500 text-xs font-bold">
        <XCircle size={14} weight="fill" /> Offline
      </span>
    );
  }
  if (status?.connected) {
    return (
      <span className="flex items-center gap-1.5 text-green-500 text-xs font-bold">
        <CheckCircle size={14} weight="fill" /> Conectado
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-yellow-500 text-xs font-bold">
      <Spinner size={13} className="animate-spin" /> Aguardando QR...
    </span>
  );
}

// ─── Avatar colorido ──────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
  'bg-orange-500', 'bg-teal-500', 'bg-indigo-500',
];
function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} ${AVATAR_COLORS[idx]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}>
      {initials(name)}
    </div>
  );
}

// ─── Bolinha de mensagem ──────────────────────────────────────────────────────
function MessageBubble({ msg, theme }: { msg: StoredMessage; theme: string }) {
  const isMe = msg.fromMe;

  // Formata negrito (*texto*), itálico (_texto_) simples para preview
  const formatted = msg.body
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>');

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`max-w-[72%] md:max-w-[60%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words ${
          isMe
            ? 'bg-[#dcf8c6] text-zinc-900 rounded-br-sm'
            : theme === 'dark'
            ? 'bg-zinc-700 text-zinc-100 rounded-bl-sm'
            : 'bg-white text-zinc-900 rounded-bl-sm shadow-sm'
        }`}
      >
        {!isMe && msg.pushName && (
          <p className="text-[10px] font-bold text-blue-500 mb-0.5">{msg.pushName}</p>
        )}
        {/* eslint-disable-next-line react/no-danger */}
        <span dangerouslySetInnerHTML={{ __html: formatted }} />
        <span className={`block text-right text-[10px] mt-1 ${isMe ? 'text-zinc-500' : 'text-zinc-400'}`}>
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function WhatsappPanel() {
  const theme = useAuthStore((s) => s.theme);
  const leads = useCrmStore((s) => s.leads);
  const { templates, updateTemplate, addTemplate, removeTemplate } = useWhatsappStore();

  const [tab, setTab] = useState<PanelTab>('inbox');

  // ── Conexão WhatsApp ──────────────────────────────────────────────────────
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [status, setStatus] = useState<WaStatus | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Inbox (conversas) ──────────────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeJid, setActiveJid] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Templates ────────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [previewLead, setPreviewLead] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBody, setNewBody] = useState('');

  // ── Envio manual (conexão) ─────────────────────────────────────────────────
  const [sendLeadId, setSendLeadId] = useState('');
  const [sendCustomPhone, setSendCustomPhone] = useState('');
  const [sendTemplateId, setSendTemplateId] = useState(templates[0]?.id ?? '');
  const [sendCustomMsg, setSendCustomMsg] = useState('');
  const [useCustomPhone, setUseCustomPhone] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // ── Buscar conversas do servidor ────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch { /* silencioso */ }
  }, []);

  // ── Polling de status + QR ────────────────────────────────────────────────
  const fetchQR = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/qr');
      if (!res.ok) return;
      const data = await res.json();
      setQrImage(data.qr ?? null);
    } catch { /* sem servidor */ }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      if (!res.ok) { setServerOnline(false); return; }
      const data: WaStatus = await res.json();
      setServerOnline(true);
      setStatus(data);
      if (data.connected) setQrImage(null);
      else if (data.hasQR) fetchQR();
    } catch {
      setServerOnline(false);
      setStatus(null);
      setQrImage(null);
    }
  }, [fetchQR]);

  // ── Desconectar WhatsApp ────────────────────────────────────────────────
  const handleDisconnect = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Failed to disconnect');
      }
      // The frontend state will be updated via the SSE events (we emit 'connected' with phone: null and 'qr' with null)
    } catch (err) {
      console.error('Error disconnecting:', err);
      // Optionally show an error message to the user
    }
  }, []);

  const fetchStatusRef = useRef(fetchStatus);
  useEffect(() => { fetchStatusRef.current = fetchStatus; }, [fetchStatus]);

  useEffect(() => {
    fetchStatusRef.current();
    pollingRef.current = setInterval(() => fetchStatusRef.current(), 5000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  // ── SSE: atualizações de conversas em tempo real ───────────────────────────
  useEffect(() => {
    let es: EventSource;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      es = new EventSource('/api/whatsapp/events');

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'init') {
            setConversations(data.conversations ?? []);
            // Sincroniza status inicial via SSE para não esperar o polling
            if (data.connected !== undefined) {
              setServerOnline(true);
              setStatus({ connected: data.connected, phone: data.phone ?? null, hasQR: data.hasQR ?? false });
              if (data.connected) {
                setQrImage(null);
                // Busca conversas quando conecta via SSE init
                fetchConversations();
              }
            }
          } else if (data.type === 'update' && data.conversation) {
            setConversations((prev) => {
              const rest = prev.filter((c) => c.jid !== data.conversation.jid);
              return [data.conversation, ...rest];
            });
          } else if (data.type === 'qr' && data.qrImage) {
            // QR recebido em tempo real via SSE — sem esperar o polling
            setQrImage(data.qrImage);
            setStatus((prev) => prev ? { ...prev, connected: false, hasQR: true } : { connected: false, phone: null, hasQR: true });
            setServerOnline(true);
          } else if (data.type === 'connected') {
            setQrImage(null);
            setStatus({ connected: true, phone: data.phone ?? null, hasQR: false });
            setServerOnline(true);
            setTab('inbox'); // Troca para a caixa de entrada automaticamente ao conectar
            // Busca conversas após conectar
            fetchConversations();
          }
        } catch { /* json malformado */ }
      };

      es.onerror = () => {
        es.close();
        retryTimeout = setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      clearTimeout(retryTimeout);
      es?.close();
    };
  }, []);

  // ── Auto-scroll na janela de chat ─────────────────────────────────────────
  const activeConversation = conversations.find((c) => c.jid === activeJid) ?? null;
  const activeMessages = activeConversation?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  // ── Selecionar conversa ───────────────────────────────────────────────────
  const selectConversation = useCallback(async (jid: string) => {
    setActiveJid(jid);
    // Remove badge de não lido otimisticamente
    setConversations((prev) =>
      prev.map((c) => (c.jid === jid ? { ...c, unread: 0 } : c)),
    );
    try {
      await fetch('/api/whatsapp/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jid }),
      });
    } catch { /* silencioso */ }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // ── Enviar mensagem pelo chat ─────────────────────────────────────────────
  const handleSendChat = useCallback(async () => {
    if (!activeJid || !chatInput.trim() || !status?.connected || sendingChat) return;
    const text = chatInput.trim();
    setChatInput('');
    setSendingChat(true);

    // Update otimista
    const ts = Math.floor(Date.now() / 1000);
    const tempMsg: StoredMessage = { id: `local_${Date.now()}`, fromMe: true, body: text, timestamp: ts };
    setConversations((prev) =>
      prev.map((c) =>
        c.jid === activeJid
          ? { ...c, lastMessage: text, lastTimestamp: ts, messages: [...c.messages, tempMsg] }
          : c,
      ),
    );

    try {
      const phone = activeJid.split('@')[0];
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message: text }),
      });
    } catch { /* o SSE vai sincronizar */ } finally {
      setSendingChat(false);
    }
  }, [activeJid, chatInput, status?.connected, sendingChat]);

  const handleChatKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); }
  };

  // ── Envio manual (painel de conexão) ──────────────────────────────────────
  const selectedLead = leads.find((l) => l.id === sendLeadId);
  const selectedTemplate = templates.find((t) => t.id === sendTemplateId);

  const resolvedMessage = sendTemplateId === '__custom__'
    ? sendCustomMsg
    : selectedTemplate
    ? applyVars(selectedTemplate.body, {
        nome: selectedLead?.nome.split(' ')[0] ?? '{nome}',
        economia: selectedLead
          ? selectedLead.economiaProjetada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
          : '{economia}',
        sistema: String(selectedLead?.sistemaIndicado ?? '{sistema}'),
        payback: String(selectedLead?.payback ?? '{payback}'),
      })
    : '';

  const targetPhone = useCustomPhone ? sendCustomPhone : selectedLead?.whatsapp ?? '';
  const canSend = !!targetPhone && !!resolvedMessage.trim() && !!status?.connected;

  const handleSendManual = async () => {
    if (!canSend) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: targetPhone, message: resolvedMessage }),
      });
      if (res.ok) {
        setSendResult({ ok: true, msg: 'Mensagem enviada com sucesso! ✓' });
      } else {
        const data = await res.json();
        setSendResult({ ok: false, msg: data.error ?? 'Erro ao enviar.' });
      }
    } catch {
      setSendResult({ ok: false, msg: 'Servidor offline.' });
    } finally {
      setSending(false);
    }
  };

  // ── Templates ────────────────────────────────────────────────────────────
  const previewLeadObj = leads.find((l) => l.id === previewLead);
  const previewVars = {
    nome: previewLeadObj?.nome.split(' ')[0] ?? 'João',
    economia: previewLeadObj
      ? previewLeadObj.economiaProjetada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
      : 'R$ 450',
    sistema: String(previewLeadObj?.sistemaIndicado ?? '5.2'),
    payback: String(previewLeadObj?.payback ?? '4'),
  };

  // ── Estilos ───────────────────────────────────────────────────────────────
  const card = `border rounded-2xl p-5 transition-colors ${
    theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200 shadow-sm'
  }`;
  const inp = `w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] ${
    theme === 'dark' ? 'bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400'
  }`;
  const lbl = `text-[10px] font-bold uppercase tracking-widest mb-2 block ${
    theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
  }`;

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);
  const filteredConvs = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search.replace(/\D/g, '')),
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Topo ──────────────────────────────────────────────────────────── */}
      <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${theme === 'dark' ? 'border-white/10' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-3">
          <WhatsappLogo size={22} weight="fill" className="text-green-500" />
          <h2 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>
            WhatsApp
          </h2>
          <StatusBadge serverOnline={serverOnline} status={status} />
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-zinc-100'}`}>
          {([
            { id: 'inbox', icon: <ChatCircleDots size={15} weight="fill" />, label: 'Inbox', badge: totalUnread },
            { id: 'connection', icon: <Phone size={15} weight="fill" />, label: 'Conexão', badge: 0 },
            { id: 'templates', icon: <Gear size={15} weight="fill" />, label: 'Templates', badge: 0 },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === t.id
                  ? 'bg-[var(--color-accent)] text-zinc-950 shadow-sm'
                  : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              {t.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                  {t.badge > 9 ? '9+' : t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Inbox ────────────────────────────────────────────────────── */}
      {tab === 'inbox' && (
        <div className="flex flex-1 overflow-hidden">

          {/* Painel esquerdo: lista de conversas */}
          <div className={`flex flex-col shrink-0 border-r overflow-hidden transition-all ${
            activeJid ? 'hidden md:flex w-72 lg:w-80' : 'flex w-full md:w-72 lg:w-80'
          } ${theme === 'dark' ? 'border-white/10' : 'border-zinc-200'}`}>

            {/* Busca */}
            <div className={`px-3 py-3 border-b ${theme === 'dark' ? 'border-white/10' : 'border-zinc-200'}`}>
              <div className="relative">
                <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar conversa..."
                  className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] ${
                    theme === 'dark' ? 'bg-white/5 border-white/10 text-white placeholder:text-zinc-600' : 'bg-zinc-100 border-transparent text-zinc-900 placeholder:text-zinc-400'
                  }`}
                />
              </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto">
              {filteredConvs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center py-12">
                  <SmileyWink size={40} className="text-zinc-300" />
                  <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {conversations.length === 0
                      ? status?.connected
                        ? 'Aguardando mensagens...'
                        : 'Conecte o WhatsApp para ver conversas'
                      : 'Nenhuma conversa encontrada'}
                  </p>
                </div>
              )}

              {filteredConvs.map((conv) => (
                <button
                  key={conv.jid}
                  onClick={() => selectConversation(conv.jid)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b ${
                    activeJid === conv.jid
                      ? theme === 'dark' ? 'bg-white/10 border-white/5' : 'bg-[var(--color-accent)]/10 border-zinc-100'
                      : theme === 'dark' ? 'hover:bg-white/5 border-white/5' : 'hover:bg-zinc-50 border-zinc-100'
                  }`}
                >
                  <Avatar name={conv.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        {conv.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 shrink-0 ml-2">
                        {formatTime(conv.lastTimestamp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className={`text-xs truncate ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {conv.lastMessage}
                      </span>
                      {conv.unread > 0 && (
                        <span className="ml-2 shrink-0 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-black flex items-center justify-center">
                          {conv.unread > 9 ? '9+' : conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Painel direito: janela de chat */}
          <div className={`flex-1 flex flex-col overflow-hidden ${activeJid ? 'flex' : 'hidden md:flex'}`}>

            {!activeConversation ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
                <WhatsappLogo size={64} weight="thin" className="text-zinc-300" />
                <p className={`text-base font-semibold ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Selecione uma conversa
                </p>
                <p className="text-sm text-zinc-400 max-w-xs">
                  As mensagens recebidas aparecem automaticamente na lista ao lado.
                </p>
              </div>
            ) : (
              <>
                {/* Cabeçalho da conversa */}
                <div className={`flex items-center gap-3 px-4 py-3 border-b shrink-0 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-zinc-200 bg-white'}`}>
                  <button
                    onClick={() => setActiveJid(null)}
                    className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <Avatar name={activeConversation.name} size="sm" />
                  <div>
                    <p className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                      {activeConversation.name}
                    </p>
                    <p className="text-xs text-zinc-400">{formatPhone(activeConversation.phone)}</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => selectConversation(activeJid!)}
                      title="Atualizar"
                      className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-zinc-500' : 'hover:bg-zinc-100 text-zinc-400'}`}
                    >
                      <ArrowClockwise size={16} />
                    </button>
                  </div>
                </div>

                {/* Mensagens */}
                <div
                  className={`flex-1 overflow-y-auto px-4 py-4 space-y-0.5 ${
                    theme === 'dark'
                      ? 'bg-zinc-900'
                      : 'bg-[#e5ddd5]'
                  }`}
                  style={{
                    backgroundImage: theme === 'dark'
                      ? 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)'
                      : 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)',
                    backgroundSize: '20px 20px',
                  }}
                >
                  {activeMessages.length === 0 && (
                    <div className="flex justify-center">
                      <span className={`text-xs px-3 py-1.5 rounded-full ${theme === 'dark' ? 'bg-white/10 text-zinc-400' : 'bg-white/80 text-zinc-500'}`}>
                        Nenhuma mensagem ainda
                      </span>
                    </div>
                  )}

                  {activeMessages.map((msg, i) => {
                    const prevMsg = activeMessages[i - 1];
                    const isDateChange = prevMsg && new Date(prevMsg.timestamp * 1000).toDateString() !== new Date(msg.timestamp * 1000).toDateString();

                    return (
                      <div key={msg.id}>
                        {(i === 0 || isDateChange) && (
                          <div className="flex justify-center my-3">
                            <span className={`text-[10px] px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-zinc-700 text-zinc-400' : 'bg-white/80 text-zinc-500'}`}>
                              {new Date(msg.timestamp * 1000).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                          </div>
                        )}
                        <MessageBubble msg={msg} theme={theme} />
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input de envio */}
                <div className={`px-4 py-3 border-t shrink-0 ${theme === 'dark' ? 'border-white/10 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
                  {!status?.connected && (
                    <p className="text-xs text-yellow-500 mb-2 flex items-center gap-1.5">
                      <Warning size={13} weight="fill" />
                      WhatsApp desconectado — escaneie o QR na aba Conexão.
                    </p>
                  )}
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleChatKeyDown}
                      placeholder="Digite uma mensagem... (Enter para enviar, Shift+Enter para nova linha)"
                      disabled={!status?.connected}
                      rows={1}
                      style={{ resize: 'none', maxHeight: '120px', overflowY: 'auto' }}
                      className={`flex-1 border rounded-2xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-green-400/30 focus:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                        theme === 'dark'
                          ? 'bg-zinc-800 border-white/10 text-white placeholder:text-zinc-600'
                          : 'bg-zinc-100 border-zinc-200 text-zinc-900 placeholder:text-zinc-400'
                      }`}
                      onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = 'auto';
                        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                      }}
                    />
                    <button
                      onClick={handleSendChat}
                      disabled={!chatInput.trim() || !status?.connected || sendingChat}
                      className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 shrink-0"
                    >
                      {sendingChat
                        ? <Spinner size={18} className="animate-spin text-white" />
                        : <PaperPlaneTilt size={18} weight="fill" className="text-white" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Conexão ──────────────────────────────────────────────────── */}
      {tab === 'connection' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Card de status */}
          <div className={card}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-bold text-base flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                <WhatsappLogo size={20} weight="fill" className="text-green-500" />
                Conexão WhatsApp
              </h3>
              <button
                onClick={() => { setQrImage(null); fetchStatusRef.current(); }}
                title="Atualizar"
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-zinc-500' : 'hover:bg-zinc-100 text-zinc-400'}`}
              >
                <ArrowClockwise size={18} />
              </button>
            </div>

            {serverOnline === false && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <WhatsappLogo size={48} weight="thin" className="text-zinc-300" />
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>Servidor não encontrado</p>
                <p className="text-xs text-zinc-400">Abra um terminal e execute:</p>
                <code className={`text-xs px-3 py-2 rounded-xl font-mono ${theme === 'dark' ? 'bg-white/10 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>
                  cd server &amp;&amp; npm run dev
                </code>
                <p className="text-[11px] text-zinc-400">O QR Code aparecerá automaticamente aqui.</p>
              </div>
            )}

            {serverOnline === true && !status?.connected && !qrImage && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <Spinner size={36} className="animate-spin text-zinc-300" />
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>Aguardando QR Code...</p>
                <p className="text-xs text-zinc-400">O Baileys está iniciando a conexão com o WhatsApp Web.</p>
              </div>
            )}

            {!status?.connected && qrImage && (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-100">
                  <img src={qrImage} alt="QR Code WhatsApp" className="w-64 h-64 rounded-xl" />
                </div>
                <p className="text-sm text-zinc-500 text-center max-w-xs leading-relaxed">
                  Abra o WhatsApp → <strong>Aparelhos conectados</strong> → <strong>Conectar um aparelho</strong> e escaneie.
                </p>
              </div>
            )}

            {status?.connected && (
              <div className={`flex items-center gap-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-100'}`}>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <Phone size={22} weight="fill" className="text-green-500" />
                </div>
                <div>
                  <p className="text-green-600 font-bold text-sm">WhatsApp ativo</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Número: {status.phone ? formatPhone(status.phone) : 'Desconhecido'}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Mensagens automáticas e inbox habilitados ✓</p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="p-2 rounded-lg transition-colors hover:bg-red-500/20"
                >
                  <XCircle size={18} weight="fill" className="text-red-500" />
                </button>
              </div>
            )}
          </div>

          {/* Envio manual */}
          <div className={card}>
            <h3 className={`font-bold text-base mb-5 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              <PaperPlaneTilt size={20} weight="fill" className="text-[var(--color-accent)]" />
              Envio Manual
            </h3>

            {!status?.connected && (
              <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-xl ${theme === 'dark' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
                <Warning size={16} weight="fill" />
                {serverOnline ? 'Escaneie o QR Code para habilitar o envio.' : 'Inicie o servidor para enviar mensagens.'}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={lbl}>Destinatário</label>
                <div className="flex gap-2 mb-3">
                  {(['lead', 'manual'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setUseCustomPhone(mode === 'manual')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                        (mode === 'lead') === !useCustomPhone
                          ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-zinc-950'
                          : theme === 'dark' ? 'border-white/10 text-zinc-500' : 'border-zinc-200 text-zinc-500'
                      }`}
                    >
                      {mode === 'lead' ? 'Selecionar Lead' : 'Número Manual'}
                    </button>
                  ))}
                </div>
                {!useCustomPhone
                  ? (
                    <select value={sendLeadId} onChange={(e) => setSendLeadId(e.target.value)} className={inp}>
                      <option value="">Selecione um lead...</option>
                      {leads.map((l) => <option key={l.id} value={l.id}>{l.nome} — {formatPhone(l.whatsapp)}</option>)}
                    </select>
                  ) : (
                    <input type="tel" value={sendCustomPhone} onChange={(e) => setSendCustomPhone(e.target.value)} placeholder="(11) 99999-9999" className={inp} />
                  )}
              </div>

              <div>
                <label className={lbl}>Template</label>
                <select value={sendTemplateId} onChange={(e) => setSendTemplateId(e.target.value)} className={inp}>
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  <option value="__custom__">✏️ Mensagem personalizada</option>
                </select>
              </div>

              <div>
                <label className={lbl}>{sendTemplateId === '__custom__' ? 'Mensagem' : 'Preview'}</label>
                <textarea
                  value={resolvedMessage}
                  onChange={(e) => sendTemplateId === '__custom__' && setSendCustomMsg(e.target.value)}
                  readOnly={sendTemplateId !== '__custom__'}
                  rows={6}
                  className={`${inp} resize-none font-mono text-xs leading-relaxed ${sendTemplateId !== '__custom__' ? 'opacity-70 cursor-default' : ''}`}
                  placeholder={sendTemplateId === '__custom__' ? 'Digite sua mensagem...' : ''}
                />
              </div>

              {sendResult && (
                <div className={`flex items-center gap-2 text-sm p-3 rounded-xl ${
                  sendResult.ok
                    ? theme === 'dark' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-green-50 text-green-700 border border-green-100'
                    : theme === 'dark' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {sendResult.ok ? <CheckCircle size={16} weight="fill" /> : <XCircle size={16} weight="fill" />}
                  {sendResult.msg}
                </div>
              )}

              <button
                onClick={handleSendManual}
                disabled={!canSend || sending}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {sending ? <Spinner size={18} className="animate-spin" /> : <PaperPlaneTilt size={18} weight="fill" />}
                {sending ? 'Enviando...' : 'Enviar pelo WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Templates ────────────────────────────────────────────────── */}
      {tab === 'templates' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className={card}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Templates de Mensagem</h3>
              <button
                onClick={() => setShowNewForm(!showNewForm)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-zinc-950 hover:brightness-105 transition-all"
              >
                <Plus size={14} weight="bold" /> Novo
              </button>
            </div>

            <div className="mb-5">
              <label className={lbl}>Preview com lead</label>
              <select value={previewLead} onChange={(e) => setPreviewLead(e.target.value)} className={`${inp} !py-2 !text-xs`}>
                <option value="">Dados de exemplo</option>
                {leads.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
            </div>

            {showNewForm && (
              <div className={`mb-5 p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-zinc-50 border-zinc-200'}`}>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do template..." className={`${inp} !py-2 !text-xs`} />
                <textarea value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="Use {nome}, {economia}, {sistema}, {payback}" rows={4} className={`${inp} resize-none text-xs leading-relaxed`} />
                <div className="flex gap-2">
                  <button
                    onClick={() => { if (newName && newBody) { addTemplate(newName, newBody); setNewName(''); setNewBody(''); setShowNewForm(false); } }}
                    className="flex-1 py-2 rounded-lg bg-[var(--color-accent)] text-zinc-950 font-bold text-xs"
                  >
                    Criar
                  </button>
                  <button onClick={() => setShowNewForm(false)} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${theme === 'dark' ? 'border-white/10 text-zinc-400' : 'border-zinc-200 text-zinc-500'}`}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {templates.map((tpl: MessageTemplate) => (
                <div key={tpl.id} className={`rounded-xl border overflow-hidden transition-colors ${
                  editingId === tpl.id
                    ? theme === 'dark' ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5' : 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                    : theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-zinc-200 bg-zinc-50'
                }`}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className={`font-bold text-xs truncate ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{tpl.name}</p>
                      {tpl.locked && <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-500/20 text-zinc-500 font-bold uppercase shrink-0">padrão</span>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {editingId === tpl.id ? (
                        <>
                          <button onClick={() => { if (editingId) updateTemplate(editingId, editBody); setEditingId(null); }} className="px-2.5 py-1 text-[10px] font-bold bg-[var(--color-accent)] text-zinc-950 rounded-md">Salvar</button>
                          <button onClick={() => setEditingId(null)} className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${theme === 'dark' ? 'bg-white/10 text-zinc-400' : 'bg-zinc-200 text-zinc-600'}`}>Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(tpl.id); setEditBody(tpl.body); }} className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-zinc-500' : 'hover:bg-zinc-200 text-zinc-400'}`}><PencilSimple size={14} /></button>
                          {!tpl.locked && <button onClick={() => removeTemplate(tpl.id)} className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors"><Trash size={14} /></button>}
                        </>
                      )}
                    </div>
                  </div>

                  {editingId === tpl.id
                    ? <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={8} className={`w-full px-4 pb-4 text-xs leading-relaxed font-mono outline-none resize-none bg-transparent ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`} />
                    : (
                      <div className={`px-4 pb-4 text-[11px] leading-relaxed whitespace-pre-wrap font-mono ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        <div className="flex items-center gap-1 mb-1.5 text-[9px] font-bold uppercase text-zinc-400"><Eye size={10} /> Preview</div>
                        {applyVars(tpl.body, previewVars)}
                      </div>
                    )}
                </div>
              ))}
            </div>

            <div className={`mt-5 p-3 rounded-xl text-[10px] space-y-1 ${theme === 'dark' ? 'bg-white/5 text-zinc-500' : 'bg-zinc-100 text-zinc-400'}`}>
              <p className="font-bold uppercase">Variáveis disponíveis</p>
              <p><code>{'{nome}'}</code> — Primeiro nome</p>
              <p><code>{'{economia}'}</code> — Economia mensal</p>
              <p><code>{'{sistema}'}</code> — Sistema em kWp</p>
              <p><code>{'{payback}'}</code> — Retorno em anos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
