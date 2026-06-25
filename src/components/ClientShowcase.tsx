import { useState } from "react";
import { Play, MapPin, Lightning, CurrencyDollar } from "@phosphor-icons/react";

interface ClientProject {
  id: number;
  nome: string;
  cidade: string;
  sistemaKwp: number;
  economiaMensal: number;
  videoPoster: string;
  videoSrc: string;
}

// Projetos fictícios — substituir por vídeos reais de clientes conforme forem gravados
const PROJETOS: ClientProject[] = [
  {
    id: 1,
    nome: "Família Andrade",
    cidade: "Ribeirão Preto, SP",
    sistemaKwp: 6.6,
    economiaMensal: 480,
    videoPoster: "https://images.unsplash.com/photo-1592833167665-ddfb27c2b9e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: 2,
    nome: "Comércio Silva & Filhos",
    cidade: "Uberlândia, MG",
    sistemaKwp: 12.4,
    economiaMensal: 1150,
    videoPoster: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: 3,
    nome: "Sítio Boa Vista",
    cidade: "Sorocaba, SP",
    sistemaKwp: 9.2,
    economiaMensal: 720,
    videoPoster: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
];

function formatCurrency(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function ProjectVideoCard({ projeto }: { projeto: ClientProject }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="aspect-video relative bg-zinc-900">
      <video
        controls
        preload="none"
        poster={projeto.videoPoster}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-cover"
      >
        <source src={projeto.videoSrc} type="video/mp4" />
      </video>
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Play size={22} weight="fill" className="text-zinc-950" />
          </div>
        </div>
      )}
    </div>
  );
}

export function ClientShowcase() {
  return (
    <section className="py-24 bg-white relative overflow-hidden" id="clientes">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-950 mb-4">
            Clientes que já estão economizando com a{" "}
            <span className="text-[var(--color-accent)]">Solar Energy</span>
          </h2>
          <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
            Conheça, em vídeo, projetos reais que já estão em operação e gerando economia todos os meses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PROJETOS.map((projeto) => (
            <div
              key={projeto.id}
              className="group bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2"
            >
              <ProjectVideoCard projeto={projeto} />

              <div className="p-6">
                <h3 className="font-bold text-lg text-zinc-900 mb-1">{projeto.nome}</h3>
                <div className="flex items-center gap-1.5 text-zinc-500 text-sm mb-4">
                  <MapPin size={14} weight="fill" className="text-[var(--color-accent)]" />
                  {projeto.cidade}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-1.5">
                    <Lightning size={16} weight="fill" className="text-[var(--color-accent-dark)]" />
                    <span className="text-sm font-semibold text-zinc-700">{projeto.sistemaKwp} kWp</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CurrencyDollar size={16} weight="fill" className="text-green-500" />
                    <span className="text-sm font-semibold text-zinc-700">
                      {formatCurrency(projeto.economiaMensal)}/mês
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
