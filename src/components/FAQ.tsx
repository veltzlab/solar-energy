import { useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";

const faqs = [
  {
    question: "Quanto tempo dura um sistema de energia solar?",
    answer: "Os painéis solares têm uma vida útil média de 25 a 30 anos com alta eficiência, e a manutenção necessária é mínima, envolvendo basicamente a limpeza das placas.",
  },
  {
    question: "Como funciona a economia na conta de luz?",
    answer: "O sistema gera energia durante o dia. A energia que você não consome é injetada na rede da distribuidora, gerando créditos que abatem o seu consumo à noite ou em dias nublados, podendo reduzir sua conta em até 95%.",
  },
  {
    question: "O sistema funciona em dias de chuva ou nublados?",
    answer: "Sim! A geração de energia solar depende da luminosidade e não necessariamente do sol direto. Em dias nublados ou chuvosos a geração é menor, mas o sistema continua funcionando e produzindo energia.",
  },
  {
    question: "Qual é o tempo de retorno do investimento (Payback)?",
    answer: "O retorno do investimento costuma ocorrer entre 3 e 5 anos, dependendo do tamanho do sistema e do seu consumo mensal. A partir daí, é lucro e economia pelos próximos 20+ anos.",
  },
  {
    question: "O que acontece se acabar a energia da rua?",
    answer: "Sistemas On-Grid (conectados à rede) desligam automaticamente por segurança quando há queda de energia, para evitar choques em técnicos que estejam consertando a rede. Para ter energia durante quedas, é necessário um sistema híbrido ou Off-Grid com baterias.",
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="faq">
      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-950 mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
            Tire suas dúvidas sobre energia solar e entenda como é simples começar a economizar.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className={`border border-zinc-200 rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? "bg-zinc-50 shadow-md border-zinc-300" : "bg-white hover:border-zinc-300"
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 rounded-2xl"
                >
                  <span className="font-bold text-lg text-zinc-900">{faq.question}</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? "bg-[var(--color-accent)] text-zinc-950" : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {isOpen ? <CaretUp size={20} weight="bold" /> : <CaretDown size={20} weight="bold" />}
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-6 pt-0 text-zinc-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
