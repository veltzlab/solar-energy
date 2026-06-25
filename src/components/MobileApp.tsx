import { motion } from "framer-motion";
import {
  DeviceMobile, ChartLine, Bell, Lightning, CheckCircle,
  AppStoreLogo, GooglePlayLogo, WifiHigh,
} from "@phosphor-icons/react";

const FEATURES = [
  {
    icon: <Lightning size={22} weight="fill" />,
    title: "Geração em tempo real",
    desc: "Veja quanto sua usina está gerando agora mesmo, direto da tela do celular.",
  },
  {
    icon: <ChartLine size={22} weight="fill" />,
    title: "Histórico de economia",
    desc: "Gráficos mensais e anuais mostrando exatamente quanto você já economizou.",
  },
  {
    icon: <Bell size={22} weight="fill" />,
    title: "Alertas automáticos",
    desc: "Receba um aviso no celular se algum painel ou inversor precisar de atenção.",
  },
];

export function MobileApp() {
  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden" id="app">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[var(--color-accent)] opacity-[0.06] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Texto */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6">
            <DeviceMobile size={18} weight="fill" className="text-[var(--color-accent)]" />
            <span className="text-white text-sm font-bold">App Solar Energy</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
            Acompanhe seu sistema <span className="text-[var(--color-accent)]">direto do celular</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-lg">
            Depois da instalação, você passa a monitorar sua geração de energia, sua economia e a saúde do seu sistema em tempo real, onde quer que esteja.
          </p>

          <div className="space-y-6 mb-10">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)] shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold text-base mb-1">{f.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-2.5 bg-white text-zinc-950 px-5 py-3 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-colors"
            >
              <AppStoreLogo size={22} weight="fill" />
              App Store
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-2.5 bg-white text-zinc-950 px-5 py-3 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-colors"
            >
              <GooglePlayLogo size={22} weight="fill" />
              Google Play
            </a>
          </div>
        </div>

        {/* Mockup do app */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center lg:justify-end"
        >
          <div className="w-[280px] rounded-[2.5rem] border-[10px] border-zinc-800 bg-zinc-900 shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-zinc-800 rounded-b-2xl z-10" />

            {/* Tela do app */}
            <div className="bg-gradient-to-b from-zinc-950 to-zinc-900 px-5 pt-10 pb-8 min-h-[560px]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Minha usina</p>
                  <p className="text-white font-bold text-sm">Residência Andrade</p>
                </div>
                <div className="flex items-center gap-1 bg-green-500/15 px-2.5 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-[10px] font-bold">Online</span>
                </div>
              </div>

              {/* Card de geração */}
              <div className="bg-[var(--color-accent)] rounded-3xl p-5 mb-4 relative overflow-hidden">
                <WifiHigh size={80} weight="fill" className="absolute -right-4 -top-4 text-zinc-950/10" />
                <p className="text-zinc-900/70 text-[10px] font-bold uppercase tracking-widest mb-1">Gerando agora</p>
                <p className="text-zinc-950 font-black text-3xl tracking-tight">4,82 <span className="text-base font-bold">kWh</span></p>
                <p className="text-zinc-900/70 text-xs font-semibold mt-1">↑ 12% acima da média de hoje</p>
              </div>

              {/* Mini gráfico */}
              <div className="bg-white/5 rounded-2xl p-4 mb-4">
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-3">Geração nas últimas horas</p>
                <div className="flex items-end gap-1.5 h-16">
                  {[30, 45, 60, 80, 95, 100, 90, 70, 50, 35, 20, 10].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm bg-[var(--color-accent)]" style={{ height: `${h}%`, opacity: 0.4 + (h / 100) * 0.6 }} />
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Este mês</p>
                  <p className="text-white font-black text-lg">R$ 612</p>
                  <p className="text-green-400 text-[10px] font-bold">economizados</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Sistema</p>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle size={16} weight="fill" className="text-green-400" />
                    <p className="text-white font-bold text-sm">Tudo certo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
