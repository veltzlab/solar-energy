import { useState } from 'react';
import { Plus, PencilSimple, Trash, Eye, CalendarBlank, Tag } from '@phosphor-icons/react';
import { useBlogStore } from '../store/useBlogStore';
import type { BlogPost } from '../store/useBlogStore';
import { useAuthStore } from '../store/useAuthStore';
import { BlogPostModal } from './BlogPostModal';

export function BlogManager() {
  const posts = useBlogStore((s) => s.posts);
  const removePost = useBlogStore((s) => s.removePost);
  const theme = useAuthStore((s) => s.theme);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const handleNew = () => { setEditingPost(null); setModalOpen(true); };
  const handleEdit = (post: BlogPost) => { setEditingPost(post); setModalOpen(true); };

  const handleDelete = (post: BlogPost) => {
    if (window.confirm(`Excluir o artigo "${post.title}"?`)) removePost(post.id);
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className={`text-3xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>Artigos do Blog</h2>
          <p className="text-zinc-500">Publique e edite os conteúdos exibidos no blog público do site.</p>
        </div>
        <button
          onClick={handleNew}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:brightness-105 active:scale-95 ${
            theme === 'dark' ? 'bg-[var(--color-accent)] text-zinc-950 shadow-[var(--color-accent)]/20' : 'bg-zinc-950 text-white shadow-zinc-300'
          }`}
        >
          <Plus size={18} weight="bold" />
          Novo Artigo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`group rounded-3xl overflow-hidden border transition-colors ${
              theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200 shadow-sm'
            }`}
          >
            <div className="aspect-[16/9] overflow-hidden relative">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1">
                <Tag size={10} weight="fill" className="text-[var(--color-accent)]" />
                {post.category}
              </div>
            </div>
            <div className="p-5">
              <div className={`flex items-center gap-1.5 text-[11px] mb-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                <CalendarBlank size={12} />
                {post.date}
              </div>
              <h3 className={`font-bold text-sm mb-2 line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{post.title}</h3>
              <p className={`text-xs line-clamp-2 mb-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{post.excerpt}</p>
              <div className="flex items-center gap-2">
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
                  title="Ver no site"
                >
                  <Eye size={16} />
                </a>
                <button
                  onClick={() => handleEdit(post)}
                  className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
                  title="Editar"
                >
                  <PencilSimple size={16} />
                </button>
                <button
                  onClick={() => handleDelete(post)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors ml-auto"
                  title="Excluir"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-zinc-500 font-medium">Nenhum artigo publicado ainda.</p>
        </div>
      )}

      <BlogPostModal post={editingPost} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
