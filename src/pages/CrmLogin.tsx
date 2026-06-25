import { useState } from 'react';
import { SunDim, Lock, Eye, EyeSlash, Warning, CheckCircle } from '@phosphor-icons/react';
import { useAuthStore } from '../store/useAuthStore';

export function CrmLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const login = useAuthStore((s) => s.login);
  const completeFirstLogin = useAuthStore((s) => s.completeFirstLogin);
  const cancelFirstLogin = useAuthStore((s) => s.cancelFirstLogin);
  const pendingUser = useAuthStore((s) => s.pendingUser);
  const theme = useAuthStore((s) => s.theme);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email.trim(), password);
    if (result === 'invalid') {
      setError('E-mail ou senha incorretos. Verifique suas credenciais.');
    } else if (result === 'must-change-password') {
      setMustChangePassword(true);
    }
    setLoading(false);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    await completeFirstLogin(newPassword);
    setLoading(false);
  };

  const handleBackToLogin = () => {
    cancelFirstLogin();
    setMustChangePassword(false);
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
      {/* Fundo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--color-accent)]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20">
              <SunDim size={28} weight="fill" className="text-zinc-950" />
            </div>
            <span className={`font-black text-2xl tracking-tight ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Solar Energy</span>
          </div>
          <h1 className="text-zinc-500 text-sm font-semibold tracking-widest uppercase">Área Restrita — CRM</h1>
        </div>

        {/* Card de login / primeira senha */}
        <div className={`border rounded-3xl p-8 backdrop-blur-sm transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200 shadow-xl shadow-zinc-200/50'}`}>
          {!mustChangePassword ? (
            <>
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white/10' : 'bg-zinc-100'}`}>
                  <Lock size={18} className={theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'} />
                </div>
                <div>
                  <h2 className={`font-bold text-lg leading-none ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Acesso da Equipe</h2>
                  <p className="text-zinc-500 text-sm">Insira suas credenciais para continuar</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoFocus
                    className={`w-full border rounded-xl px-4 py-3 font-medium transition-all outline-none ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-[var(--color-accent)]'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-1.5">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`w-full border rounded-xl px-4 py-3 pr-12 font-medium transition-all outline-none ${
                        theme === 'dark'
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-[var(--color-accent)]'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <Warning size={18} className="text-red-400 shrink-0" />
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[var(--color-accent)] text-zinc-950 font-bold text-base hover:brightness-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[var(--color-accent)]/20 mt-2"
                >
                  {loading ? 'Verificando...' : 'Entrar no CRM'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                  <CheckCircle size={20} weight="fill" className="text-[var(--color-accent)]" />
                </div>
                <div>
                  <h2 className={`font-bold text-lg leading-none ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Primeiro acesso</h2>
                  <p className="text-zinc-500 text-sm">Olá, {pendingUser?.name?.split(' ')[0]}! Defina sua nova senha.</p>
                </div>
              </div>

              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-1.5">Nova senha</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    autoFocus
                    className={`w-full border rounded-xl px-4 py-3 font-medium transition-all outline-none ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-[var(--color-accent)]'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-1.5">Confirmar senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      required
                      className={`w-full border rounded-xl px-4 py-3 pr-12 font-medium transition-all outline-none ${
                        theme === 'dark'
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-[var(--color-accent)]'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <Warning size={18} className="text-red-400 shrink-0" />
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[var(--color-accent)] text-zinc-950 font-bold text-base hover:brightness-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[var(--color-accent)]/20 mt-2"
                >
                  {loading ? 'Salvando...' : 'Definir senha e entrar'}
                </button>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full text-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Voltar
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-zinc-700 text-xs mt-6">
          Acesso restrito à equipe Solar Energy. <br />
          Problemas? Entre em contato com o administrador.
        </p>
      </div>
    </div>
  );
}
