import { useState, useEffect, useRef } from 'react';
import { Bell, BellSlash, Check, Trash, WhatsappLogo, Headset } from '@phosphor-icons/react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import {
  isNotificationSupported, getNotificationPermission, requestNotificationPermission, showBrowserNotification,
} from '../lib/browserNotifications';

interface NotificationBellProps {
  onOpenLead: (leadId: string) => void;
}

export function NotificationBell({ onOpenLead }: NotificationBellProps) {
  const theme = useAuthStore((s) => s.theme);
  const user = useAuthStore((s) => s.user);
  const { reminders, markDone, markNotified, removeReminder } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [permission, setPermission] = useState<NotificationPermission | null>(() => getNotificationPermission());
  const panelRef = useRef<HTMLDivElement>(null);

  // Atualiza a cada 30s para refletir lembretes que passaram a estar atrasados
  // e também a permissão de notificação (pode ter sido concedida fora deste componente)
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      setPermission(getNotificationPermission());
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Reflete a permissão atual sempre que o painel é aberto
  useEffect(() => {
    if (open) setPermission(getNotificationPermission());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const myReminders = reminders
    .filter((r) => r.vendedorEmail === user?.email && !r.done)
    .sort((a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime());

  const overdueCount = myReminders.filter((r) => new Date(r.remindAt).getTime() <= now).length;

  // Dispara a notificação do navegador para lembretes que acabaram de vencer
  useEffect(() => {
    if (permission !== 'granted') return;
    for (const rem of myReminders) {
      if (!rem.notified && new Date(rem.remindAt).getTime() <= now) {
        const title = rem.type === 'assignment' ? `Novo lead: ${rem.leadNome}` : `Lembrete: ${rem.leadNome}`;
        showBrowserNotification(title, {
          body: rem.message,
          tag: rem.id,
        });
        markNotified(rem.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myReminders, now, permission]);

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-600'}`}
        title="Lembretes"
      >
        <Bell size={20} weight={overdueCount > 0 ? 'fill' : 'regular'} className={overdueCount > 0 ? 'text-red-500' : ''} />
        {myReminders.length > 0 && (
          <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
            overdueCount > 0 ? 'bg-red-500 text-white' : 'bg-[var(--color-accent)] text-zinc-950'
          }`}>
            {myReminders.length > 9 ? '9+' : myReminders.length}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border shadow-2xl z-50 ${
          theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'
        }`}>
          <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-white/10' : 'border-zinc-100'}`}>
            <p className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Seus lembretes
            </p>
          </div>

          {isNotificationSupported() && permission !== 'granted' && (
            <div className={`px-4 py-3 border-b flex items-center gap-3 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-zinc-100 bg-zinc-50'}`}>
              <BellSlash size={18} className="text-zinc-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {permission === 'denied' ? 'Notificações bloqueadas' : 'Receber notificações do navegador'}
                </p>
                {permission === 'denied' ? (
                  <p className="text-[11px] text-zinc-500">Libere nas permissões do site para ativar.</p>
                ) : (
                  <button
                    onClick={handleEnableNotifications}
                    className="text-[11px] font-bold text-[var(--color-accent)] hover:underline"
                  >
                    Ativar agora
                  </button>
                )}
              </div>
            </div>
          )}

          {myReminders.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-zinc-500 text-sm">Nenhum lembrete pendente.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {myReminders.map((rem) => {
                const isAssignment = rem.type === 'assignment';
                const isOverdue = !isAssignment && new Date(rem.remindAt).getTime() <= now;
                return (
                  <div key={rem.id} className={`px-4 py-3 flex items-start gap-3 ${isOverdue ? 'bg-red-500/5' : isAssignment ? 'bg-[var(--color-accent)]/5' : ''}`}>
                    <button
                      onClick={() => { onOpenLead(rem.leadId); setOpen(false); }}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className={`text-sm font-bold flex items-center gap-1.5 truncate ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        {isAssignment
                          ? <Headset size={13} weight="fill" className="text-[var(--color-accent)] shrink-0" />
                          : <WhatsappLogo size={13} className="text-green-500 shrink-0" />}
                        {rem.leadNome}
                      </p>
                      <p className={`text-xs truncate ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{rem.message}</p>
                      <p className={`text-[11px] mt-0.5 ${isOverdue ? 'text-red-400 font-bold' : isAssignment ? 'text-[var(--color-accent)] font-bold' : 'text-zinc-500'}`}>
                        {isAssignment ? 'Novo' : formatDate(rem.remindAt)} {isOverdue ? '· Atrasado' : ''}
                      </p>
                    </button>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => markDone(rem.id)}
                        title="Concluir"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-green-500 hover:bg-green-500/10 transition-colors"
                      >
                        <Check size={14} weight="bold" />
                      </button>
                      <button
                        onClick={() => removeReminder(rem.id)}
                        title="Excluir"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
