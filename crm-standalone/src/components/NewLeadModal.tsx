import { useState, useEffect } from 'react';
import { X, User, WhatsappLogo, CurrencyDollar, PlusCircle, Check } from '@phosphor-icons/react';
import { useCrmStore, type LeadStatus } from '../store/useCrmStore';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { calcularSistema } from '../utils/solarCalculations';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStatus?: LeadStatus;
}

export function NewLeadModal({ isOpen, onClose, initialStatus }: NewLeadModalProps) {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [valorConta, setValorConta] = useState('');
  const [tipoImovel, setTipoImovel] = useState('Residencial');
  const [loading, setLoading] = useState(false);
  
  const addLead = useCrmStore((s) => s.addLead);
  const theme = useAuthStore((s) => s.theme);

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setNome('');
      setWhatsapp('');
      setValorConta('');
      setTipoImovel('Residencial');
      setLoading(false);
    }
  }, [isOpen]);

  const formatTelefone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !whatsapp || !valorConta) return;

    setLoading(true);
    
    // Pequeno delay para feedback visual
    await new Promise(r => setTimeout(r, 500));

    const valor = parseFloat(valorConta.replace(/\D/g, '')) / 100 || 0;
    const calc = calcularSistema(valor || 500);

    const phone = whatsapp.replace(/\D/g, '');

    addLead({
      nome: nome.trim(),
      whatsapp: phone,
      valorConta: valor || 500,
      tipoImovel,
      economiaProjetada: calc.economiaProjetada,
      sistemaIndicado: calc.sistemaKwp,
      payback: calc.payback,
    }, initialStatus);

    setLoading(false);
    onClose();
  };

  const formatCurrencyInput = (val: string) => {
    const digits = val.replace(/\D/g, '');
    const num = parseFloat(digits) / 100;
    if (isNaN(num)) return '';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300 ${
              theme === 'dark' ? 'bg-zinc-950 border border-white/10' : 'bg-white'
            }`}
          >
            {/* Header */}
            <div className={`px-8 pt-8 pb-6 transition-colors ${theme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-950'}`}>
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={16} weight="bold" className="text-white" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center">
                  <PlusCircle size={24} weight="fill" className="text-zinc-950" />
                </div>
                <div>
                  <h2 className="text-white font-black text-xl tracking-tight leading-none">Novo Cliente</h2>
                  <p className="text-zinc-400 text-xs mt-1">Adicionar manualmente ao CRM</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Nome Completo
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Maria Oliveira"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all outline-none font-medium ${
                      theme === 'dark' 
                        ? 'bg-white/5 border-white/5 text-white focus:border-[var(--color-accent)]' 
                        : 'bg-zinc-50 border-zinc-100 text-zinc-900 focus:border-zinc-950'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    WhatsApp
                  </label>
                  <div className="relative">
                    <WhatsappLogo size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(formatTelefone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all outline-none font-medium ${
                        theme === 'dark' 
                          ? 'bg-white/5 border-white/5 text-white focus:border-[var(--color-accent)]' 
                          : 'bg-zinc-50 border-zinc-100 text-zinc-900 focus:border-zinc-950'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Valor da Conta
                  </label>
                  <div className="relative">
                    <CurrencyDollar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={valorConta}
                      onChange={(e) => setValorConta(formatCurrencyInput(e.target.value))}
                      placeholder="R$ 0,00"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all outline-none font-medium ${
                        theme === 'dark' 
                          ? 'bg-white/5 border-white/5 text-white focus:border-[var(--color-accent)]' 
                          : 'bg-zinc-50 border-zinc-100 text-zinc-900 focus:border-zinc-950'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Tipo de Imóvel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Residencial', 'Comercial', 'Industrial', 'Rural'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipoImovel(t)}
                      className={`py-2.5 rounded-xl border-2 font-bold text-xs transition-all ${
                        tipoImovel === t
                          ? theme === 'dark'
                            ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-zinc-950'
                            : 'bg-zinc-950 border-zinc-950 text-white'
                          : theme === 'dark'
                            ? 'bg-white/5 border-white/5 text-zinc-400 hover:border-white/10'
                            : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:border-zinc-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`mt-2 p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
                theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-zinc-50 border-zinc-100'
              }`}>
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Check size={16} className="text-blue-500" />
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Ao salvar, o sistema calculará automaticamente o sistema ideal e a economia estimada com base no valor da conta informado.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !nome || !whatsapp || !valorConta}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                  loading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : theme === 'dark'
                      ? 'bg-[var(--color-accent)] text-zinc-950 hover:brightness-105 shadow-[var(--color-accent)]/20'
                      : 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-zinc-200'
                }`}
              >
                {loading ? 'Salvando...' : 'Salvar Cliente'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
