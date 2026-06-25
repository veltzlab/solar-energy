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
  sistemaIndicado: number; // kWp
  payback: number; // anos
  status: LeadStatus;
  createdAt: string;
  movedAt?: string;  // data da última mudança de etapa
  // Campos de qualificação preenchidos pelo atendente
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
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'status' | 'interesse' | 'tipoTelhado' | 'horarioContato' | 'notes' | 'consumoConfirmado'>, initialStatus?: LeadStatus) => string;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  removeLead: (id: string) => void;
  addNote: (leadId: string, text: string) => void;
  removeNote: (leadId: string, noteId: string) => void;
  claimLead: (id: string, vendedor: { email: string; name: string }) => void;
  releaseLead: (id: string) => void;
}

export const useCrmStore = create<CrmStore>()(
  persist(
    (set) => ({
      leads: [],

      addLead: (leadData, initialStatus) => {
        const id = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const newLead: Lead = {
          ...leadData,
          id,
          status: initialStatus || 'novo',
          createdAt: new Date().toISOString(),
          notes: [],
        };
        set((state) => ({ leads: [newLead, ...state.leads] }));
        return id;
      },

      updateLeadStatus: (id, status) => {
        set((state) => ({
          leads: state.leads.map((l) =>
            l.id === id ? { ...l, status, movedAt: new Date().toISOString() } : l
          ),
        }));
      },

      updateLead: (id, data) => {
        set((state) => ({
          leads: state.leads.map((l) => (l.id === id ? { ...l, ...data } : l)),
        }));
      },

      removeLead: (id) => {
        set((state) => ({ leads: state.leads.filter((l) => l.id !== id) }));
      },

      addNote: (leadId, text) => {
        set((state) => {
          const newLeads = state.leads.map((l) => {
            if (l.id === leadId) {
              const currentNotes = l.notes || [];
              return {
                ...l,
                notes: [
                  { id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, text, createdAt: new Date().toISOString() },
                  ...currentNotes,
                ],
              };
            }
            return l;
          });
          return { leads: newLeads };
        });
      },

      removeNote: (leadId, noteId) => {
        set((state) => {
          const newLeads = state.leads.map((l) => {
            if (l.id === leadId) {
              return {
                ...l,
                notes: (l.notes || []).filter((n) => n.id !== noteId),
              };
            }
            return l;
          });
          return { leads: newLeads };
        });
      },

      claimLead: (id, vendedor) => {
        set((state) => ({
          leads: state.leads.map((l) =>
            l.id === id ? { ...l, assignedToEmail: vendedor.email, assignedToName: vendedor.name } : l
          ),
        }));
      },

      releaseLead: (id) => {
        set((state) => ({
          leads: state.leads.map((l) =>
            l.id === id ? { ...l, assignedToEmail: undefined, assignedToName: undefined } : l
          ),
        }));
      },
    }),
    {
      name: 'solar-crm-leads', // chave no localStorage
    }
  )
);
