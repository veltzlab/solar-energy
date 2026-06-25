import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// createClient lança erro de forma síncrona se url/key estiverem ausentes,
// o que derruba o app inteiro na importação (mesmo a landing page, que não usa CRM).
// Em produção sem as env vars configuradas, isso resulta em tela branca.
if (!url || !key) {
  console.error('Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente do deploy.')
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder-key')

// Cliente isolado para criar usuários sem substituir a sessão atual
export const supabaseIsolated = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder-key', {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})
