import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Benefits } from './components/Benefits';
import { Calculator } from './components/Calculator';
import { SearchPalette } from './components/SearchPalette';
import { CalculatorModal } from './components/CalculatorModal';
import { CrmDashboard } from './pages/CrmDashboard';
import { CrmLogin } from './pages/CrmLogin';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { WhatsAppFloating } from './components/WhatsAppFloating';
import { useAuthStore } from './store/useAuthStore';

const HowItWorks = lazy(() => import('./components/HowItWorks').then(m => ({ default: m.HowItWorks })));
const ClientShowcase = lazy(() => import('./components/ClientShowcase').then(m => ({ default: m.ClientShowcase })));
const Reviews = lazy(() => import('./components/Reviews').then(m => ({ default: m.Reviews })));
const FAQ = lazy(() => import('./components/FAQ').then(m => ({ default: m.FAQ })));
const Contacts = lazy(() => import('./components/Contacts').then(m => ({ default: m.Contacts })));
const Footer = lazy(() => import('./components/Footer').then(m => ({ default: m.Footer })));
const RecentPosts = lazy(() => import('./components/RecentPosts').then(m => ({ default: m.RecentPosts })));

// Rota protegida: mostra login se não autenticado
function ProtectedCrm() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <CrmDashboard /> : <CrmLogin />;
}

function LandingPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calculatorInitialValor, setCalculatorInitialValor] = useState<number | undefined>(undefined);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    const handleOpenCalc = (e: Event) => {
      const detail = (e as CustomEvent<{ valorConta?: number }>).detail;
      setCalculatorInitialValor(detail?.valorConta);
      setIsCalculatorOpen(true);
    };
    document.addEventListener('open-search', handleOpenSearch);
    document.addEventListener('open-calculator', handleOpenCalc);
    return () => {
      document.removeEventListener('open-search', handleOpenSearch);
      document.removeEventListener('open-calculator', handleOpenCalc);
    };
  }, []);

  // Abre o modal do zero (passo 1), limpando qualquer valor herdado da calculadora inline
  const openCalculatorFromScratch = () => {
    setCalculatorInitialValor(undefined);
    setIsCalculatorOpen(true);
  };

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-[var(--color-accent-light)] selection:text-zinc-950">
      <a
        href="#main-content"
        className="fixed -top-40 left-4 z-[9999] px-6 py-3 rounded-b-2xl bg-[var(--color-accent)] text-zinc-950 font-bold text-sm shadow-lg focus:top-0 transition-all duration-300 outline-none"
      >
        Pular para conteúdo
      </a>
      <Navbar
        onOpenCalculator={openCalculatorFromScratch}
      />
      <SearchPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        initialValorConta={calculatorInitialValor}
      />

      <main id="main-content">
        <Hero onOpenCalculator={openCalculatorFromScratch} />
        <Benefits />
        <Calculator />
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><span className="text-zinc-400">Carregando...</span></div>}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><span className="text-zinc-400">Carregando...</span></div>}>
          <ClientShowcase />
        </Suspense>
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><span className="text-zinc-400">Carregando...</span></div>}>
          <Reviews />
        </Suspense>
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><span className="text-zinc-400">Carregando...</span></div>}>
          <RecentPosts />
        </Suspense>
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><span className="text-zinc-400">Carregando...</span></div>}>
          <FAQ />
        </Suspense>
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><span className="text-zinc-400">Carregando...</span></div>}>
          <Contacts />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <WhatsAppFloating />
    </div>
  );
}

function App() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => { init(); }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<><Blog /><WhatsAppFloating /></>} />
        <Route path="/blog/:slug" element={<><BlogPost /><WhatsAppFloating /></>} />
        <Route path="/crm" element={<ProtectedCrm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
