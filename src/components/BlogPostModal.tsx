import { useState, useEffect } from 'react';
import { X, FloppyDisk } from '@phosphor-icons/react';
import { useBlogStore, slugify } from '../store/useBlogStore';
import type { BlogPost } from '../store/useBlogStore';
import { useAuthStore } from '../store/useAuthStore';
import { BlogEditor } from './BlogEditor';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogPostModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIAS = ['Economia', 'Investimento', 'Tecnologia', 'Guia', 'Novidades'];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatDateNow(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')} de ${MESES[d.getMonth()]}, ${d.getFullYear()}`;
}

export function BlogPostModal({ post, isOpen, onClose }: BlogPostModalProps) {
  const { addPost, updatePost } = useBlogStore();
  const { user, theme } = useAuthStore();
  const isEditing = !!post;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState(CATEGORIAS[0]);
  const [readTime, setReadTime] = useState('4 min de leitura');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setSlugEdited(true);
      setExcerpt(post.excerpt);
      setContent(post.content);
      setCoverImage(post.coverImage);
      setCategory(post.category);
      setReadTime(post.readTime);
    } else {
      setTitle('');
      setSlug('');
      setSlugEdited(false);
      setExcerpt('');
      setContent('<p></p>');
      setCoverImage('');
      setCategory(CATEGORIAS[0]);
      setReadTime('4 min de leitura');
    }
  }, [post, isOpen]);

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(title));
  }, [title, slugEdited]);

  const canSubmit = title.trim().length >= 4 && slug.trim().length >= 3 && excerpt.trim().length >= 10 && coverImage.trim().length > 0;

  const handleSave = async () => {
    if (!canSubmit) return;
    setSaving(true);
    const data = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content,
      coverImage: coverImage.trim(),
      category,
      readTime,
      author: post?.author ?? user?.name ?? 'Equipe Solar Energy',
      date: post?.date ?? formatDateNow(),
    };
    if (isEditing && post) {
      updatePost(post.id, data);
    } else {
      addPost(data);
    }
    setSaving(false);
    onClose();
  };

  const inp = `w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] ${
    theme === 'dark' ? 'bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400'
  }`;
  const lbl = `text-[10px] font-bold uppercase tracking-widest mb-1.5 block ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className={`relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col ${
              theme === 'dark' ? 'bg-zinc-950 border border-white/10' : 'bg-white'
            }`}
          >
            <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${theme === 'dark' ? 'border-white/10' : 'border-zinc-200'}`}>
              <h2 className={`font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>
                {isEditing ? 'Editar artigo' : 'Novo artigo'}
              </h2>
              <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              <div>
                <label className={lbl}>Título</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Como a energia solar reduz sua conta" className={inp} />
              </div>

              <div>
                <label className={lbl}>Slug (URL)</label>
                <input
                  value={slug}
                  onChange={(e) => { setSlug(slugify(e.target.value)); setSlugEdited(true); }}
                  placeholder="como-a-energia-solar-reduz-sua-conta"
                  className={`${inp} font-mono text-xs`}
                />
              </div>

              <div>
                <label className={lbl}>Resumo (aparece no card do blog)</label>
                <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={`${inp} resize-none`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Categoria</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inp}>
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Tempo de leitura</label>
                  <input value={readTime} onChange={(e) => setReadTime(e.target.value)} className={inp} />
                </div>
              </div>

              <div>
                <label className={lbl}>URL da imagem de capa</label>
                <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." className={inp} />
              </div>

              <div>
                <label className={lbl}>Conteúdo</label>
                <BlogEditor content={content} onChange={setContent} theme={theme} />
              </div>
            </div>

            <div className={`px-6 py-4 border-t flex justify-end gap-3 shrink-0 ${theme === 'dark' ? 'border-white/10' : 'border-zinc-200'}`}>
              <button
                onClick={onClose}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors ${theme === 'dark' ? 'border-white/10 text-zinc-400 hover:bg-white/5' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!canSubmit || saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[var(--color-accent)] text-zinc-950 hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <FloppyDisk size={16} weight="bold" />
                {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Publicar artigo'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
