import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../locales/en/common.json';
import swCommon from '../locales/sw/common.json';
import ptCommon from '../locales/pt/common.json';
import trCommon from '../locales/tr/common.json';
import tlCommon from '../locales/tl/common.json';

// Language resources
const resources = {
  en: {
    common: enCommon,
  },
  sw: {
    common: swCommon,
  },
  pt: {
    common: ptCommon,
  },
  tr: {
    common: trCommon,
  },
  tl: {
    common: tlCommon,
  },
};

// Language configurations
export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
];

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common'],
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'jenga-language',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
