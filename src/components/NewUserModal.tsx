import { useState, useEffect } from 'react';
import { X, UserPlus, Crown, Headset, Newspaper, Check } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, DEFAULT_PASSWORD } from '../store/useAuthStore';
import type { UserRole } from '../store/useAuthStore';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function NewUserModal({ isOpen, onClose }: NewUserModalProps) {
  const { addUser, theme } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('vendedor');
  const [canManageBlog, setCanManageBlog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setName('');
        setEmail('');
        setRole('vendedor');
        setCanManageBlog(false);
        setLoading(false);
      }, 250);
    }
  }, [isOpen]);

  const canSubmit = name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    const success = await addUser({ name: name.trim(), email: email.trim(), role, canManageBlog });
    setLoading(false);
    if (success) {
      onClose();
    } else {
      alert('Erro ao criar usuário. O e-mail já pode estar cadastrado.');
    }
  };

  const avatarColor = role === 'admin' ? 'bg-blue-500' : 'bg-[var(--color-accent)]';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ${
              theme === 'dark' ? 'bg-zinc-950 border border-white/10' : 'bg-white'
            }`}
          >
            {/* Header com avatar dinâmico */}
            <div className={`px-7 pt-7 pb-6 relative transition-colors ${theme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-950'}`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={18} weight="bold" className="text-white" />
              </button>

              <div className="flex items-center gap-4">
                <motion.div
                  key={role}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-zinc-950 shrink-0 shadow-lg ${avatarColor}`}
                >
                  {getInitials(name) || <UserPlus size={26} weight="bold" />}
                </motion.div>
                <div className="min-w-0">
                  <p className="text-zinc-400 text-xs font-semibold tracking-widest uppercase mb-1">Novo membro da equipe</p>
                  <h2 className="text-white font-black text-xl tracking-tight truncate">
                    {name.trim() || 'Nome do usuário'}
                  </h2>
                  <span className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    role === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                  }`}>
                    {role === 'admin' ? <Crown size={11} weight="fill" /> : <Headset size={11} weight="fill" />}
                    {role === 'admin' ? 'Administrador' : 'Vendedor'}
                  </span>
                </div>
              </div>
            </div>

            {/* Corpo */}
            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nome completo</label>
                <input
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Maria Oliveira"
                  className={`w-full border-2 rounded-xl px-4 py-3 font-medium placeholder:text-zinc-500 outline-none transition-colors text-sm ${
                    theme === 'dark' ? 'bg-zinc-900 border-white/10 text-white focus:border-[var(--color-accent)]' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-950'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">E-mail de acesso</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@empresa.com"
                  className={`w-full border-2 rounded-xl px-4 py-3 font-medium placeholder:text-zinc-500 outline-none transition-colors text-sm ${
                    theme === 'dark' ? 'bg-zinc-900 border-white/10 text-white focus:border-[var(--color-accent)]' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-950'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Permissão</label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: 'vendedor' as UserRole, label: 'Vendedor', desc: 'Acesso ao CRM', icon: <Headset size={20} weight="fill" /> },
                    { value: 'admin' as UserRole, label: 'Admin', desc: 'Acesso total', icon: <Crown size={20} weight="fill" /> },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                        role === opt.value
                          ? theme === 'dark'
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                            : 'border-zinc-950 bg-zinc-50'
                          : theme === 'dark'
                            ? 'border-white/10 hover:border-white/20'
                            : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      {role === opt.value && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                          <Check size={12} weight="bold" className="text-zinc-950" />
                        </div>
                      )}
                      <div className={role === opt.value ? 'text-[var(--color-accent)]' : 'text-zinc-500'}>{opt.icon}</div>
                      <p className={`font-bold text-sm mt-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{opt.label}</p>
                      <p className="text-[11px] text-zinc-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {role === 'vendedor' && (
                  <motion.label
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors overflow-hidden ${
                      theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <Newspaper size={20} className={canManageBlog ? 'text-[var(--color-accent)]' : 'text-zinc-500'} />
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Permitir gerenciar blog</p>
                      <p className="text-[11px] text-zinc-500">Libera acesso à aba Blog para publicar e editar artigos.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={canManageBlog}
                      onChange={(e) => setCanManageBlog(e.target.checked)}
                      className="w-4 h-4 accent-[var(--color-accent)] shrink-0"
                    />
                  </motion.label>
                )}
              </AnimatePresence>

              <div className={`flex items-start gap-3 p-3 rounded-xl text-[11px] leading-relaxed ${theme === 'dark' ? 'bg-white/5 text-zinc-400' : 'bg-zinc-50 text-zinc-500'}`}>
                <Check size={14} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                <span>
                  O acesso já é liberado com a senha padrão <strong className={theme === 'dark' ? 'text-white' : 'text-zinc-900'}>{DEFAULT_PASSWORD}</strong>.
                  No primeiro login, {name.trim().split(' ')[0] || 'o usuário'} define a própria senha.
                </span>
              </div>

              <button
                type="submit"
                disabled={!canSubmit || loading}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                  !canSubmit || loading
                    ? 'opacity-50 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'bg-[var(--color-accent)] text-zinc-950 hover:brightness-105 shadow-[var(--color-accent)]/20'
                      : 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-zinc-200'
                }`}
              >
                <UserPlus size={18} weight="bold" />
                {loading ? 'Criando...' : 'Criar Acesso'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
