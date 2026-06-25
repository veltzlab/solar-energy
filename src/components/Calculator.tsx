import { useState } from 'react';
import { motion } from 'framer-motion';
import { CurrencyDollar, Lightning, ShieldCheck, Tree, Lock } from '@phosphor-icons/react';
import { openCalculator } from '../lib/openCalculator';
import { calcularSistema } from '../utils/solarCalculations';

export function Calculator() {
  const [bill, setBill] = useState<number>(300);

  // Mesma fórmula usada em "Simular Economia", para manter os números consistentes
  // entre os dois blocos e permitir o envio do lead pro CRM com os mesmos parâmetros
  const resultado = calcularSistema(bill);
  const savingsYear = resultado.economiaAnual;
  const savings20Years = savingsYear * 20;
  const treesSaved = Math.max(1, Math.floor(savingsYear / 150)); // estimativa ambiental

  return (
    <section id="calculadora" className="py-24 px-4 md:px-8 bg-zinc-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-zinc-950 mb-6 leading-tight">
            Descubra o quanto você vai economizar.
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed max-w-[50ch]">
            Utilize nossa calculadora interativa para simular o retorno financeiro e o impacto ambiental da sua transição para energia solar.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Input Panel */}
          <motion.div 
            layout
            className="xl:col-span-5 bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)]"
          >
            <div className="flex flex-col gap-10 h-full justify-center">
              <div>
                <label className="block text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">
                  Sua conta de luz mensal
                </label>
                <div className="flex items-end gap-2 mb-8">
                  <span className="text-3xl font-medium text-zinc-400 mb-2">R$</span>
                  <input 
                    type="number" 
                    value={bill}
                    onChange={(e) => setBill(Number(e.target.value))}
                    className="text-6xl md:text-7xl font-bold tracking-tighter text-zinc-950 bg-transparent outline-none w-full border-b-2 border-zinc-100 focus:border-[var(--color-accent)] transition-colors pb-2 font-mono"
                  />
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="3000" 
                  step="50"
                  value={bill}
                  onChange={(e) => setBill(Number(e.target.value))}
                  className="w-full accent-[var(--color-accent)] h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300">
                <ShieldCheck size={32} className="text-[var(--color-accent-dark)] flex-shrink-0" weight="fill" />
                <div>
                  <h4 className="font-semibold text-zinc-900 mb-1">Proteção contra inflação</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">Com energia solar, você congela a tarifa e se livra dos aumentos anuais das concessionárias.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results Bento Grid */}
          <div className="xl:col-span-7 relative">
            <div
              aria-hidden="true"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 blur-md select-none pointer-events-none"
            >
              <motion.div
                layout
                className="bg-zinc-950 p-8 md:p-10 rounded-[2.5rem] flex flex-col justify-between overflow-hidden relative shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]"
              >
                <div className="relative z-10">
                  <CurrencyDollar size={32} className="text-[var(--color-accent)] mb-8" weight="duotone" />
                  <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest mb-3">Economia em 1 Ano</p>
                  <div className="text-5xl md:text-6xl font-bold text-white tracking-tighter font-mono">
                    R$ {savingsYear.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>
              </motion.div>

              <motion.div
                layout
                className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-zinc-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] flex flex-col justify-between"
              >
                <Lightning size={32} className="text-[var(--color-accent-dark)] mb-8" weight="duotone" />
                <div>
                  <p className="text-zinc-500 text-sm font-semibold uppercase tracking-widest mb-3">Economia em 20 Anos</p>
                  <div className="text-5xl md:text-6xl font-bold text-zinc-950 tracking-tighter font-mono">
                    R$ {savings20Years.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>
              </motion.div>

              <motion.div
                layout
                className="md:col-span-2 bg-[var(--color-accent)] p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(234,179,8,0.25)] flex flex-col md:flex-row items-start md:items-center justify-between gap-10"
              >
                <div>
                  <Tree size={40} className="text-zinc-900 mb-6" weight="fill" />
                  <p className="text-zinc-900/70 text-sm font-bold uppercase tracking-widest mb-3">Impacto Ambiental</p>
                  <div className="text-6xl md:text-7xl font-bold text-zinc-950 tracking-tighter font-mono">
                    {treesSaved} Árvores
                  </div>
                  <p className="text-zinc-900/80 mt-3 font-medium">Equivalente plantado por ano</p>
                </div>
              </motion.div>
            </div>

            {/* Overlay de bloqueio — libera os valores só após o contato */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-white/90 backdrop-blur-sm border border-zinc-200/70 rounded-[2.5rem] shadow-xl px-8 py-10 max-w-sm w-full flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-zinc-950 flex items-center justify-center shadow-lg">
                  <Lock size={24} weight="fill" className="text-[var(--color-accent)]" />
                </div>
                <div>
                  <p className="font-bold text-zinc-950 text-lg">Sua simulação está pronta!</p>
                  <p className="text-zinc-500 text-sm mt-1">Veja agora quanto você pode economizar e o impacto ambiental do seu sistema solar.</p>
                </div>
                <button
                  onClick={() => openCalculator(bill)}
                  className="w-full px-8 py-4 bg-zinc-950 text-white rounded-full font-semibold hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                >
                  Ver minha economia
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
