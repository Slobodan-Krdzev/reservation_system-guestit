import { useTranslation } from 'react-i18next';

const providers = [
  {
    id: 'facebook',
    label: 'Continue with Facebook',
    classes: 'bg-[#1877F2] text-white border-[#1877F2] hover:bg-[#1660d4]',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M22 12a10 10 0 1 0-11.56 9.88v-7h-2.3V12h2.3V9.8c0-2.27 1.35-3.52 3.42-3.52.99 0 2.03.18 2.03.18v2.24h-1.14c-1.13 0-1.48.7-1.48 1.42V12h2.51l-.4 2.88h-2.11v7A10 10 0 0 0 22 12Z" />
      </svg>
    ),
  },
  {
    id: 'google',
    label: 'Continue with Google',
    classes: 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path
          fill="#EA4335"
          d="M12 10.2v3.6h5.03c-.22 1.17-.9 2.16-1.9 2.82l3.06 2.38c1.79-1.65 2.82-4.09 2.82-6.99 0-.67-.06-1.33-.18-1.97H12Z"
        />
        <path
          fill="#34A853"
          d="M6.53 14.2l-.9 3.36-3 .06A9.96 9.96 0 0 0 12 22c2.7 0 4.96-.89 6.6-2.41l-3.07-2.4c-.85.57-1.93.9-3.53.9-2.72 0-5.03-1.83-5.85-4.39Z"
        />
        <path
          fill="#4A90E2"
          d="M3.63 7.22 6.58 9.54c.82-2.56 3.13-4.39 5.85-4.39 1.48 0 2.8.51 3.85 1.52l2.89-2.9C17 2.36 14.74 1.5 12.43 1.5a10 10 0 0 0-8.8 5.72Z"
        />
        <path
          fill="#FBBC05"
          d="M12 1.5A9.96 9.96 0 0 0 3.63 7.22l2.95 2.32C7.4 7 9.7 5.17 12.43 5.17c1.48 0 2.8.51 3.85 1.52l2.89-2.9C17 2.36 14.74 1.5 12.43 1.5Z"
        />
      </svg>
    ),
  },
  {
    id: 'apple',
    label: 'Continue with Apple',
    classes: 'bg-black text-white border-black hover:bg-black/90',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M16.365 7.22c-.91.58-1.53 1.52-1.41 2.64 1.11.07 2.15-.45 2.8-1.28.74-.92 1.09-2.16.93-3.38-1.06.04-2.2.62-2.97 1.55zM12.67 9.07c-.66 0-1.67-.72-2.75-.7-1.42.02-2.72.83-3.45 2.09-1.47 2.56-.39 6.34 1.05 8.43.7 1 1.52 2.13 2.61 2.09 1.05-.04 1.44-.68 2.7-.68 1.25 0 1.62.68 2.75.65 1.13-.02 1.85-1.03 2.55-2.03a8.6 8.6 0 0 0 1.16-2.32c-3.06-1.16-3.55-5.48-.53-7.21-.96-1.27-2.3-2.01-3.79-2.02-1.19 0-2.26.72-2.95.7z" />
      </svg>
    ),
  },
];

interface Props {
  onSelect: (provider: string) => void;
}

export const SocialButtons = ({ onSelect }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
        <span className="h-px flex-1 bg-gray-600" />
        <span className='text-xs text-gray-600'>{t('auth.social')}</span>
        <span className="h-px flex-1 bg-gray-600" />
      </div>
      <div className="grid grid-cols-3 gap-3 sm:block sm:space-y-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => onSelect(provider.id)}
            className={`flex w-full items-center justify-center md:justify-start gap-3 rounded-xl border px-3 py-3 md:px-4 md:py-2 text-sm font-semibold transition ${provider.classes}`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              {provider.icon}
            </span>
            <span className="hidden sm:inline">{provider.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

