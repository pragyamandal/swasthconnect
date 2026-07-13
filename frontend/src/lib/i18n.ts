/**
 * i18n.ts — i18next initialisation
 * TRD reference: section 4.2
 *
 * Supported languages: en, hi, kn, ta, te, bn
 * Translation files live in /public/locales/{lng}/translation.json
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Use language stored in localStorage first; fallback to English
    lng: localStorage.getItem('swasth_lang') || 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'kn', 'ta', 'te', 'bn'],
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'swasth_lang',
    },
  });

export default i18n;
