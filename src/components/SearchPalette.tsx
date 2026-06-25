import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, X } from '@phosphor-icons/react';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchPalette({ isOpen, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState('');

  // Handle keyboard shortcut (Ctrl+K) and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) { onClose(); } else { document.dispatchEvent(new CustomEvent('open-search')); }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-zinc-950/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[101] m-auto h-fit max-w-2xl w-full px-4"
            style={{ top: '15vh' }}
          >
            <div className="bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-zinc-200 overflow-hidden flex flex-col">
              <div className="flex items-center px-4 border-b border-zinc-100">
                <MagnifyingGlass size={24} className="text-zinc-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar painéis, inversores, serviços..."
                  className="flex-1 px-4 py-5 outline-none text-lg placeholder:text-zinc-400 text-zinc-900 bg-transparent font-medium"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-100 rounded-md">
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {query ? (
                  <div className="py-8 text-center text-zinc-500">
                    Buscando por "{query}"...
                  </div>
                ) : (
                  <div className="py-4 text-sm text-zinc-500">
                    <p className="mb-2 uppercase text-xs font-semibold tracking-wider text-zinc-400">Sugestões</p>
                    <div className="flex flex-col gap-1">
                      {['Como funciona o painel solar?', 'Simulador de economia', 'Preços e orçamentos', 'Manutenção de inversores'].map((item) => (
                        <button key={item} className="text-left px-4 py-3 rounded-xl hover:bg-zinc-50 transition-colors text-zinc-700 font-medium">
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
