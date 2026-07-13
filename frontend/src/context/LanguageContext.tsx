/**
 * LanguageContext.tsx
 * Keeps i18next language and Web Speech API locale in sync.
 * TRD reference: section 4.2 & 4.3
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '@swasthconnect/shared';
import i18n from '../lib/i18n';

// Maps app language codes to Web Speech API BCP-47 locale codes (TRD 4.3)
export const speechLocaleMap: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
};

interface LanguageContextValue {
  language: Language;
  speechLocale: string;
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem('swasth_lang') as Language) || 'en'
  );

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('swasth_lang', lang);
  };

  return (
    <LanguageContext.Provider
      value={{ language, speechLocale: speechLocaleMap[language], changeLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
