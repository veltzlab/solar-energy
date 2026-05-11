import { motion } from "framer-motion";
import { Lightning, ChatCircle } from "@phosphor-icons/react";

interface HeroProps {
  onOpenCalculator: () => void;
}

export function Hero({ onOpenCalculator }: HeroProps) {
  return (
    <section className="relative h-[100dvh] w-full overflow-hidden flex items-center justify-center bg-black">
      
      {/* Background Video - Autoplay sem Loop */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <video
          src="/bg1.mp4"
          autoPlay
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover object-center"
          aria-hidden="true"
        />
      </div>

      {/* Overlay Escuro Fixo para Legibilidade */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-10" />

      {/* Text Content - Centralizado e Animado na Entrada */}
      <div className="absolute inset-0 flex items-center justify-center w-full px-6 z-20">
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center gap-8 w-full max-w-6xl px-4"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
            <span className="text-sm font-semibold text-white tracking-tight drop-shadow-sm">Energia limpa e acessível</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-extrabold tracking-tighter text-white leading-[1.05] drop-shadow-xl w-full">
            Sua conta de luz pode <br/> cair <span className="text-[var(--color-accent)] drop-shadow-md">até 95%</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-100 max-w-[60ch] leading-relaxed font-normal mx-auto drop-shadow-md">
            Transforme energia solar em economia real. <br className="hidden md:block" /> 
            Simulação grátis em 2 minutos.
          </p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <button
              onClick={onOpenCalculator}
              className="group relative px-8 py-4 rounded-full bg-[var(--color-accent)] text-zinc-950 overflow-hidden shadow-[0_0_40px_rgba(232,178,8,0.3)] hover:shadow-[0_0_60px_rgba(232,178,8,0.5)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <div className="flex items-center gap-2">
                <Lightning size={24} weight="fill" className="relative z-10" />
                <span className="relative font-bold tracking-wide">Calcular Minha Economia</span>
              </div>
            </button>
            
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%21+Gostaria+de+falar+com+um+especialista+sobre+energia+solar."
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-4 rounded-full border border-white/30 text-white overflow-hidden hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
            >
              <div className="flex items-center gap-2">
                <ChatCircle size={22} weight="regular" />
                <span className="relative font-semibold tracking-wide">Falar com especialista</span>
              </div>
            </a>
          </motion.div>
        </motion.div>
      </div>

    </section>
  );
}
