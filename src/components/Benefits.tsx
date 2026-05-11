import { PiggyBank, HouseLine, ShieldCheck, CheckCircle } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export function Benefits() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <section id="solucoes" className="py-24 md:py-32 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-950 mb-6">
            Por que mudar para a <span className="text-[var(--color-accent)]">energia solar?</span>
          </h2>
          <p className="text-zinc-600 text-lg leading-relaxed">
            Muito mais do que economia. Um investimento inteligente que transforma o sol em liberdade financeira e segurança para o seu futuro.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-12"
        >
          {/* Bloco 1: Economia */}
          <motion.div variants={itemVariants} className="flex flex-col gap-6 p-8 rounded-3xl bg-zinc-50/50 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)] mb-2">
              <PiggyBank size={32} weight="duotone" />
            </div>
            <h3 className="text-xl font-bold text-zinc-950 tracking-tight uppercase">Economia que você vê todo mês</h3>
            
            <div className="text-zinc-600 leading-relaxed text-sm space-y-4">
              <p>
                Quanto você está pagando de luz? Se sua conta é de R$ 500/mês, você está gastando <strong>R$ 6.000 por ano</strong>. Em 10 anos? <strong>R$ 60.000</strong> (sem contar os reajustes). Com energia solar, esse dinheiro fica no seu bolso.
              </p>
              <div className="pt-2">
                <span className="font-semibold text-zinc-900 block mb-3">Como funciona:</span>
                <ul className="space-y-3">
                  {["Você instala as placas solares no seu telhado", "Elas captam a luz do sol e transformam em energia", "Essa energia abastece sua casa ou empresa", "Sua conta de luz cai até 95%", "O que você economiza, você pode investir em outras coisas"].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle size={20} weight="fill" className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Bloco 2: Valorização */}
          <motion.div variants={itemVariants} className="flex flex-col gap-6 p-8 rounded-3xl bg-zinc-50/50 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)] mb-2">
              <HouseLine size={32} weight="duotone" />
            </div>
            <h3 className="text-xl font-bold text-zinc-950 tracking-tight uppercase">Valorização do seu imóvel</h3>
            
            <div className="text-zinc-600 leading-relaxed text-sm space-y-4">
              <p>Imóveis com energia solar instalada ganham grande destaque:</p>
              <div className="pt-2">
                <ul className="space-y-3">
                  {["Valem até 10% mais no mercado", "São mais atrativos para compradores e locatários", "Têm um grande diferencial competitivo", "Demonstram modernização e sustentabilidade"].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle size={20} weight="fill" className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="pt-2 font-medium text-zinc-800 italic">
                É como fazer uma reforma que se paga e ainda continua gerando retorno.
              </p>
            </div>
          </motion.div>

          {/* Bloco 3: Proteção */}
          <motion.div variants={itemVariants} className="flex flex-col gap-6 p-8 rounded-3xl bg-zinc-50/50 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)] mb-2">
              <ShieldCheck size={32} weight="duotone" />
            </div>
            <h3 className="text-xl font-bold text-zinc-950 tracking-tight uppercase">Proteção contra aumentos</h3>
            
            <div className="text-zinc-600 leading-relaxed text-sm space-y-4">
              <p>
                Nos últimos 10 anos, a energia elétrica teve reajustes constantes acima da inflação. Com energia solar, você:
              </p>
              <div className="pt-2">
                <ul className="space-y-3">
                  {["Trava seu custo de energia", "Não sofre com bandeiras tarifárias (vermelha, amarela)", "Fica independente dos aumentos da distribuidora", "Ganha previsibilidade financeira e paz de espírito"].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle size={20} weight="fill" className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
