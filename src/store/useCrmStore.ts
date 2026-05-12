import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type LeadStatus = 'novo' | 'atendimento' | 'visita' | 'proposta' | 'fechado';

export interface LeadNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  nome: string;
  whatsapp: string;
  valorConta: number;
  tipoImovel: string;
  economiaProjetada: number;
  sistemaIndicado: number;
  payback: number;
  status: LeadStatus;
  createdAt: string;
  movedAt?: string;
  interesse?: 'quente' | 'morno' | 'frio';
  tipoTelhado?: string;
  horarioContato?: string;
  notes: LeadNote[];
  consumoConfirmado?: number;
}

interface CrmStore {
  leads: Lead[];
  loading: boolean;
  fetchLeads: () => Promise<void>;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'status' | 'interesse' | 'tipoTelhado' | 'horarioContato' | 'notes' | 'consumoConfirmado'>, initialStatus?: LeadStatus) => Promise<string>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<void>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  removeLead: (id: string) => Promise<void>;
  addNote: (leadId: string, text: string) => Promise<void>;
  removeNote: (leadId: string, noteId: string) => Promise<void>;
}

function rowToLead(row: any): Lead {
  const notes: LeadNote[] = (row.lead_notes || [])
    .map((n: any) => ({ id: n.id, text: n.text, createdAt: n.created_at }))
    .sort((a: LeadNote, b: LeadNote) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return {
    id: row.id,
    nome: row.nome,
    whatsapp: row.whatsapp,
    valorConta: Number(row.valor_conta),
    tipoImovel: row.tipo_imovel,
    economiaProjetada: Number(row.economia_projetada),
    sistemaIndicado: Number(row.sistema_indicado),
    payback: Number(row.payback),
    status: row.status as LeadStatus,
    createdAt: row.created_at,
    movedAt: row.moved_at ?? undefined,
    interesse: row.interesse ?? undefined,
    tipoTelhado: row.tipo_telhado ?? undefined,
    horarioContato: row.horario_contato ?? undefined,
    consumoConfirmado: row.consumo_confirmado != null ? Number(row.consumo_confirmado) : undefined,
    notes,
  };
}

export const useCrmStore = create<CrmStore>()((set) => ({
  leads: [],
  loading: false,

  fetchLeads: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('leads')
      .select('*, lead_notes(*)')
      .order('created_at', { ascending: false });
    set({ leads: data ? data.map(rowToLead) : [], loading: false });
  },

  addLead: async (leadData, initialStatus) => {
    const id = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const newLead: Lead = { ...leadData, id, status: initialStatus || 'novo', createdAt: now, notes: [] };
    set((s) => ({ leads: [newLead, ...s.leads] }));
    await supabase.from('leads').insert({
      id,
      nome: leadData.nome,
      whatsapp: leadData.whatsapp,
      valor_conta: leadData.valorConta,
      tipo_imovel: leadData.tipoImovel,
      economia_projetada: leadData.economiaProjetada,
      sistema_indicado: leadData.sistemaIndicado,
      payback: leadData.payback,
      status: initialStatus || 'novo',
      created_at: now,
    });
    return id;
  },

  updateLeadStatus: async (id, status) => {
    const movedAt = new Date().toISOString();
    set((s) => ({ leads: s.leads.map((l) => l.id === id ? { ...l, status, movedAt } : l) }));
    await supabase.from('leads').update({ status, moved_at: movedAt }).eq('id', id);
  },

  updateLead: async (id, data) => {
    set((s) => ({ leads: s.leads.map((l) => l.id === id ? { ...l, ...data } : l) }));
    const dbData: Record<string, any> = {};
    if (data.interesse !== undefined) dbData.interesse = data.interesse ?? null;
    if (data.tipoTelhado !== undefined) dbData.tipo_telhado = data.tipoTelhado ?? null;
    if (data.horarioContato !== undefined) dbData.horario_contato = data.horarioContato ?? null;
    if (data.consumoConfirmado !== undefined) dbData.consumo_confirmado = data.consumoConfirmado ?? null;
    if (data.status !== undefined) dbData.status = data.status;
    if (Object.keys(dbData).length > 0) {
      await supabase.from('leads').update(dbData).eq('id', id);
    }
  },

  removeLead: async (id) => {
    set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }));
    await supabase.from('leads').delete().eq('id', id);
  },

  addNote: async (leadId, text) => {
    const noteId = `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const createdAt = new Date().toISOString();
    const newNote: LeadNote = { id: noteId, text, createdAt };
    set((s) => ({
      leads: s.leads.map((l) => l.id === leadId ? { ...l, notes: [newNote, ...(l.notes || [])] } : l),
    }));
    await supabase.from('lead_notes').insert({ id: noteId, lead_id: leadId, text, created_at: createdAt });
  },

  removeNote: async (leadId, noteId) => {
    set((s) => ({
      leads: s.leads.map((l) => l.id === leadId
        ? { ...l, notes: (l.notes || []).filter((n) => n.id !== noteId) }
        : l
      ),
    }));
    await supabase.from('lead_notes').delete().eq('id', noteId);
  },
}));
