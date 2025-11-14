import { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { useAuthStore } from '../../store/auth';

export const AppLayout = () => {
  const { t } = useTranslation();
  const { logout, user } = useAuthStore();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const { timeLabel, dateLabel } = useMemo(() => {
    const timeLabel = now.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
    const dateLabel = now.toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return { timeLabel, dateLabel };
  }, [now]);

 
  return (
    <div className="flex h-screen w-screen flex-col  text-white overflow-hidden">
      <header className="flex-shrink-0 border-b border-white/10 bg-gradient-to-b from-black/80 via-black/70 to-transparent">
        <div className="flex w-full flex-wrap items-center justify-between gap-6 px-6 py-3">
          <div className="flex items-center gap-3">
            <img src="/client.png" alt="Venue logo" className="h-10 w-auto" />
            <LanguageSelector />
          </div>
          <div className="text-center">
            <p className="text-3xl font-semibold">{timeLabel}</p>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">{dateLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-white/10">
              <img
                src={user?.avatarUrl || '/avatar-placeholder.png'}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Guest concierge
              </p>
              <p className="text-sm font-semibold">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden ">
        <div className="h-full w-full px-6 py-6">
          <div className="h-full w-full overflow-hidden rounded-3xl border border-white/5 bg-black/30 backdrop-blur">
            <Outlet />
          </div>
        </div>
      </main>
      <footer className="flex-shrink-0 border-t border-white/10 bg-black/90">
        <div className="flex w-full items-center justify-between px-6 py-4 text-xs uppercase tracking-[0.4em] text-white/60">
          <span>guestit</span>
          <span>experience elevated</span>
        </div>
      </footer>
    </div>
  );
};

