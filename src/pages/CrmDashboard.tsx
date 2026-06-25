import { useState, useMemo, useEffect, memo } from 'react';
import { useCrmStore } from '../store/useCrmStore';
import type { Lead, LeadStatus } from '../store/useCrmStore';
import { useAuthStore } from '../store/useAuthStore';
import type { UserRole } from '../store/useAuthStore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { WhatsappLogo, User, CurrencyDollar, Fire, Drop, Snowflake, SunDim, MagnifyingGlass, X, Funnel, Users, Plus, Trash, ShieldCheck, SignOut, House, Moon, Sun, AddressBook, Headset } from '@phosphor-icons/react';
import { LeadDetailModal } from '../components/LeadDetailModal';
import { NewLeadModal } from '../components/NewLeadModal';
import { ErrorBoundary } from '../components/ErrorBoundary';

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'novo',        label: 'Novos Leads',    color: 'bg-blue-500' },
  { id: 'atendimento', label: 'Em Atendimento',  color: 'bg-yellow-500' },
  { id: 'visita',      label: 'Visita Técnica',  color: 'bg-purple-500' },
  { id: 'proposta',    label: 'Proposta',         color: 'bg-orange-500' },
  { id: 'fechado',     label: 'Fechado ✓',        color: 'bg-green-500' },
];

