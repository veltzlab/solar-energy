import { useRef } from "react";
import { Calculator, FileText, Wrench, ChartLineUp, MapPinLine, Drone } from "@phosphor-icons/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function HowItWorks() {
  const containerRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      title: "Faça a simulação online",
      icon: <Calculator size={32} weight="duotone" />,
    },
    {
      title: "Visita técnica no seu imóvel",
      icon: <MapPinLine size={32} weight="duotone" />,
    },
    {
      title: "Projeto digital 3D feito com Drone",
      icon: <Drone size={32} weight="duotone" />,
    },
    {
      title: "Receba a proposta personalizada",
      icon: <FileText size={32} weight="duotone" />,
    },
    {
      title: "Instalação rápida",
      icon: <Wrench size={32} weight="duotone" />,
    },
    {
      title: "Comece a economizar",
      icon: <ChartLineUp size={32} weight="duotone" />,
    }
  ];

  useGSAP(() => {
    const container = scrollRef.current;
    
    if (!container) return;

    // Cálculo exato de quanto a barra precisa rolar para a esquerda
    const getScrollAmount = () => {
      let totalWidth = container.scrollWidth;
      // Adicionamos +250px (ou um cálculo extra) para garantir que a esteira seja puxada até o limite absoluto
      return -(totalWidth - window.innerWidth + 250);
    };

    const tween = gsap.to(container, {
      x: getScrollAmount,
      ease: "none"
    });

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: () => `+=${getScrollAmount() * -1}`,
      pin: true,
      animation: tween,
      scrub: 1,
      invalidateOnRefresh: true,
      // Markers apenas para debug local se precisar: markers: true
    });

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="h-[100dvh] bg-zinc-50 border-t border-zinc-100 overflow-hidden flex flex-col justify-center relative"
    >
      <div className="absolute top-16 md:top-24 left-0 w-full px-6 md:px-12 z-20 pointer-events-none">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-950 mb-4">
            Como Funciona
          </h2>
          <p className="text-zinc-600 text-lg max-w-xl">
            Acompanhe o caminho simples e tecnológico até a sua independência energética. Role para o lado e descubra.
          </p>
        </div>
      </div>

      {/* Esteira Horizontal */}
      <div 
        ref={scrollRef} 
        className="flex gap-6 md:gap-10 w-[fit-content] items-center pt-24 mt-10 md:mt-0 pl-[max(1.5rem,calc((100vw-80rem)/2))] pr-[max(1.5rem,calc((100vw-80rem)/2))] md:pl-[max(3rem,calc((100vw-80rem)/2))] md:pr-[max(3rem,calc((100vw-80rem)/2))]"
      >
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <div 
              key={index} 
              className={`w-[300px] md:w-[340px] h-[380px] shrink-0 flex flex-col items-start text-left rounded-[2.5rem] p-10 relative overflow-hidden group transition-all duration-500 hover:-translate-y-3 ${
                isLast 
                  ? "bg-[var(--color-accent)] shadow-[0_20px_60px_rgba(232,178,8,0.3)]" 
                  : "bg-white shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-white"
              }`}
            >
              {/* Watermark Number */}
              <div className={`absolute -right-4 -top-8 text-[180px] font-black leading-none pointer-events-none select-none transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3 ${
                isLast ? "text-zinc-950/5" : "text-zinc-100"
              }`}>
                {index + 1}
              </div>

              {/* Icon Container */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-110 ${
                isLast 
                  ? "bg-zinc-950 text-[var(--color-accent)] shadow-xl" 
                  : "bg-zinc-50 text-[var(--color-accent)] border border-zinc-100 shadow-sm"
              }`}>
                {step.icon}
              </div>
              
              {/* Content (Pushed to bottom) */}
              <div className="relative z-10 mt-auto">
                <div className={`text-xs font-bold tracking-widest uppercase mb-3 ${
                  isLast ? "text-zinc-950/60" : "text-zinc-400"
                }`}>
                  Passo 0{index + 1}
                </div>
                <h3 className={`text-2xl font-black leading-tight tracking-tight ${
                  isLast ? "text-zinc-950" : "text-zinc-900"
                }`}>
                  {step.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
