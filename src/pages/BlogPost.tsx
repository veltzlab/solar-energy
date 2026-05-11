import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, CalendarBlank, Clock, UserCircle, ShareNetwork } from "@phosphor-icons/react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { mockPosts } from "../data/mockBlog";
import { useState, useEffect } from "react";
import { SearchPalette } from "../components/SearchPalette";
import { CalculatorModal } from "../components/CalculatorModal";

export function BlogPost() {
  const { slug } = useParams();
  const post = mockPosts.find(p => p.slug === slug);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    const handleOpenCalc = () => setIsCalculatorOpen(true);
    document.addEventListener('open-search', handleOpenSearch);
    document.addEventListener('open-calculator', handleOpenCalc);
    // Scroll to top when loading a new post
    window.scrollTo(0, 0);
    return () => {
      document.removeEventListener('open-search', handleOpenSearch);
      document.removeEventListener('open-calculator', handleOpenCalc);
    };
  }, [slug]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-[var(--color-accent-light)] selection:text-zinc-950">
      {/* We pass empty functions or hook them up if we want Navbar to work identically */}
      <Navbar 
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      />
      <SearchPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />

      <main className="pt-32 pb-24">
        <article className="max-w-3xl mx-auto px-6 md:px-8">
          
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-950 font-medium text-sm transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Voltar para o blog
          </Link>

          <div className="mb-10">
            <div className="inline-block bg-zinc-100 px-3 py-1 rounded-full text-xs font-bold text-zinc-600 uppercase tracking-wider mb-6">
              {post.category}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 mb-6 leading-[1.1]">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 py-6 border-y border-zinc-100">
              <div className="flex items-center gap-2">
                <UserCircle size={20} />
                <span className="font-medium text-zinc-900">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarBlank size={18} />
                {post.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                {post.readTime}
              </div>
              <button 
                className="ml-auto flex items-center gap-2 hover:text-zinc-950 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copiado para a área de transferência!");
                }}
              >
                <ShareNetwork size={18} />
                <span className="hidden sm:inline">Compartilhar</span>
              </button>
            </div>
          </div>

          <div className="aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden mb-12 bg-zinc-100">
            <img
              src={post.coverImage}
              alt={post.title}
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>

          <div 
            className="max-w-none text-zinc-600 leading-relaxed text-lg
              [&_h3]:text-2xl [&_h3]:font-black [&_h3]:text-zinc-900 [&_h3]:tracking-tight [&_h3]:mt-12 [&_h3]:mb-6
              [&_p]:mb-6
              [&_strong]:font-bold [&_strong]:text-zinc-900
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_li]:mb-2
              [&_a]:text-[var(--color-accent)] [&_a:hover]:text-[var(--color-accent-light)]
              selection:bg-[var(--color-accent-light)] selection:text-zinc-950"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
        </article>
      </main>
      <Footer />
    </div>
  );
}
