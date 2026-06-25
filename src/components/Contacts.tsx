import { useState } from "react";
import { MapPin, Phone, EnvelopeSimple, WhatsappLogo, CheckCircle } from "@phosphor-icons/react";
import { useCrmStore } from "../store/useCrmStore";
import { useFormValidation } from "../lib/useFormValidation";

export function Contacts() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const addLead = useCrmStore(state => state.addLead);
  const addNote = useCrmStore(state => state.addNote);

  const { validate, markTouched, getFieldError } = useFormValidation({
    name: { required: "Nome é obrigatório", minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" } },
    email: { email: "Email inválido" },
    phone: { required: "Telefone é obrigatório", phone: "Telefone deve ter pelo menos 10 dígitos" },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = { name, email, phone };
    markTouched('name');
    markTouched('email');
    markTouched('phone');
    if (!validate(values)) return;

    try {
      const leadId = await addLead({
        nome: name,
        whatsapp: phone,
        valorConta: 0,
        tipoImovel: "Contato Site",
        economiaProjetada: 0,
        sistemaIndicado: 0,
        payback: 0
      });

      await addNote(leadId, `Email: ${email}\n\nMensagem: ${message}`);

      setIsSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");

      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch {
      alert('Erro ao enviar sua mensagem. Verifique sua conexão e tente novamente.');
    }
  };

  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden" id="contato">
      {/* Background Decorative elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--color-accent)] opacity-[0.03] blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--color-accent)] opacity-[0.02] blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6">
              Pronto para transformar sua energia?
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-lg">
              Entre em contato com a nossa equipe de especialistas. Estamos prontos para tirar todas as suas dúvidas e desenvolver o melhor projeto para o seu imóvel.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4 group">
                <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-accent)] group-hover:border-[var(--color-accent)] group-hover:text-zinc-950 transition-colors text-[var(--color-accent)]">
                  <Phone size={28} weight="duotone" />
                </div>
                <div>
                  <h4 className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">Telefone / WhatsApp</h4>
                  <p className="text-white text-xl font-medium">(11) 99999-9999</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-accent)] group-hover:border-[var(--color-accent)] group-hover:text-zinc-950 transition-colors text-[var(--color-accent)]">
                  <EnvelopeSimple size={28} weight="duotone" />
                </div>
                <div>
                  <h4 className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">Email</h4>
                  <p className="text-white text-xl font-medium">contato@solarenergy.com.br</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-accent)] group-hover:border-[var(--color-accent)] group-hover:text-zinc-950 transition-colors text-[var(--color-accent)]">
                  <MapPin size={28} weight="duotone" />
                </div>
                <div>
                  <h4 className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">Endereço</h4>
                  <p className="text-white text-xl font-medium max-w-xs leading-relaxed">
                    Av. Paulista, 1000 - Bela Vista<br />São Paulo - SP, 01310-100
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-12 backdrop-blur-sm relative overflow-hidden">
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animation-fade-in">
                <div className="w-20 h-20 bg-[var(--color-accent)]/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={48} weight="fill" className="text-[var(--color-accent)]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Mensagem Enviada!</h3>
                <p className="text-zinc-400">Em breve nossa equipe entrará em contato com você.</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-white mb-6">Fale Conosco</h3>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="name" className="block text-zinc-400 text-sm font-medium mb-2">Nome Completo</label>
                    <input 
                      type="text" 
                      id="name" 
                      required
                      value={name}
                      onChange={(e) => { setName(e.target.value); markTouched('name'); }}
                      onBlur={() => markTouched('name')}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
                      placeholder="Seu nome"
                    />
                    {getFieldError('name') && <p className="text-red-400 text-xs mt-1">{getFieldError('name')}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-zinc-400 text-sm font-medium mb-2">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); markTouched('email'); }}
                        onBlur={() => markTouched('email')}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
                        placeholder="seu@email.com"
                      />
                      {getFieldError('email') && <p className="text-red-400 text-xs mt-1">{getFieldError('email')}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-zinc-400 text-sm font-medium mb-2">Telefone</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        required
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); markTouched('phone'); }}
                        onBlur={() => markTouched('phone')}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
                        placeholder="(00) 00000-0000"
                      />
                      {getFieldError('phone') && <p className="text-red-400 text-xs mt-1">{getFieldError('phone')}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-zinc-400 text-sm font-medium mb-2">Mensagem</label>
                    <textarea 
                      id="message" 
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all resize-none"
                      placeholder="Como podemos ajudar?"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-[var(--color-accent)] text-zinc-950 font-bold text-lg rounded-xl px-8 py-5 mt-4 hover:bg-[var(--color-accent-light)] transition-colors flex items-center justify-center gap-2"
                  >
                    <WhatsappLogo size={24} weight="fill" />
                    Enviar Mensagem
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
