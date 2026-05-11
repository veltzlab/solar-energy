# CRM Standalone — Painel de Vendas

CRM independente com Kanban de leads, integração WhatsApp (Baileys) e autenticação por roles (admin/vendedor).

## 🚀 Como usar em outro projeto

### 1. Instalar dependências do frontend

```bash
npm install
```

### 2. Instalar dependências do backend (servidor WhatsApp)

```bash
cd server
npm install
```

### 3. Rodar o backend (porta 3001)

```bash
cd server
npx ts-node index.ts
# ou, se tiver ts-node instalado globalmente:
# ts-node index.ts
```

### 4. Rodar o frontend (porta 5173)

```bash
npm run dev
```

### 5. Acessar

- Frontend: http://localhost:5173/crm
- API:      http://localhost:3001/api

---

## 🔑 Credenciais padrão

| Usuário       | E-mail                    | Senha        | Papel     |
|---------------|---------------------------|--------------|-----------|
| Administrador | admin@solarenergy.com     | solar@2025   | admin     |
| Vendas        | vendas@solarenergy.com    | vendas@2025  | vendedor  |

> ⚠️ Altere as credenciais em `src/store/useAuthStore.ts` antes de usar em produção.

---

## 📁 Estrutura

```
crm-standalone/
├── index.html
├── package.json
├── vite.config.ts
├── server/               ← Backend Node.js + Baileys (WhatsApp)
│   ├── index.ts
│   ├── routes.ts
│   └── whatsapp.ts
└── src/
    ├── App.tsx            ← Roteamento: / → /crm
    ├── main.tsx
    ├── index.css
    ├── lib/
    │   └── api.ts         ← Funções de chamada à API
    ├── store/
    │   ├── useAuthStore.ts    ← Auth + usuários + tema
    │   ├── useCrmStore.ts     ← Leads (Kanban)
    │   └── useWhatsappStore.ts ← Templates de mensagem
    ├── pages/
    │   ├── CrmDashboard.tsx   ← Painel Kanban principal
    │   └── CrmLogin.tsx       ← Tela de login
    └── components/
        ├── LeadDetailModal.tsx ← Detalhes + notas do lead
        ├── NewLeadModal.tsx    ← Cadastro manual de lead
        └── WhatsappPanel.tsx   ← Painel de WhatsApp + templates
```

---

## 🛠️ Personalizar

- **Nome/marca**: Altere textos em `CrmLogin.tsx` e `CrmDashboard.tsx`
- **Cor de destaque**: Edite `--color-accent` em `src/index.css`
- **Templates WhatsApp**: Edite `src/store/useWhatsappStore.ts`
