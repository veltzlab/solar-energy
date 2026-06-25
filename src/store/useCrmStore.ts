import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  assignedToEmail?: string;
  assignedToName?: string;
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
  claimLead: (id: string, vendedor: { email: string; name: string }) => Promise<void>;
  releaseLead: (id: string) => Promise<void>;
}

export const useCrmStore = create<CrmStore>()(
  persist(
    (set) => ({
      leads: [],
      loading: false,

      // Os leads já são carregados do localStorage pelo middleware `persist`.
      // Mantido por compatibilidade com quem chama fetchLeads() ao montar a tela.
      fetchLeads: async () => {},

      addLead: async (leadData, initialStatus) => {
        const id = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const newLead: Lead = {
          ...leadData,
          id,
          status: initialStatus || 'novo',
          createdAt: new Date().toISOString(),
          notes: [],
        };
        set((s) => ({ leads: [newLead, ...s.leads] }));
        return id;
      },

      updateLeadStatus: async (id, status) => {
        const movedAt = new Date().toISOString();
        set((s) => ({ leads: s.leads.map((l) => l.id === id ? { ...l, status, movedAt } : l) }));
      },

      updateLead: async (id, data) => {
        set((s) => ({ leads: s.leads.map((l) => l.id === id ? { ...l, ...data } : l) }));
      },

      claimLead: async (id, vendedor) => {
        set((s) => ({
          leads: s.leads.map((l) => l.id === id
            ? { ...l, assignedToEmail: vendedor.email, assignedToName: vendedor.name }
            : l
          ),
        }));
      },

      releaseLead: async (id) => {
        set((s) => ({
          leads: s.leads.map((l) => l.id === id
            ? { ...l, assignedToEmail: undefined, assignedToName: undefined }
            : l
          ),
        }));
      },

      removeLead: async (id) => {
        set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }));
      },

      addNote: async (leadId, text) => {
        const noteId = `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const newNote: LeadNote = { id: noteId, text, createdAt: new Date().toISOString() };
        set((s) => ({
          leads: s.leads.map((l) => l.id === leadId ? { ...l, notes: [newNote, ...(l.notes || [])] } : l),
        }));
      },

      removeNote: async (leadId, noteId) => {
        set((s) => ({
          leads: s.leads.map((l) => l.id === leadId
            ? { ...l, notes: (l.notes || []).filter((n) => n.id !== noteId) }
            : l
          ),
        }));
      },
    }),
    { name: 'solar-crm-leads' }
  )
);
