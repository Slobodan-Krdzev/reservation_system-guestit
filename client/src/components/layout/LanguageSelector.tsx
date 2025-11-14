import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../i18n/resources';

export const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  return (
    <label className="text-sm flex items-center gap-2 text-slate-500">
      <span>{t('common.language')}:</span>
      <select
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
        value={i18n.language}
        onChange={(event) => i18n.changeLanguage(event.target.value)}
      >
        {supportedLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
};

