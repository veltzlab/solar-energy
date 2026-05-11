import { Link } from "react-router-dom";
import { ArrowRight, CalendarBlank, Clock, Tag } from "@phosphor-icons/react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { mockPosts } from "../data/mockBlog";
import { useState, useEffect } from "react";
import { SearchPalette } from "../components/SearchPalette";
import { CalculatorModal } from "../components/CalculatorModal";

export function Blog() {
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
    <div className="bg-zinc-50 min-h-screen font-sans">
      <Navbar 
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      />
      <SearchPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-950 mb-6">
              Nosso <span className="text-[var(--color-accent)]">Blog</span>
            </h1>
            <p className="text-zinc-600 text-lg md:text-xl max-w-2xl">
              Fique por dentro das novidades, dicas e guias completos sobre energia solar, economia e sustentabilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockPosts.map((post) => (
              <Link 
                key={post.id} 
                to={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-[0_20px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Tag size={12} weight="fill" className="text-[var(--color-accent)]" />
                    {post.category}
                  </div>
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs font-medium text-zinc-400 mb-4">
                    <div className="flex items-center gap-1">
                      <CalendarBlank size={14} />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {post.readTime}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-zinc-900 mb-3 leading-tight group-hover:text-[var(--color-accent)] transition-colors line-clamp-3">
                    {post.title}
                  </h3>
                  
                  <p className="text-zinc-600 text-sm mb-6 line-clamp-3 flex-grow">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-2 text-zinc-950 font-bold text-sm mt-auto">
                    Ler artigo
                    <ArrowRight size={16} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
