import { Link } from "react-router-dom";
import { SunDim, InstagramLogo, LinkedinLogo, TwitterLogo, EnvelopeSimple } from "@phosphor-icons/react";

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-2 mb-6" onClick={() => window.scrollTo(0, 0)}>
              <SunDim size={32} weight="fill" className="text-[var(--color-accent)]" />
              <span className="font-bold text-2xl tracking-tight text-white">
                Solar Energy
              </span>
            </Link>
            <p className="text-zinc-400 text-base max-w-sm mb-8 leading-relaxed">
              Transformando o poder do sol em economia real e impacto ambiental positivo para o futuro. Junte-se à revolução energética.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Instagram da Solar Energy" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-[var(--color-accent)] hover:text-zinc-950 transition-all duration-300">
                <InstagramLogo size={20} weight="fill" />
              </a>
              <a href="#" aria-label="LinkedIn da Solar Energy" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-[var(--color-accent)] hover:text-zinc-950 transition-all duration-300">
                <LinkedinLogo size={20} weight="fill" />
              </a>
              <a href="#" aria-label="Twitter da Solar Energy" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-[var(--color-accent)] hover:text-zinc-950 transition-all duration-300">
                <TwitterLogo size={20} weight="fill" />
              </a>
              <a href="mailto:contato@solarenergy.com.br" aria-label="Email da Solar Energy" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-[var(--color-accent)] hover:text-zinc-950 transition-all duration-300">
                <EnvelopeSimple size={20} weight="fill" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold tracking-wide uppercase text-sm mb-2">Links Rápidos</h4>
            <a href="/#solucoes" className="text-zinc-400 hover:text-[var(--color-accent)] transition-colors w-fit">Soluções</a>
            <a href="/#avaliacoes" className="text-zinc-400 hover:text-[var(--color-accent)] transition-colors w-fit">Avaliações</a>
            <a href="/#faq" className="text-zinc-400 hover:text-[var(--color-accent)] transition-colors w-fit">FAQ</a>
            <Link to="/blog" className="text-zinc-400 hover:text-[var(--color-accent)] transition-colors w-fit">Blog</Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold tracking-wide uppercase text-sm mb-2">Legal</h4>
            <a href="#" className="text-zinc-400 hover:text-white transition-colors w-fit">Termos de Uso</a>
            <a href="#" className="text-zinc-400 hover:text-white transition-colors w-fit">Política de Privacidade</a>
            <a href="#" className="text-zinc-400 hover:text-white transition-colors w-fit">Política de Cookies</a>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm font-medium text-center md:text-left">
            © {new Date().getFullYear()} Solar Energy. Todos os direitos reservados.
          </p>
          <div className="text-zinc-600 text-sm flex items-center gap-2">
            Feito com <span className="text-[var(--color-accent)]">♥</span> para um mundo sustentável
          </div>
        </div>
      </div>
    </footer>
  );
}
