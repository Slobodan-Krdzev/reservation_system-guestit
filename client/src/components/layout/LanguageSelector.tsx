import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../i18n/resources';

const specialFlags: Record<string, string> = {
  en: '🇬🇧',
  da: '🇩🇰',
};

const codeToFlag = (code: string) =>
  specialFlags[code] ||
  code
    .slice(0, 2)
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const active = supportedLanguages.find((lang) => lang.code === i18n.language);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10  items-center justify-center rounded-full border border-white/30 bg-white/10 text-lg"
        aria-label="Change language"
      >
        {codeToFlag(active?.code || 'en')}
      </button>
      {open && (
        <div className="absolute bottom-12 right-0 z-20 rounded-2xl border border-white/10 bg-black/80 p-2 shadow-2xl backdrop-blur">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                i18n.language === lang.code ? 'bg-white text-black' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <span className="text-lg">{codeToFlag(lang.code)}</span>
              <span className="capitalize">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

