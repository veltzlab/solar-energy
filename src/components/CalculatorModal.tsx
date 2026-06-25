import { useState, useEffect } from 'react';
import { X, ArrowLeft, Lightning, CheckCircle, WhatsappLogo, User, CurrencyDollar } from '@phosphor-icons/react';
import { useCrmStore } from '../store/useCrmStore';
import { motion, AnimatePresence } from 'framer-motion';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValorConta?: number;
}

type Step = 1 | 2 | 3;

import { calcularSistema } from '../utils/solarCalculations';

export function CalculatorModal({ isOpen, onClose, initialValorConta }: CalculatorModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [valorConta, setValorConta] = useState(500);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const addLead = useCrmStore((s) => s.addLead);

  // Fecha com Esc
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Ao abrir já com um valor de conta definido (ex: calculadora "Descubra o quanto você vai economizar"),
  // usa esse valor e vai direto para a etapa de contato
  useEffect(() => {
    if (isOpen && initialValorConta) {
      setValorConta(initialValorConta);
      setStep(2);
    }
  }, [isOpen, initialValorConta]);

  // Reseta ao fechar
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setNome('');
        setTelefone('');
      }, 300);
    }
  }, [isOpen]);

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  const formatTelefone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const resultado = calcularSistema(valorConta);
  const canSubmit = nome.trim().length >= 2 && telefone.replace(/\D/g, '').length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const whatsappDigits = telefone.replace(/\D/g, '');
    try {
      await addLead({
        nome: nome.trim(),
        whatsapp: whatsappDigits,
        valorConta,
        tipoImovel: 'Residencial',
        economiaProjetada: resultado.economiaProjetada,
        sistemaIndicado: resultado.sistemaKwp,
        payback: resultado.payback,
      });
    } catch {
      // Falha ao salvar no banco — não bloqueia o usuário
    }
    setStep(3);
  };

  const totalSteps = 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-zinc-950 px-8 pt-8 pb-6 relative">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={18} weight="bold" className="text-white" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                  <Lightning size={20} weight="fill" className="text-zinc-950" />
                </div>
                <div>
                  <p className="text-zinc-400 text-xs font-semibold tracking-widest uppercase">Simulação Solar</p>
                  <h2 className="text-white font-black text-lg tracking-tight leading-none">
                    {step === 3 ? 'Resultado da sua simulação' : 'Calcule sua economia agora'}
                  </h2>
                </div>
              </div>

              {/* Barra de progresso */}
              {step < 3 && (
                <div className="flex gap-1.5">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full flex-1 transition-all duration-500 ${
                        i + 1 <= step ? 'bg-[var(--color-accent)]' : 'bg-white/15'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Corpo */}
            <div className="px-8 py-8">
              <AnimatePresence mode="wait">

                {/* Passo 1: Valor da conta */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/15 flex items-center justify-center">
                        <CurrencyDollar size={22} className="text-[var(--color-accent)]" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Passo 01 de 02</p>
                        <h3 className="font-bold text-zinc-900 text-lg">Quanto você paga de luz?</h3>
                      </div>
                    </div>

                    <div className="bg-zinc-50 rounded-2xl p-6 mb-6 text-center">
                      <span className="text-5xl font-black text-zinc-950 tracking-tight">
                        {formatCurrency(valorConta)}
                      </span>
                      <p className="text-zinc-400 text-sm mt-1">por mês (média)</p>
                    </div>

                    <input
                      type="range"
                      min={100}
                      max={5000}
                      step={50}
                      value={valorConta}
                      onChange={(e) => setValorConta(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[var(--color-accent)] bg-zinc-200"
                    />
                    <div className="flex justify-between text-xs text-zinc-400 mt-2">
                      <span>R$ 100</span>
                      <span>R$ 5.000</span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[200, 500, 1000, 1500, 2000, 3000].map((v) => (
                        <button
                          key={v}
                          onClick={() => setValorConta(v)}
                          className={`py-2 px-3 rounded-xl text-sm font-semibold border transition-all ${
                            valorConta === v
                              ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-zinc-950'
                              : 'border-zinc-200 text-zinc-600 hover:border-[var(--color-accent)]'
                          }`}
                        >
                          {formatCurrency(v)}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Passo 2: Dados de contato */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/15 flex items-center justify-center">
                        <User size={22} className="text-[var(--color-accent)]" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Passo 02 de 02</p>
                        <h3 className="font-bold text-zinc-900 text-lg">Para quem enviamos a simulação?</h3>
                      </div>
                    </div>

                    {/* Preview da economia estimada */}
                    <div className="bg-[var(--color-accent)]/8 border border-[var(--color-accent)]/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Sua economia estimada</p>
                        <p className="text-2xl font-black text-zinc-950">{formatCurrency(resultado.economiaProjetada)}<span className="text-sm font-semibold text-zinc-500">/mês</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Em 25 anos</p>
                        <p className="text-lg font-black text-[var(--color-accent)]">{formatCurrency(resultado.economia25anos)}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Seu nome completo</label>
                        <input
                          type="text"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          placeholder="Ex: João Silva"
                          autoFocus
                          className="w-full border-2 border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 font-medium placeholder:text-zinc-400 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Telefone / WhatsApp</label>
                        <div className="relative">
                          <WhatsappLogo size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input
                            type="tel"
                            value={telefone}
                            onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                            placeholder="(11) 99999-9999"
                            className="w-full border-2 border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-zinc-900 font-medium placeholder:text-zinc-400 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 mt-4 leading-relaxed">
                      🔒 Seus dados são protegidos. Usados apenas para enviar sua simulação personalizada.
                    </p>
                  </motion.div>
                )}

                {/* Passo 3: Resultado */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle size={32} weight="fill" className="text-green-500" />
                      </div>
                      <h3 className="font-black text-2xl text-zinc-950">
                        {nome.split(' ')[0]}, olha que incrível!
                      </h3>
                      <p className="text-zinc-500 text-sm mt-1">Aqui está o resumo da sua simulação</p>
                    </div>

                    <div className="bg-zinc-950 rounded-2xl p-6 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Economia Mensal</p>
                          <p className="text-[var(--color-accent)] font-black text-2xl">
                            {formatCurrency(resultado.economiaProjetada)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Economia Anual</p>
                          <p className="text-[var(--color-accent)] font-black text-2xl">
                            {formatCurrency(resultado.economiaAnual)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Sistema Indicado</p>
                          <p className="text-white font-black text-2xl">
                            {resultado.sistemaKwp} kWh
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Retorno em</p>
                          <p className="text-white font-black text-2xl">
                            {resultado.payback} anos
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10 text-center">
                        <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Economia em 25 anos</p>
                        <p className="text-[var(--color-accent)] font-black text-3xl">
                          {formatCurrency(resultado.economia25anos)}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/5500000000000?text=${encodeURIComponent(`Olá! Fiz a simulação no site e gostaria de receber minha proposta personalizada. Meu nome é ${nome}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg transition-colors"
                    >
                      <WhatsappLogo size={24} weight="fill" />
                      Receber proposta pelo WhatsApp
                    </a>

                    <p className="text-center text-zinc-400 text-xs mt-3">
                      Um especialista entrará em contato em breve 🙂
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer de navegação */}
            {step < 3 && (
              <div className="px-8 pb-8 flex items-center justify-between gap-4 flex-wrap">
                {step > 1 ? (
                  <button
                    onClick={() => setStep((s) => (s - 1) as Step)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-semibold hover:border-zinc-300 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Voltar
                  </button>
                ) : (
                  <div />
                )}

                {step === 1 && (
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-950 text-white font-bold hover:bg-zinc-800 transition-colors ml-auto"
                  >
                    Continuar
                    <Lightning size={16} weight="fill" />
                  </button>
                )}

                {step === 2 && (
                  <button
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-accent)] text-zinc-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 transition-all ml-auto shadow-lg"
                  >
                    <Lightning size={18} weight="fill" />
                    Ver minha simulação
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
