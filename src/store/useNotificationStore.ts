import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LeadReminder {
  id: string;
  leadId: string;
  leadNome: string;
  vendedorEmail: string;
  message: string;
  remindAt: string;
  done: boolean;
  notified?: boolean;
  createdAt: string;
  type?: 'reminder' | 'assignment';
}

interface NotificationStore {
  reminders: LeadReminder[];
  addReminder: (data: { leadId: string; leadNome: string; vendedorEmail: string; message: string; remindAt: string }) => void;
  notifyAssignment: (data: { leadId: string; leadNome: string; vendedorEmail: string; fromName: string }) => void;
  markDone: (id: string) => void;
  markNotified: (id: string) => void;
  removeReminder: (id: string) => void;
  removeForLead: (leadId: string) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      reminders: [],

      addReminder: (data) => {
        const reminder: LeadReminder = {
          ...data,
          id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          done: false,
          createdAt: new Date().toISOString(),
          type: 'reminder',
        };
        set((s) => ({ reminders: [reminder, ...s.reminders] }));
      },

      notifyAssignment: ({ leadId, leadNome, vendedorEmail, fromName }) => {
        const reminder: LeadReminder = {
          id: `assign_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          leadId,
          leadNome,
          vendedorEmail,
          message: `${fromName} te passou este lead`,
          remindAt: new Date().toISOString(),
          done: false,
          createdAt: new Date().toISOString(),
          type: 'assignment',
        };
        set((s) => ({ reminders: [reminder, ...s.reminders] }));
      },

      markDone: (id) => {
        set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, done: true } : r)) }));
      },

      markNotified: (id) => {
        set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, notified: true } : r)) }));
      },

      removeReminder: (id) => {
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) }));
      },

      removeForLead: (leadId) => {
        set((s) => ({ reminders: s.reminders.filter((r) => r.leadId !== leadId) }));
      },
    }),
    { name: 'solar-crm-reminders' }
  )
);
