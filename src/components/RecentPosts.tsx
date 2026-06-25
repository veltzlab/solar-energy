import { Link } from "react-router-dom";
import { ArrowRight, CalendarBlank, Clock, Tag } from "@phosphor-icons/react";
import { useBlogStore } from "../store/useBlogStore";

export function RecentPosts() {
  const posts = useBlogStore((s) => s.posts);
  const recentPosts = posts.slice(0, 3);

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="blog">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-950 mb-4">
              Conteúdo em <span className="text-[var(--color-accent)]">Destaque</span>
            </h2>
            <p className="text-zinc-600 text-lg">
              Fique por dentro das últimas novidades, dicas de economia e tendências sobre energia solar.
            </p>
          </div>
          
          <Link 
            to="/blog"
            className="group inline-flex items-center gap-2 text-zinc-950 font-bold text-lg hover:text-[var(--color-accent)] transition-colors shrink-0"
          >
            Ver todos os artigos
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-[var(--color-accent)] group-hover:text-zinc-950 transition-colors">
              <ArrowRight size={20} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recentPosts.map((post) => (
            <Link 
              key={post.id} 
              to={`/blog/${post.slug}`}
              className="group flex flex-col bg-zinc-50 rounded-3xl overflow-hidden border border-zinc-100 hover:border-zinc-200 transition-all duration-500 hover:-translate-y-2"
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
                
                <p className="text-zinc-600 text-sm mb-6 line-clamp-2 flex-grow">
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
    </section>
  );
}
