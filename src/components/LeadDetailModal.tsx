import { useState, useEffect } from 'react';
import { X, WhatsappLogo, User, CurrencyDollar, Fire, Drop, Snowflake, Clock, Note, ArrowRight, Trash, Headset, SignOut, BellRinging, Check } from '@phosphor-icons/react';
import type { Lead, LeadStatus } from '../store/useCrmStore';
import { useCrmStore } from '../store/useCrmStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { motion, AnimatePresence } from 'framer-motion';

interface LeadDetailModalProps {
  leadId: string | null;
  onClose: () => void;
}

const TIPO_TELHADO = ['Cerâmica', 'Fibrocimento', 'Metálico', 'Laje', 'Colonial', 'Outro'];
const HORARIO_CONTATO = ['Manhã (8h-12h)', 'Tarde (12h-18h)', 'Noite (18h-21h)', 'Qualquer horário'];

const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo Lead',
  atendimento: 'Em Atendimento',
  visita: 'Visita Técnica',
  proposta: 'Proposta',
  fechado: 'Fechado',
};

const STATUS_NEXT: Partial<Record<LeadStatus, LeadStatus>> = {
  novo: 'atendimento',
  atendimento: 'visita',
  visita: 'proposta',
  proposta: 'fechado',
};

function formatCurrency(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function buildWhatsAppMessage(lead: Lead) {
  const nome = lead.nome.split(' ')[0];
  const valor = formatCurrency(lead.valorConta);
  const msg = `Olá, ${nome}! 👋\n\nVi aqui que você demonstrou interesse em energia solar — e notei que sua conta de luz gira em torno de ${valor} por mês.\n\nCom esse valor, já existem ótimas possibilidades de economia, e em muitos casos dá pra reduzir bastante (ou até praticamente zerar) esse custo mensal.\n\nMe conta: você já chegou a ver alguma proposta de energia solar antes ou ainda está começando a entender como funciona?`;
  return `https://wa.me/55${lead.whatsapp}?text=${encodeURIComponent(msg)}`;
}

export function LeadDetailModal({ leadId, onClose }: LeadDetailModalProps) {
  const { leads, updateLead, updateLeadStatus, removeLead, addNote, removeNote, claimLead, releaseLead } = useCrmStore();
  const lead = leads.find(l => l.id === leadId) || null;
  const { theme, user, users } = useAuthStore();
  const { reminders, addReminder, markDone, removeReminder, removeForLead } = useNotificationStore();

  const [interesse, setInteresse] = useState<Lead['interesse']>(undefined);
  const [tipoTelhado, setTipoTelhado] = useState('');
  const [horarioContato, setHorarioContato] = useState('');
  const [newNote, setNewNote] = useState('');
  const [consumoConfirmado, setConsumoConfirmado] = useState('');
  const [saved, setSaved] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('Enviar mensagem de follow-up');
  const [reminderDate, setReminderDate] = useState('');

  // Carrega dados do lead ao abrir ou quando o leadId muda
  useEffect(() => {
    if (lead) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInteresse(lead.interesse);
      setTipoTelhado(lead.tipoTelhado ?? '');
      setHorarioContato(lead.horarioContato ?? '');
      setConsumoConfirmado(lead.consumoConfirmado ? String(lead.consumoConfirmado) : '');
    }
  }, [leadId]); // Somente quando o ID muda, para não resetar enquanto edita

  // Fecha com Esc
  useEffect(() => {
    if (!leadId) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [leadId, onClose]);

  if (!lead) return null;

  const handleSave = () => {
    updateLead(lead.id, {
      interesse,
      tipoTelhado: tipoTelhado || undefined,
      horarioContato: horarioContato || undefined,
      consumoConfirmado: consumoConfirmado ? Number(consumoConfirmado) : undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const nextStatus = STATUS_NEXT[lead.status];

  const handleAdvance = () => {
    if (!nextStatus) return;
    handleSave();
    updateLeadStatus(lead.id, nextStatus);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Remover o lead de ${lead.nome}?`)) {
      removeLead(lead.id);
      removeForLead(lead.id);
      onClose();
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !leadId) return;
    addNote(leadId, newNote);
    setNewNote('');
  };

  const isMine = !!user && lead.assignedToEmail === user.email;
  const canRelease = isMine || user?.role === 'admin';

  const handleClaim = () => {
    if (!user) return;
    claimLead(lead.id, { email: user.email, name: user.name });
  };

  const handleRelease = () => {
    releaseLead(lead.id);
  };

  const handleAssign = (email: string) => {
    if (!email) { releaseLead(lead.id); return; }
    const vendedor = users.find((u) => u.email === email);
    if (!vendedor) return;
    claimLead(lead.id, { email: vendedor.email, name: vendedor.name });
  };

  const leadReminders = reminders
    .filter((r) => r.leadId === lead.id)
    .sort((a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime());

  const handleAddReminder = () => {
    if (!reminderDate) return;
    const targetEmail = lead.assignedToEmail ?? user?.email;
    if (!targetEmail) return;
    addReminder({
      leadId: lead.id,
      leadNome: lead.nome,
      vendedorEmail: targetEmail,
      message: reminderMessage.trim() || 'Enviar mensagem de follow-up',
      remindAt: new Date(reminderDate).toISOString(),
    });
    setReminderDate('');
  };

  const formatReminderDate = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const interestConfig = {
    quente: { label: 'Quente', icon: <Fire size={16} weight="fill" />, color: 'bg-red-500 text-white border-red-500' },
    morno: { label: 'Morno', icon: <Drop size={16} weight="fill" />, color: 'bg-yellow-400 text-zinc-900 border-yellow-400' },
    frio: { label: 'Frio', icon: <Snowflake size={16} weight="fill" />, color: 'bg-blue-500 text-white border-blue-500' },
  };

  return (
    <AnimatePresence>
      {lead && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className={`relative w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col transition-colors duration-300 ${
              theme === 'dark' ? 'bg-zinc-950 border border-white/10' : 'bg-white'
            }`}
          >
            {/* Header */}
            <div className={`px-7 pt-7 pb-5 relative shrink-0 transition-colors ${theme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-950'}`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={18} weight="bold" className="text-white" />
              </button>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <User size={24} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-black text-xl tracking-tight truncate">{lead.nome}</h2>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-zinc-400 text-sm">{lead.tipoImovel}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-400 text-sm">{STATUS_LABELS[lead.status]}</span>
                  </div>
                </div>
              </div>

              {/* Métricas rápidas */}
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-zinc-500 text-xs mb-0.5">Conta Atual</p>
                  <p className="text-[var(--color-accent)] font-black text-base">{formatCurrency(lead.valorConta)}/mês</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-zinc-500 text-xs mb-0.5">Economia Est.</p>
                  <p className="text-white font-black text-base">{formatCurrency(lead.economiaProjetada)}/mês</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-zinc-500 text-xs mb-0.5">Payback</p>
                  <p className="text-white font-black text-base">{lead.payback} anos</p>
                </div>
              </div>

              {/* Atendimento — quem está com o lead */}
              <div className="mt-4 flex items-center justify-between gap-3 bg-white/5 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Headset size={18} weight="fill" className={lead.assignedToName ? 'text-[var(--color-accent)]' : 'text-zinc-500'} />
                  {lead.assignedToName ? (
                    <p className="text-sm text-white font-semibold truncate">
                      Atendendo: <span className="font-black">{isMine ? 'Você' : lead.assignedToName}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-400 font-medium">Sem vendedor atribuído</p>
                  )}
                </div>

                {user?.role === 'admin' ? (
                  <select
                    value={lead.assignedToEmail ?? ''}
                    onChange={(e) => handleAssign(e.target.value)}
                    className="shrink-0 bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none focus:border-[var(--color-accent)] max-w-[140px]"
                  >
                    <option value="" className="text-zinc-900">Sem atendente</option>
                    {users.map((u) => (
                      <option key={u.email} value={u.email} className="text-zinc-900">{u.name}</option>
                    ))}
                  </select>
                ) : !lead.assignedToName ? (
                  <button
                    onClick={handleClaim}
                    className="shrink-0 px-3.5 py-1.5 rounded-lg bg-[var(--color-accent)] text-zinc-950 text-xs font-bold hover:brightness-105 transition-all"
                  >
                    Assumir
                  </button>
                ) : canRelease ? (
                  <button
                    onClick={handleRelease}
                    title="Liberar atendimento"
                    className="shrink-0 p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <SignOut size={16} />
                  </button>
                ) : null}
              </div>

              {/* Botão de WhatsApp com mensagem personalizada */}
              <a
                href={buildWhatsAppMessage(lead)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2.5 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-colors"
              >
                <WhatsappLogo size={20} weight="fill" />
                {lead.status === 'novo'
                  ? 'Iniciar conversa com mensagem personalizada'
                  : `Abrir WhatsApp — ${lead.whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}`
                }
              </a>
            </div>

            {/* Corpo com scroll */}
            <div className="overflow-y-auto flex-1 px-7 py-6 space-y-6">

              {/* Nível de interesse */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2.5">
                  Nível de interesse
                </label>
                <div className="flex gap-2">
                  {(Object.entries(interestConfig) as [Lead['interesse'] & string, typeof interestConfig.quente][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => {
                        const novoInteresse = interesse === key ? undefined : key as Lead['interesse'];
                        setInteresse(novoInteresse);
                        updateLead(lead.id, { interesse: novoInteresse });
                      }}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                        interesse === key
                          ? cfg.color
                          : theme === 'dark' ? 'border-white/10 text-zinc-400 hover:border-white/20' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
                      }`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de telhado */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2.5">
                  Tipo de telhado
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIPO_TELHADO.map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setTipoTelhado(tipoTelhado === tipo ? '' : tipo)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all ${
                        tipoTelhado === tipo
                          ? theme === 'dark' ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-zinc-950' : 'bg-zinc-950 border-zinc-950 text-white'
                          : theme === 'dark' ? 'border-white/10 text-zinc-400 hover:border-white/20' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                      }`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consumo confirmado */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2.5">
                  <span className="flex items-center gap-1.5">
                    <CurrencyDollar size={14} />
                    Consumo confirmado (kWh/mês)
                  </span>
                </label>
                <input
                  type="number"
                  value={consumoConfirmado}
                  onChange={(e) => setConsumoConfirmado(e.target.value)}
                  placeholder="Ex: 350"
                  className={`w-full border-2 rounded-xl px-4 py-2.5 font-medium placeholder:text-zinc-500 outline-none transition-colors text-sm ${
                    theme === 'dark' ? 'bg-zinc-900 border-white/10 text-white focus:border-[var(--color-accent)]' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-950'
                  }`}
                />
              </div>

              {/* Melhor horário */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2.5">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    Melhor horário para contato
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {HORARIO_CONTATO.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHorarioContato(horarioContato === h ? '' : h)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all ${
                        horarioContato === h
                          ? theme === 'dark' ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-zinc-950' : 'bg-zinc-950 border-zinc-950 text-white'
                          : theme === 'dark' ? 'border-white/10 text-zinc-400 hover:border-white/20' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lembretes de contato */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <BellRinging size={14} />
                    Lembretes de Contato
                  </span>
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    placeholder="Mensagem do lembrete..."
                    className={`flex-1 border-2 rounded-xl px-4 py-2.5 font-medium placeholder:text-zinc-500 outline-none transition-colors text-sm ${
                      theme === 'dark' ? 'bg-zinc-900 border-white/10 text-white focus:border-[var(--color-accent)]' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-950'
                    }`}
                  />
                  <input
                    type="datetime-local"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className={`border-2 rounded-xl px-3 py-2.5 font-medium outline-none transition-colors text-sm ${
                      theme === 'dark' ? 'bg-zinc-900 border-white/10 text-white focus:border-[var(--color-accent)]' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-950'
                    }`}
                  />
                  <button
                    onClick={handleAddReminder}
                    disabled={!reminderDate}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                      theme === 'dark' ? 'bg-[var(--color-accent)] text-zinc-950' : 'bg-zinc-950 text-white'
                    }`}
                  >
                    Criar
                  </button>
                </div>

                {!lead.assignedToName && (
                  <p className="text-[11px] text-zinc-500 -mt-1">O lembrete será atribuído a você, já que o lead ainda não tem atendente.</p>
                )}

                <div className="space-y-2">
                  {leadReminders.length === 0 ? (
                    <p className="text-zinc-500 text-sm italic py-2">Nenhum lembrete criado para este lead.</p>
                  ) : (
                    leadReminders.map((rem) => {
                      const isOverdue = !rem.done && new Date(rem.remindAt).getTime() <= Date.now();
                      return (
                        <div
                          key={rem.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                            rem.done
                              ? theme === 'dark' ? 'bg-white/5 border-white/5 opacity-50' : 'bg-zinc-50 border-zinc-100 opacity-50'
                              : isOverdue
                                ? 'bg-red-500/10 border-red-500/20'
                                : theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-zinc-50 border-zinc-100'
                          }`}
                        >
                          <button
                            onClick={() => !rem.done && markDone(rem.id)}
                            disabled={rem.done}
                            title={rem.done ? 'Concluído' : 'Marcar como concluído'}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              rem.done
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-zinc-400 hover:border-[var(--color-accent)] text-transparent hover:text-[var(--color-accent)]'
                            }`}
                          >
                            <Check size={14} weight="bold" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${rem.done ? 'line-through' : ''} ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}>
                              {rem.message}
                            </p>
                            <p className={`text-[11px] ${isOverdue && !rem.done ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
                              {formatReminderDate(rem.remindAt)} {isOverdue && !rem.done ? '· Atrasado' : ''}
                            </p>
                          </div>
                          <button
                            onClick={() => removeReminder(rem.id)}
                            className="text-zinc-500 hover:text-red-500 p-1 transition-colors shrink-0"
                            title="Excluir lembrete"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Observações / Notas */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Note size={14} />
                    Histórico de Notas
                  </span>
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    placeholder="Adicionar nova nota..."
                    className={`flex-1 border-2 rounded-xl px-4 py-2.5 font-medium placeholder:text-zinc-500 outline-none transition-colors text-sm ${
                      theme === 'dark' ? 'bg-zinc-900 border-white/10 text-white focus:border-[var(--color-accent)]' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-950'
                    }`}
                  />
                  <button
                    onClick={handleAddNote}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all hover:brightness-110 active:scale-95 ${
                      theme === 'dark' ? 'bg-[var(--color-accent)] text-zinc-950' : 'bg-zinc-950 text-white'
                    }`}
                  >
                    Adicionar
                  </button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {(lead.notes || []).length === 0 ? (
                    <p className="text-zinc-500 text-sm italic py-4 text-center">Nenhuma nota registrada ainda.</p>
                  ) : (
                    (lead.notes || []).map((note) => (
                      <div 
                        key={note.id} 
                        className={`p-3 rounded-2xl border transition-colors group relative ${
                          theme === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tight">
                            {formatDate(note.createdAt)}
                          </span>
                          <button 
                            onClick={() => {
                              if (window.confirm('Excluir esta nota?')) {
                                removeNote(lead.id, note.id);
                              }
                            }}
                            className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded-md"
                            title="Excluir nota"
                          >
                            <Trash size={14} weight="bold" />
                          </button>
                        </div>
                        <p className={`text-sm leading-relaxed font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
                          {note.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer com ações */}
            <div className="px-7 py-5 border-t border-zinc-100 flex items-center gap-3 shrink-0">
              <button
                onClick={handleDelete}
                className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash size={16} />
              </button>

              <button
                onClick={handleSave}
                className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition-colors ${
                  theme === 'dark' ? 'border-white/10 text-white hover:border-white/20' : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                }`}
              >
                {saved ? '✓ Salvo!' : 'Salvar anotações'}
              </button>

              {nextStatus && (
                <button
                  onClick={handleAdvance}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                    theme === 'dark' ? 'bg-[var(--color-accent)] text-zinc-950 hover:opacity-90' : 'bg-zinc-950 text-white hover:bg-zinc-800'
                  }`}
                >
                  Mover para {STATUS_LABELS[nextStatus]}
                  <ArrowRight size={15} weight="bold" />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
