import React, { useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../types/language';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  className?: string;
}

/**
 * Language selector component for onboarding and settings
 * Displays top 10 languages with native names and flags
 */
export function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  className = ''
}: LanguageSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedLang = getLanguageByCode(selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode);
    setIsExpanded(false);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium flex items-center gap-2">
        <Globe className="h-4 w-4" />
        Preferred Language
      </Label>

      {/* Selected Language Display */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between h-auto p-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{selectedLang.flag}</span>
          <div>
            <div className="font-medium text-sm">{selectedLang.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {selectedLang.nativeName}
            </div>
          </div>
        </div>
        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </Button>

      {/* Language Options */}
      {isExpanded && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg max-h-64 overflow-y-auto">
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => handleLanguageSelect(language.code)}
              className={`
                w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 
                transition-colors flex items-center gap-3 border-b border-gray-100 
                dark:border-gray-700 last:border-b-0
                ${selectedLanguage === language.code
                  ? 'bg-bitcoin/10 border-bitcoin/20'
                  : ''
                }
              `}
            >
              <span className="text-xl">{language.flag}</span>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {language.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {language.nativeName}
                </div>
              </div>
              {selectedLanguage === language.code && (
                <Check className="h-4 w-4 text-bitcoin" />
              )}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        This will be your default language for the app interface
      </p>
    </div>
  );
}
