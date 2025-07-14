import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { logger } from '@/services/logger';

// Import translations
import enTranslations from './locales/en';
import esTranslations from './locales/es';
import frTranslations from './locales/fr';
import deTranslations from './locales/de';
import zhTranslations from './locales/zh';

export const defaultNS = 'common';
export const resources = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
  zh: zhTranslations,
} as const;

export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

i18n
  // Load translation using http backend (for production)
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    fallbackLng: 'en',
    defaultNS,
    ns: ['common', 'auth', 'rfq', 'orders', 'compliance', 'errors', 'validation'],
    
    // Development mode
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
      format: (value, format, lng) => {
        // Custom formatting functions
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'capitalize') {
          return value.charAt(0).toUpperCase() + value.slice(1);
        }
        
        // Date formatting
        if (value instanceof Date) {
          const options: Intl.DateTimeFormatOptions = {};
          
          switch (format) {
            case 'short':
              return new Intl.DateTimeFormat(lng, { 
                dateStyle: 'short' 
              }).format(value);
            case 'long':
              return new Intl.DateTimeFormat(lng, { 
                dateStyle: 'long' 
              }).format(value);
            case 'time':
              return new Intl.DateTimeFormat(lng, { 
                timeStyle: 'short' 
              }).format(value);
            case 'datetime':
              return new Intl.DateTimeFormat(lng, { 
                dateStyle: 'short', 
                timeStyle: 'short' 
              }).format(value);
            default:
              return new Intl.DateTimeFormat(lng).format(value);
          }
        }
        
        // Number formatting
        if (typeof value === 'number') {
          switch (format) {
            case 'currency':
              return new Intl.NumberFormat(lng, { 
                style: 'currency', 
                currency: 'USD' 
              }).format(value);
            case 'percent':
              return new Intl.NumberFormat(lng, { 
                style: 'percent' 
              }).format(value);
            case 'decimal':
              return new Intl.NumberFormat(lng, { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(value);
            default:
              return new Intl.NumberFormat(lng).format(value);
          }
        }
        
        return value;
      },
    },
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'fdx_language',
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'],
    },
    
    // Backend options (for loading translations from files)
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: '/locales/add/{{lng}}/{{ns}}',
    },
    
    // React options
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    },
    
    // Resources (bundled translations)
    resources,
    
    // Missing key handler
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lngs, ns, key, fallbackValue) => {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Missing translation', { 
          languages: lngs, 
          namespace: ns, 
          key,
          fallback: fallbackValue 
        });
      }
    },
  });

// Custom event handlers
i18n.on('languageChanged', (lng) => {
  logger.info('Language changed', { language: lng });
  // Update HTML lang attribute
  document.documentElement.lang = lng;
  // Update HTML dir attribute for RTL languages
  document.documentElement.dir = ['ar', 'he', 'fa'].includes(lng) ? 'rtl' : 'ltr';
});

i18n.on('loaded', (loaded) => {
  logger.debug('Translations loaded', { loaded });
});

i18n.on('failedLoading', (lng, ns, msg) => {
  logger.error('Failed to load translations', { language: lng, namespace: ns, message: msg });
});

export default i18n;