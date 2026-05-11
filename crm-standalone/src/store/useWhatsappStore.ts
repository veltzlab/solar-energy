import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MessageTemplate {
  id: string;
  name: string;
  body: string;
  locked: boolean; // templates bloqueados não podem ser excluídos
}

interface WhatsappStore {
  templates: MessageTemplate[];
  updateTemplate: (id: string, body: string) => void;
  addTemplate: (name: string, body: string) => void;
  removeTemplate: (id: string) => void;
}

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'welcome',
    name: 'Boas-vindas (Calculadora)',
    locked: true,
    body:
      'Olá, {nome}! 👋\n\n' +
      'Recebemos sua simulação de energia solar! ☀️\n\n' +
      '📊 *Resumo da sua simulação:*\n' +
      '• Economia mensal: *{economia}*\n' +
      '• Sistema indicado: *{sistema} kWp*\n' +
      '• Retorno do investimento: *{payback} anos*\n\n' +
      'Em breve nossa equipe entrará em contato para apresentar sua proposta personalizada!\n\n' +
      '_Solar Energy — Transformando o sol em economia real_ 🌱',
  },
  {
    id: 'contact',
    name: 'Confirmação de Contato',
    locked: true,
    body:
      'Olá, {nome}! 👋\n\n' +
      'Recebemos sua mensagem no site da *Solar Energy*! 🌞\n\n' +
      'Nossa equipe de especialistas retornará em breve.\n\n' +
      '_Solar Energy — Energia limpa e acessível_ 🌱',
  },
  {
    id: 'followup',
    name: 'Follow-up',
    locked: false,
    body:
      'Olá, {nome}! 😊\n\n' +
      'Tudo bem?\n\n' +
      'Passando para verificar se você ainda tem interesse em energia solar. Podemos agendar uma visita técnica gratuita no seu imóvel?\n\n' +
      '_Solar Energy_ ☀️',
  },
  {
    id: 'proposal',
    name: 'Envio de Proposta',
    locked: false,
    body:
      'Olá, {nome}! ☀️\n\n' +
      'Preparamos a sua proposta personalizada de energia solar!\n\n' +
      'Com base na sua simulação, a economia estimada é de *{economia}/mês*.\n\n' +
      'Posso te enviar o PDF com todos os detalhes agora?\n\n' +
      '_Solar Energy_ 🌱',
  },
];

export const useWhatsappStore = create<WhatsappStore>()(
  persist(
    (set, get) => ({
      templates: DEFAULT_TEMPLATES,

      updateTemplate: (id, body) => {
        set({
          templates: get().templates.map((t) => (t.id === id ? { ...t, body } : t)),
        });
      },

      addTemplate: (name, body) => {
        const id = `tpl_${Date.now()}`;
        set({ templates: [...get().templates, { id, name, body, locked: false }] });
      },

      removeTemplate: (id) => {
        set({ templates: get().templates.filter((t) => t.id !== id || t.locked) });
      },
    }),
    { name: 'solar-whatsapp-templates' }
  )
);
