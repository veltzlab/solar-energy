import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  TextB, TextItalic, TextHThree, ListBullets, LinkSimple,
  ArrowUUpLeft, ArrowUUpRight,
} from '@phosphor-icons/react';

interface BlogEditorProps {
  content: string;
  onChange: (html: string) => void;
  theme: 'dark' | 'light';
}

export function BlogEditor({ content, onChange, theme }: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: `prose-blog outline-none min-h-[280px] max-h-[420px] overflow-y-auto px-4 py-3 text-sm leading-relaxed ${
          theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'
        }`,
      },
    },
  });

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `p-2 rounded-lg transition-colors ${
      active
        ? 'bg-[var(--color-accent)] text-zinc-950'
        : theme === 'dark' ? 'text-zinc-400 hover:bg-white/10 hover:text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
    }`;

  return (
    <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'border-white/10 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
      <div className={`flex items-center gap-1 px-2 py-1.5 border-b flex-wrap ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-zinc-100 bg-zinc-50'}`}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Negrito">
          <TextB size={16} weight="bold" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Itálico">
          <TextItalic size={16} weight="bold" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))} title="Subtítulo">
          <TextHThree size={16} weight="bold" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Lista">
          <ListBullets size={16} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('URL do link:');
            if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }}
          className={btnClass(editor.isActive('link'))}
          title="Link"
        >
          <LinkSimple size={16} weight="bold" />
        </button>
        <div className={`w-px h-5 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-zinc-200'}`} />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)} title="Desfazer">
          <ArrowUUpLeft size={16} weight="bold" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)} title="Refazer">
          <ArrowUUpRight size={16} weight="bold" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
