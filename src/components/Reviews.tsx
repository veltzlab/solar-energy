import { Star, GoogleLogo, ArrowRight } from "@phosphor-icons/react";
import { openCalculator } from "../lib/openCalculator";

export function Reviews() {
  const reviews = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Avaliação Google 1"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Avaliação Google 2"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Avaliação Google 3"
    }
  ];

  return (
    <section className="py-24 bg-zinc-50 relative overflow-hidden" id="avaliacoes">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm mb-6">
            <GoogleLogo size={20} weight="bold" className="text-blue-500" />
            <span className="font-bold text-zinc-900">Avaliações 5 Estrelas no Google</span>
            <div className="flex gap-1 text-[var(--color-accent)] ml-2">
              <Star size={16} weight="fill" />
              <Star size={16} weight="fill" />
              <Star size={16} weight="fill" />
              <Star size={16} weight="fill" />
              <Star size={16} weight="fill" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-950 mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
            Não acredite apenas na nossa palavra. Veja os resultados reais de quem já transformou sua conta de luz com a nossa tecnologia.
          </p>
        </div>

        {/* Grid de Prints das Avaliações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-white rounded-3xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 border border-zinc-100"
            >
              {/* Onde os prints reais vão entrar, por enquanto usando placeholder genérico */}
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 relative">
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-zinc-400 z-10 p-6 text-center bg-zinc-50/90 backdrop-blur-sm">
                  <GoogleLogo size={48} weight="duotone" />
                  <p className="text-sm font-medium">Substitua esta imagem pelo print da avaliação do Google</p>
                </div>
                <img
                  src={review.image}
                  alt={review.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover grayscale opacity-20"
                />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-zinc-950 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-accent)] opacity-10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-accent)] opacity-10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
          
          <h3 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10">
            Junte-se aos nossos clientes satisfeitos
          </h3>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10 relative z-10">
            Faça uma simulação gratuita agora mesmo e descubra o quanto você pode economizar na sua conta de energia pelos próximos 25 anos.
          </p>
          
          <button 
            onClick={() => openCalculator()}
            className="group relative inline-flex items-center justify-center gap-3 bg-[var(--color-accent)] text-zinc-950 font-bold text-lg md:text-xl rounded-full px-10 py-5 transition-all duration-300 hover:scale-105 hover:bg-[var(--color-accent-light)] shadow-[0_10px_40px_rgba(232,178,8,0.3)] z-10"
          >
            Fazer Simulação Gratuita
            <ArrowRight size={24} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </section>
  );
}
