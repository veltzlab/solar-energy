import { useState, useEffect } from "react";
import { SunDim, List, X } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";

interface NavbarProps {
  onOpenCalculator: () => void;
}

const NAV_LINKS = [
  { label: "Soluções", anchor: "#solucoes" },
  { label: "Avaliações", anchor: "#avaliacoes" },
  { label: "FAQ", anchor: "#faq" },
  { label: "Contato", anchor: "#contato" },
];

export function Navbar({ onOpenCalculator }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === "/";
  const shouldStyleDark = !isHome || scrolled;

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight - 80);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Fecha menu ao mudar de rota
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Bloqueia scroll do body quando menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const getHref = (anchor: string) => isHome ? anchor : `/${anchor}`;

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 px-4 md:px-6 transition-all duration-500 ${shouldStyleDark ? "py-4" : "py-6"}`}>
        <div className={`max-w-7xl mx-auto flex items-center justify-between rounded-full px-4 md:px-6 py-3 transition-all duration-500 ${
          shouldStyleDark
            ? "bg-white/90 backdrop-blur-xl border border-zinc-200 shadow-sm"
            : "bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl"
        }`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <SunDim size={32} weight="fill" className="text-[var(--color-accent)]" />
            <span className={`font-bold text-xl tracking-tight transition-colors duration-300 ${shouldStyleDark ? "text-zinc-950" : "text-white"}`}>
              Solar Energy
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={getHref(link.anchor)}
                className={`text-sm font-medium transition-colors duration-300 hover:text-[var(--color-accent)] ${shouldStyleDark ? "text-zinc-800" : "text-zinc-200"}`}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/blog"
              className={`text-sm font-medium transition-colors duration-300 hover:text-[var(--color-accent)] ${shouldStyleDark ? "text-zinc-800" : "text-zinc-200"}`}
            >
              Blog
            </Link>
            <button
              onClick={onOpenCalculator}
              className={`text-sm font-bold px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 bg-[var(--color-accent)] text-zinc-950 ${
                shouldStyleDark
                  ? "shadow-md hover:shadow-[0_0_20px_rgba(232,178,8,0.4)]"
                  : "shadow-lg hover:shadow-[0_0_30px_rgba(232,178,8,0.6)]"
              }`}
            >
              Simular Economia
            </button>
          </div>

          {/* Hamburger button (mobile) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            className={`md:hidden w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
              shouldStyleDark
                ? "text-zinc-950 hover:bg-zinc-100"
                : "text-white hover:bg-white/10"
            }`}
          >
            {isMenuOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu panel */}
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <SunDim size={28} weight="fill" className="text-[var(--color-accent)]" />
              <span className="font-bold text-lg text-zinc-950">Solar Energy</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Fechar menu"
              className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 transition-colors"
            >
              <X size={20} weight="bold" />
            </button>
          </div>

          <nav className="flex flex-col gap-1 px-4 py-6 flex-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={getHref(link.anchor)}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-4 py-3.5 rounded-xl text-zinc-800 font-semibold hover:bg-zinc-50 hover:text-[var(--color-accent)] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/blog"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center px-4 py-3.5 rounded-xl text-zinc-800 font-semibold hover:bg-zinc-50 hover:text-[var(--color-accent)] transition-colors"
            >
              Blog
            </Link>
          </nav>

          <div className="px-4 pb-8">
            <button
              onClick={() => { setIsMenuOpen(false); onOpenCalculator(); }}
              className="w-full py-4 rounded-2xl bg-[var(--color-accent)] text-zinc-950 font-bold text-base shadow-[0_0_30px_rgba(232,178,8,0.3)] hover:brightness-105 transition-all"
            >
              Simular Economia Grátis
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