function formatCurrency(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function buildWhatsAppMessage(lead: Lead) {
  const nome = lead.nome.split(' ')[0];
  const valor = formatCurrency(lead.valorConta);
  const msg = `Olá, ${nome}! 👋\n\nVi aqui que você demonstrou interesse em energia solar — e notei que sua conta de luz gira em torno de ${valor} por mês.\n\nCom esse valor, já existem ótimas possibilidades de economia, e em muitos casos dá pra reduzir bastante (ou até praticamente zerar) esse custo mensal.\n\nMe conta: você já chegou a ver alguma proposta de energia solar antes ou ainda está começando a entender como funciona?`;
  return `https://wa.me/55${lead.whatsapp}?text=${encodeURIComponent(msg)}`;
}

const interestIcon = {
  quente: <Fire size={12} weight="fill" className="text-red-500" />,
  morno: <Drop size={12} weight="fill" className="text-yellow-500" />,
  frio: <Snowflake size={12} weight="fill" className="text-blue-500" />,
};

const LeadCard = memo(function LeadCard({ lead, index, onOpenDetail }: { lead: Lead; index: number; onOpenDetail: (lead: Lead) => void }) {
  const removeLead = useCrmStore((s) => s.removeLead);
  const claimLead = useCrmStore((s) => s.claimLead);
  const theme = useAuthStore((s) => s.theme);
  const user = useAuthStore((s) => s.user);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir o contato de ${lead.nome}?`)) {
      removeLead(lead.id);
    }
  };

  const handleClaim = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    claimLead(lead.id, { email: user.email, name: user.name });
  };

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpenDetail(lead)}
          className={`group rounded-xl p-4 shadow-sm border mb-3 select-none cursor-pointer transition-all ${
            theme === 'dark' 
              ? `bg-white/5 border-white/5 ${snapshot.isDragging ? 'shadow-2xl border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20' : 'hover:bg-white/10 hover:border-white/10'}` 
              : `bg-white border-zinc-100 ${snapshot.isDragging ? 'shadow-xl rotate-1 border-[var(--color-accent)]' : 'hover:shadow-md hover:border-zinc-200'}`
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                <User size={18} className="text-zinc-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className={`font-bold text-sm leading-tight ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{lead.nome}</p>
                  {lead.interesse && interestIcon[lead.interesse]}
                </div>
                <p className="text-zinc-500 text-xs font-medium">{lead.tipoImovel}</p>
              </div>
            </div>

            <button
              onClick={handleDelete}
              className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                theme === 'dark' 
                  ? 'text-zinc-600 hover:text-red-400 hover:bg-red-500/10' 
                  : 'text-zinc-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Trash size={16} />
            </button>
          </div>

          {/* Dados */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CurrencyDollar size={14} className="text-zinc-500" />
              <span className="text-xs text-zinc-500">
                Conta: <strong className={theme === 'dark' ? 'text-zinc-300' : 'text-zinc-800'}>{formatCurrency(lead.valorConta)}/mês</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <WhatsappLogo size={14} className="text-green-500" />
              <a
                href={lead.status === 'novo' ? buildWhatsAppMessage(lead) : `https://wa.me/55${lead.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 font-medium hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {lead.whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
              </a>
            </div>
          </div>

          {/* Preview da última nota */}
          {lead.notes && lead.notes.length > 0 && (
            <div className={`mt-3 p-2.5 rounded-xl text-[10px] leading-relaxed italic ${theme === 'dark' ? 'bg-white/5 text-zinc-400' : 'bg-zinc-50 text-zinc-500'}`}>
              <span className="font-black not-italic mr-1 opacity-50">ÚLTIMA NOTA:</span>
              "{lead.notes[0].text.length > 65 ? lead.notes[0].text.substring(0, 65) + '...' : lead.notes[0].text}"
            </div>
          )}

          {/* Atendimento */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Headset size={13} weight="fill" className={lead.assignedToName ? 'text-[var(--color-accent)]' : 'text-zinc-500'} />
              <span className={`text-[11px] font-semibold truncate ${lead.assignedToName ? (theme === 'dark' ? 'text-zinc-200' : 'text-zinc-700') : 'text-zinc-500'}`}>
                {lead.assignedToName ?? 'Sem atendente'}
              </span>
            </div>
            {!lead.assignedToName && (
              <button
                onClick={handleClaim}
                className="shrink-0 px-2 py-0.5 rounded-md bg-[var(--color-accent)]/15 text-[var(--color-accent)] text-[10px] font-bold hover:bg-[var(--color-accent)] hover:text-zinc-950 transition-all"
              >
                Assumir
              </button>
            )}
          </div>

          {/* Footer com datas */}
          <div className={`mt-3 pt-3 border-t space-y-1.5 ${theme === 'dark' ? 'border-white/5' : 'border-zinc-50'}`}>
            <div className="flex items-center justify-between">
              <div className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold px-2 py-0.5 rounded-full">
                Economia: {formatCurrency(lead.economiaProjetada)}/mês
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span title="Data de entrada">📥 {new Date(lead.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
              {lead.movedAt && (
                <span title="Última mudança de etapa">🔄 {new Date(lead.movedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </div>
          </div>

        </div>
      )}
    </Draggable>
  );
});

type FilterInteresse = Lead['interesse'] | 'todos';
type FilterPeriodo = 'todos' | 'hoje' | 'semana' | 'mes';

export function CrmDashboard() {
  const { leads, updateLeadStatus, removeLead, fetchLeads } = useCrmStore();
  const { user, logout, users, addUser, removeUser, theme, toggleTheme, fetchUsers } = useAuthStore();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [creationStatus, setCreationStatus] = useState<LeadStatus | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'kanban' | 'users' | 'contacts'>('kanban');

  // Estados dos filtros
  const [busca, setBusca] = useState('');
  const [filtroInteresse, setFiltroInteresse] = useState<FilterInteresse>('todos');
  const [filtroImovel, setFiltroImovel] = useState('todos');
  const [filtroValorMin, setFiltroValorMin] = useState('');
  const [filtroValorMax, setFiltroValorMax] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState<FilterPeriodo>('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [now] = useState(Date.now);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { if (user?.role === 'admin') fetchUsers(); }, [user, fetchUsers]);

  // Estados para novo usuário
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('vendedor');

  const tiposImovel = useMemo(() => {
    const tipos = [...new Set(leads.map((l) => l.tipoImovel).filter(Boolean))];
    return tipos;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (busca.trim()) {
        const q = busca.toLowerCase();
        if (!l.nome.toLowerCase().includes(q) && !l.whatsapp.includes(busca.replace(/\D/g, ''))) return false;
      }
      if (filtroInteresse !== 'todos' && l.interesse !== filtroInteresse) return false;
      if (filtroImovel !== 'todos' && l.tipoImovel !== filtroImovel) return false;
      if (filtroValorMin && l.valorConta < Number(filtroValorMin)) return false;
      if (filtroValorMax && l.valorConta > Number(filtroValorMax)) return false;
      if (filtroPeriodo !== 'todos') {
        const created = new Date(l.createdAt).getTime();
        const diff = now - created;
        if (filtroPeriodo === 'hoje' && diff > 86400000) return false;
        if (filtroPeriodo === 'semana' && diff > 7 * 86400000) return false;
        if (filtroPeriodo === 'mes' && diff > 30 * 86400000) return false;
      }
      return true;
    });
  }, [leads, busca, filtroInteresse, filtroImovel, filtroValorMin, filtroValorMax, filtroPeriodo, now]);

  const hasActiveFilters = busca || filtroInteresse !== 'todos' || filtroImovel !== 'todos' || filtroValorMin || filtroValorMax || filtroPeriodo !== 'todos';

  const clearFilters = () => {
    setBusca('');
    setFiltroInteresse('todos');
    setFiltroImovel('todos');
    setFiltroValorMin('');
    setFiltroValorMax('');
    setFiltroPeriodo('todos');
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as LeadStatus;
    const lead = leads.find(l => l.id === result.draggableId);
    const colLabel = COLUMNS.find(c => c.id === newStatus)?.label ?? newStatus;
    setAnnouncement(`${lead?.nome ?? 'Cliente'} movido para ${colLabel}`);
    updateLeadStatus(result.draggableId, newStatus);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) return;
    const success = await addUser({ name: newUserName, email: newUserEmail, password: newUserPassword, role: newUserRole });
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    if (success) {
      alert('Usuário criado! Um email de confirmação foi enviado para ele ativar o acesso.');
    } else {
      alert('Erro ao criar usuário. O email já pode estar cadastrado.');
    }
  };

  const totalLeads = leads.length;
  const totalEconomia = leads.reduce((acc, l) => acc + l.economiaProjetada, 0);
  const totalFechados = leads.filter((l) => l.status === 'fechado').length;
  const economiaFechados = leads.filter((l) => l.status === 'fechado').reduce((acc, l) => acc + l.economiaProjetada, 0);

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-950'}`}>
      <LeadDetailModal leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
      <NewLeadModal 
        isOpen={isNewLeadModalOpen} 
        onClose={() => {
          setIsNewLeadModalOpen(false);
          setCreationStatus(undefined);
        }} 
        initialStatus={creationStatus}
      />

      {/* Sidebar Simples */}
      <aside className={`w-64 border-r flex flex-col pt-6 shrink-0 h-screen sticky top-0 transition-colors duration-300 ${theme === 'dark' ? 'border-white/10 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
        <div className="px-6 flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <SunDim size={32} weight="fill" className="text-[var(--color-accent)]" />
            <h1 className={`font-black text-lg tracking-tight ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Solar CRM</h1>
          </div>
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-600'}`}
            title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button 
            onClick={() => setActiveTab('kanban')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'kanban' 
                ? 'bg-[var(--color-accent)] text-zinc-950 font-bold' 
                : theme === 'dark' 
                  ? 'text-zinc-400 hover:bg-white/5 hover:text-white' 
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <House size={20} weight={activeTab === 'kanban' ? 'fill' : 'regular'} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('contacts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'contacts' 
                ? 'bg-[var(--color-accent)] text-zinc-950 font-bold' 
                : theme === 'dark' 
                  ? 'text-zinc-400 hover:bg-white/5 hover:text-white' 
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <AddressBook size={20} weight={activeTab === 'contacts' ? 'fill' : 'regular'} />
            Contatos
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'users'
                  ? 'bg-[var(--color-accent)] text-zinc-950 font-bold'
                  : theme === 'dark'
                    ? 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <Users size={20} weight={activeTab === 'users' ? 'fill' : 'regular'} />
              Usuários
            </button>
          )}
        </nav>

        <div className="p-4 mt-auto">
          <div className={`border rounded-2xl p-4 mb-4 transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-zinc-50 border-zinc-200'}`}>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Logado como</p>
            <p className={`font-bold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{user?.name || 'Usuário'}</p>
            <div className="flex items-center gap-1 mt-1">
              <ShieldCheck size={12} className={user?.role === 'admin' ? 'text-blue-400' : 'text-zinc-500'} />
              <span className="text-[10px] text-zinc-400 uppercase font-medium">{user?.role || 'Vendedor'}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-colors"
          >
            <SignOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'kanban' ? (
            <ErrorBoundary>
            <>
              {/* Header de Métricas */}
              <header className="p-8 pb-4 flex items-center justify-between flex-wrap gap-6">
                <div>
                  <h2 className="text-2xl font-black">Olá, {user?.name?.split(' ')[0] || 'Usuário'}</h2>
                  <p className="text-zinc-500 text-sm">Aqui está o resumo dos seus leads hoje.</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`border rounded-2xl px-6 py-3 text-right transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200 shadow-sm'}`}>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold">Total de Leads</p>
                    <p className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{totalLeads}</p>
                  </div>
                  <div className={`border rounded-2xl px-6 py-3 text-right transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200 shadow-sm'}`}>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold">Economia Projetada</p>
                    <p className="text-2xl font-black text-[var(--color-accent)]">{formatCurrency(totalEconomia)}</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-6 py-3 text-right">
                    <p className="text-green-500 text-[10px] uppercase font-bold">Fechados ✓</p>
                    <p className="text-2xl font-black text-green-500">{totalFechados}</p>
                    <p className="text-[10px] text-green-600 font-bold mt-1">{formatCurrency(economiaFechados)}</p>
                  </div>
                </div>
              </header>

              {/* Filtros */}
              <div className="px-8 mb-4">
                <div className={`flex items-center gap-3 flex-wrap p-3 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200 shadow-sm'}`}>
                  <div className="relative flex-1 min-w-[200px]">
                    <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar por nome ou whatsapp..."
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all ${
                        theme === 'dark' 
                          ? 'bg-zinc-950 border-white/5 focus:border-[var(--color-accent)] text-white' 
                          : 'bg-zinc-50 border-zinc-100 focus:border-[var(--color-accent)] text-zinc-900'
                      }`}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    {['todos', 'quente', 'morno', 'frio'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFiltroInteresse(f as FilterInteresse)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          filtroInteresse === f 
                            ? theme === 'dark' ? 'bg-white text-zinc-950 border-white' : 'bg-zinc-900 text-white border-zinc-900'
                            : theme === 'dark' ? 'bg-transparent border-white/10 text-zinc-500 hover:border-white/20' : 'bg-transparent border-zinc-200 text-zinc-500 hover:border-zinc-300'
                        }`}
                      >
                        {f === 'todos' ? 'Todos' : f.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      showFilters 
                        ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-zinc-950' 
                        : theme === 'dark' ? 'border-white/10 text-zinc-500' : 'border-zinc-200 text-zinc-500'
                    }`}
                  >
                    <Funnel size={20} weight={showFilters ? 'fill' : 'regular'} />
                  </button>

                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="p-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all">
                      <X size={20} weight="bold" />
                    </button>
                  )}

                  <div className={`w-px h-8 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-zinc-200'}`} />

                  <button
                    onClick={() => setIsNewLeadModalOpen(true)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:brightness-105 active:scale-95 ${
                      theme === 'dark'
                        ? 'bg-[var(--color-accent)] text-zinc-950 shadow-[var(--color-accent)]/20'
                        : 'bg-zinc-950 text-white shadow-zinc-300'
                    }`}
                  >
                    <Plus size={18} weight="bold" />
                    Novo Cliente
                  </button>
                </div>

                {/* Filtros Expandidos */}
                {showFilters && (
                  <div className={`mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200 shadow-sm'}`}>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-widest">Tipo de Imóvel</label>
                      <select 
                        value={filtroImovel}
                        onChange={(e) => setFiltroImovel(e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2 text-xs outline-none focus:border-[var(--color-accent)] ${
                          theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      >
                        <option value="todos">Todos os tipos</option>
                        {tiposImovel.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-widest">Período</label>
                      <select 
                        value={filtroPeriodo}
                        onChange={(e) => setFiltroPeriodo(e.target.value as FilterPeriodo)}
                        className={`w-full border rounded-xl px-3 py-2 text-xs outline-none focus:border-[var(--color-accent)] ${
                          theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      >
                        <option value="todos">Todo o período</option>
                        <option value="hoje">Hoje</option>
                        <option value="semana">Esta semana</option>
                        <option value="mes">Este mês</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-widest">Valor Mínimo</label>
                      <input 
                        type="number"
                        value={filtroValorMin}
                        onChange={(e) => setFiltroValorMin(e.target.value)}
                        placeholder="R$ 0"
                        className={`w-full border rounded-xl px-3 py-2 text-xs outline-none focus:border-[var(--color-accent)] ${
                          theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-widest">Valor Máximo</label>
                      <input 
                        type="number"
                        value={filtroValorMax}
                        onChange={(e) => setFiltroValorMax(e.target.value)}
                        placeholder="Sem limite"
                        className={`w-full border rounded-xl px-3 py-2 text-xs outline-none focus:border-[var(--color-accent)] ${
                          theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Kanban */}
              <div className="flex-1 overflow-x-auto p-8 pt-0">
                <div aria-live="polite" className="sr-only">{announcement}</div>
                <DragDropContext onDragEnd={onDragEnd}>
                  <div className="flex gap-6 min-w-max">
                    {COLUMNS.map((col) => {
                      const colLeads = filteredLeads.filter(l => l.status === col.id);
                      return (
                        <div key={col.id} className="w-[320px] flex flex-col shrink-0">
                          <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${col.color}`} />
                              <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-400">{col.label}</h3>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${theme === 'dark' ? 'bg-white/5 text-zinc-500' : 'bg-zinc-100 text-zinc-500'}`}>
                                {colLeads.length}
                              </span>
                            </div>
                            <button 
                              onClick={() => {
                                setCreationStatus(col.id);
                                setIsNewLeadModalOpen(true);
                              }}
                              className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-zinc-600 hover:text-white' : 'hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900'}`}
                            >
                              <Plus size={16} weight="bold" />
                            </button>
                          </div>

                          <Droppable droppableId={col.id}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`flex-1 rounded-3xl p-3 transition-all min-h-[500px] ${
                                  snapshot.isDraggingOver 
                                    ? theme === 'dark' ? 'bg-white/10 ring-2 ring-[var(--color-accent)]/20' : 'bg-zinc-100 ring-2 ring-[var(--color-accent)]/20'
                                    : theme === 'dark' ? 'bg-white/5 border border-dashed border-white/5' : 'bg-zinc-100/50 border border-dashed border-zinc-200'
                                }`}
                              >
                                {/* Botão de Adição Rápida */}
                                <button 
                                  onClick={() => {
                                    setCreationStatus(col.id);
                                    setIsNewLeadModalOpen(true);
                                  }}
                                  className={`w-full mb-3 p-3 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 transition-all group ${
                                    theme === 'dark' 
                                      ? 'border-white/5 bg-white/5 hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/5' 
                                      : 'border-zinc-100 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100'
                                  }`}
                                >
                                  <Plus size={16} weight="bold" className={`transition-colors ${theme === 'dark' ? 'text-zinc-700 group-hover:text-[var(--color-accent)]' : 'text-zinc-400 group-hover:text-zinc-900'}`} />
                                  <span className={`text-xs font-bold transition-colors ${theme === 'dark' ? 'text-zinc-700 group-hover:text-[var(--color-accent)]' : 'text-zinc-400 group-hover:text-zinc-900'}`}>Adicionar Contato</span>
                                </button>
                                {colLeads.map((lead, idx) => (
                                  <LeadCard key={lead.id} lead={lead} index={idx} onOpenDetail={(l) => setSelectedLeadId(l.id)} />
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      );
                    })}
                  </div>
                </DragDropContext>
              </div>
            </>
            </ErrorBoundary>
          ) : activeTab === 'contacts' ? (
            <ErrorBoundary><div className="p-8 h-full flex flex-col overflow-hidden">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black mb-2">Base de Contatos</h2>
                  <p className="text-zinc-500">Lista completa de todos os clientes cadastrados.</p>
                </div>
                <button
                  onClick={() => setIsNewLeadModalOpen(true)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:brightness-105 active:scale-95 ${
                    theme === 'dark'
                      ? 'bg-[var(--color-accent)] text-zinc-950 shadow-[var(--color-accent)]/20'
                      : 'bg-zinc-950 text-white shadow-zinc-300'
                  }`}
                >
                  <Plus size={18} weight="bold" />
                  Novo Cliente
                </button>
              </div>

              {/* Tabela de Contatos */}
              <div className={`flex-1 border rounded-3xl overflow-hidden flex flex-col transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200 shadow-sm'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-zinc-50 border-zinc-200'}`}>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Cliente</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">WhatsApp</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Conta</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Atendente</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/10 dark:divide-white/5">
                      {leads.map((l) => (
                        <tr 
                          key={l.id} 
                          onClick={() => setSelectedLeadId(l.id)}
                          className={`group cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-zinc-50'}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center dark:bg-white/10">
                                <User size={20} className="text-zinc-400" />
                              </div>
                              <div>
                                <p className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{l.nome}</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-medium">{l.tipoImovel}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase ${COLUMNS.find(c => c.id === l.status)?.color} text-white`}>
                              {COLUMNS.find(c => c.id === l.status)?.label.replace('✓', '')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <WhatsappLogo size={16} className="text-green-500" />
                              <span className="text-sm text-zinc-500 font-medium">
                                {l.whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{formatCurrency(l.valorConta)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <Headset size={14} weight="fill" className={l.assignedToName ? 'text-[var(--color-accent)]' : 'text-zinc-500'} />
                              <span className={`text-xs font-medium ${l.assignedToName ? (theme === 'dark' ? 'text-zinc-200' : 'text-zinc-700') : 'text-zinc-500'}`}>
                                {l.assignedToName ?? 'Sem atendente'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-2 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-zinc-950 transition-all opacity-0 group-hover:opacity-100 font-bold text-xs">
                                Ver Detalhes
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Tem certeza que deseja excluir ${l.nome}?`)) {
                                    removeLead(l.id);
                                  }
                                }}
                                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {leads.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                    <AddressBook size={48} className="text-zinc-700 mb-4" />
                    <p className="text-zinc-500 font-medium">Nenhum cliente cadastrado na base.</p>
                  </div>
                )}
              </div>
            </div></ErrorBoundary>
          ) : (
            <ErrorBoundary><div className="p-8 max-w-4xl h-full overflow-y-auto">
              <div className="mb-10">
                <h2 className="text-3xl font-black mb-2">Gestão de Usuários</h2>
                <p className="text-zinc-500">Adicione ou remova membros da equipe com acesso ao CRM.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Lista de Usuários */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                    <Users size={22} className="text-[var(--color-accent)]" />
                    Membros Ativos
                  </h3>
                  {users?.map((u) => (
                    <div key={u.email} className={`border rounded-2xl p-5 flex items-center justify-between group transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200 shadow-sm'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                          <User size={24} weight="fill" className="text-[var(--color-accent)]" />
                        </div>
                        <div>
                          <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{u.name}</p>
                          <p className="text-zinc-500 text-xs">{u.email}</p>
                          <span className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${u.role === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                            {u.role}
                          </span>
                        </div>
                      </div>
                      {u.email !== user?.email && (
                        <button 
                          onClick={() => removeUser(u.email)}
                          className="p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Formulário Novo Usuário */}
                <div className={`border rounded-3xl p-8 h-fit transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200 shadow-sm'}`}>
                  <h3 className={`text-lg font-bold flex items-center gap-2 mb-6 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                    <Plus size={22} className="text-[var(--color-accent)]" />
                    Novo Usuário
                  </h3>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Nome Completo</label>
                      <input 
                        required
                        value={newUserName}
                        onChange={e => setNewUserName(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] transition-all ${
                          theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                        placeholder="Nome do membro"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Email de Acesso</label>
                      <input 
                        required
                        type="email"
                        value={newUserEmail}
                        onChange={e => setNewUserEmail(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] transition-all ${
                          theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                        placeholder="email@empresa.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Senha Provisória</label>
                      <input 
                        required
                        type="password"
                        value={newUserPassword}
                        onChange={e => setNewUserPassword(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] transition-all ${
                          theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Permissão</label>
                      <select 
                        value={newUserRole}
                        onChange={e => setNewUserRole(e.target.value as UserRole)}
                        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] transition-all ${
                          theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      >
                        <option value="vendedor">Vendedor (Apenas CRM)</option>
                        <option value="admin">Administrador (Total)</option>
                      </select>
                    </div>
                    <button className="w-full bg-[var(--color-accent)] text-zinc-950 font-bold py-4 rounded-xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all">
                      Criar Acesso
                    </button>
                  </form>
                </div>
              </div>
            </div></ErrorBoundary>
          )}
        </main>
      </div>
  );
}
