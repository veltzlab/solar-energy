import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Benefits } from './components/Benefits';
import { HowItWorks } from './components/HowItWorks';
import { Reviews } from './components/Reviews';
import { FAQ } from './components/FAQ';
import { Contacts } from './components/Contacts';
import { Footer } from './components/Footer';
import { RecentPosts } from './components/RecentPosts';
import { SearchPalette } from './components/SearchPalette';
import { CalculatorModal } from './components/CalculatorModal';
import { CrmDashboard } from './pages/CrmDashboard';
import { CrmLogin } from './pages/CrmLogin';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { WhatsAppFloating } from './components/WhatsAppFloating';
import { useAuthStore } from './store/useAuthStore';

// Rota protegida: mostra login se não autenticado
function ProtectedCrm() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <CrmDashboard /> : <CrmLogin />;
}

// Context para abrir o modal de qualquer lugar
export function openCalculator() {
  document.dispatchEvent(new CustomEvent('open-calculator'));
}

function LandingPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    const handleOpenCalc = () => setIsCalculatorOpen(true);
    document.addEventListener('open-search', handleOpenSearch);
    document.addEventListener('open-calculator', handleOpenCalc);
    return () => {
      document.removeEventListener('open-search', handleOpenSearch);
      document.removeEventListener('open-calculator', handleOpenCalc);
    };
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-[var(--color-accent-light)] selection:text-zinc-950">
      <Navbar
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      />
      <SearchPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />

      <main>
        <Hero onOpenCalculator={() => setIsCalculatorOpen(true)} />
        <Benefits />
        <HowItWorks />
        <Reviews />
        <RecentPosts />
        <FAQ />
        <Contacts />
      </main>

      <Footer />
      <WhatsAppFloating />
    </div>
  );
}

function App() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => { init(); }, []);

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
