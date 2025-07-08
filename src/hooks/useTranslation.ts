import { useTranslation as useI18nTranslation } from 'react-i18next';

// Custom hook that provides typed translations
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  // Helper function for formatted translations
  const tf = (key: string, options?: Record<string, any>) => {
    return t(key, options);
  };

  return {
    t: tf,
    i18n,
    language: i18n.language,
    changeLanguage: i18n.changeLanguage,
  };
};

// Export the original hook as well for compatibility
export { useTranslation as useI18nTranslation } from 'react-i18next';
