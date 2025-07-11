# Internationalization (i18n) Implementation Guide

This document outlines the comprehensive internationalization implementation for the Jenga dApp using react-i18next.

## 🌍 Supported Languages

The app supports 6 languages covering major continents and regions:

### ✅ Implemented Languages
- **🇺🇸 English (en)** - Default language, global
- **🇰🇪 Swahili (sw)** - East Africa (Kenya, Tanzania, Uganda)
- **🇫🇷 French (fr)** - West/Central Africa, Europe
- **🇧🇷 Portuguese (pt)** - Brazil, Angola, Mozambique
- **🇹🇷 Turkish (tr)** - Turkey, Central Asia
- **🇨🇳 Chinese (zh)** - China, Asia-Pacific

### 🗺 Geographic Coverage
- **Africa**: Swahili, French, Portuguese
- **South America**: Portuguese
- **Europe**: French, Turkish
- **Asia**: Chinese, Turkish
- **Global**: English

## 🏗 Architecture

### Core Configuration (`src/i18n/index.ts`)
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { /* translation files */ },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'jenga-language',
    },
  });
```

### Language Detection Priority
1. **localStorage** - User's saved preference
2. **navigator** - Browser language setting
3. **htmlTag** - HTML lang attribute
4. **fallback** - English (en)

### Persistent Storage
- **Key**: `jenga-language`
- **Storage**: localStorage
- **Behavior**: Remembers user choice across sessions

## 📁 File Structure

```
src/i18n/
├── index.ts                    # i18n configuration
└── locales/
    ├── en/translation.json     # English (master)
    ├── sw/translation.json     # Swahili
    ├── fr/translation.json     # French
    ├── pt/translation.json     # Portuguese
    ├── tr/translation.json     # Turkish
    └── zh/translation.json     # Chinese
```

## 🎯 Translation Structure

### Organized by Feature
```json
{
  "common": { /* shared UI elements */ },
  "navigation": { /* nav items */ },
  "theme": { /* theme toggle */ },
  "language": { /* language names */ },
  "wallet": { /* wallet operations */ },
  "welcome": { /* welcome screen */ },
  "dashboard": { /* dashboard content */ },
  "chama": { /* chama operations */ },
  "actions": { /* quick actions */ },
  "forms": { /* form validation */ },
  "errors": { /* error messages */ },
  "time": { /* time formatting */ },
  "status": { /* status indicators */ },
  "currency": { /* currency symbols */ }
}
```

### Example Translation Keys
```json
{
  "chama": {
    "create": "Create Chama",
    "createdSuccess": "Chama Created Successfully! 🎉",
    "createdSuccessDesc": "\"{{name}}\" is now live and ready for members to join.",
    "months": "{{count}} months",
    "members": "{{count}} members"
  }
}
```

## 🔧 Components

### Language Switcher (`src/components/LanguageSwitcher.tsx`)
```typescript
const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];
```

**Features:**
- Globe icon button in navigation
- Dropdown with native language names
- Visual indicator for current language
- Accessible with proper ARIA labels

### Updated Components
All major components now use translations:
- ✅ **Navbar** - Navigation items, theme toggle
- ✅ **Layout** - Welcome screen text
- ✅ **Dashboard** - All dashboard content
- ✅ **WalletConnect** - Wallet operations
- ✅ **CreateChamaModal** - Form labels and messages
- ✅ **Error handling** - Contextual error messages

## 🚀 Usage Examples

### Basic Translation Hook
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.subtitle')}</p>
    </div>
  );
}
```

### Interpolation with Variables
```typescript
// Translation key: "createdSuccessDesc": "\"{{name}}\" is now live"
const message = t('chama.createdSuccessDesc', { name: 'My Chama' });
// Result: "My Chama" is now live
```

### Pluralization
```typescript
// Translation keys:
// "month": "{{count}} month"
// "month_plural": "{{count}} months"
const duration = t('chama.months', { count: 6 });
// Result: "6 months"
```

### Conditional Error Messages
```typescript
useEffect(() => {
  if (error) {
    let errorMessage = t('chama.createFailedDesc');
    
    if (error.message.includes('insufficient funds')) {
      errorMessage = t('errors.insufficientFunds');
    } else if (error.message.includes('user rejected')) {
      errorMessage = t('errors.userRejected');
    }
    
    toast({
      title: t('chama.createFailed'),
      description: errorMessage,
      variant: "destructive",
    });
  }
}, [error, toast, t]);
```

## 🌐 Language-Specific Features

### Swahili (sw)
- **Region**: East Africa
- **Features**: Proper Swahili grammar and terminology
- **Example**: "Karibu Jenga" (Welcome to Jenga)

### French (fr)
- **Region**: Francophone Africa, Europe
- **Features**: Formal French with proper accents
- **Example**: "Bienvenue sur Jenga"

### Portuguese (pt)
- **Region**: Brazil, Lusophone Africa
- **Features**: Brazilian Portuguese variant
- **Example**: "Bem-vindo ao Jenga"

### Turkish (tr)
- **Region**: Turkey, Central Asia
- **Features**: Turkish grammar and cultural context
- **Example**: "Jenga'ya Hoş Geldiniz"

### Chinese (zh)
- **Region**: China, Asia-Pacific
- **Features**: Simplified Chinese characters
- **Example**: "欢迎来到 Jenga"

## 🎨 UI Integration

### Navigation Bar
```typescript
// Desktop
<div className="hidden md:flex items-center space-x-3">
  <LanguageSwitcher />
  <ThemeToggle />
  <WalletConnect />
</div>

// Mobile
<div className="px-3 flex items-center justify-between">
  <span>{t('language.changeLanguage')}</span>
  <LanguageSwitcher />
</div>
```

### Form Labels
```typescript
<Label htmlFor="name">{t('chama.name')}</Label>
<Input
  placeholder={t('chama.namePlaceholder')}
  // ...
/>
```

### Dynamic Content
```typescript
<span className="text-sm text-gray-500">
  {t('dashboard.activeGroups', { count: userChamas?.length || 0 })}
</span>
```

## 🔄 Language Switching

### Programmatic Change
```typescript
import { useTranslation } from 'react-i18next';

function LanguageButton() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };
  
  return (
    <button onClick={() => changeLanguage('sw')}>
      Switch to Swahili
    </button>
  );
}
```

### Current Language Detection
```typescript
const { i18n } = useTranslation();
const currentLanguage = i18n.language; // 'en', 'sw', 'fr', etc.
```

## 📱 Responsive Design

### Mobile Language Switcher
- Integrated into mobile navigation menu
- Clear labeling with native language names
- Consistent with desktop experience

### Text Length Considerations
- **German/Turkish**: Longer compound words
- **Chinese**: More compact character usage
- **Arabic script**: Right-to-left (future consideration)

## 🧪 Testing

### Manual Testing Checklist
- [ ] Language switcher works in navigation
- [ ] Language preference persists after reload
- [ ] All UI text translates correctly
- [ ] Form validation messages translate
- [ ] Error messages show in correct language
- [ ] Pluralization works correctly
- [ ] Variable interpolation works
- [ ] Mobile navigation language switcher works

### Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

## 🔧 Adding New Languages

### 1. Create Translation File
```bash
# Create new language directory
mkdir src/i18n/locales/es

# Copy English template
cp src/i18n/locales/en/translation.json src/i18n/locales/es/translation.json
```

### 2. Update i18n Configuration
```typescript
// src/i18n/index.ts
import esTranslation from './locales/es/translation.json';

const resources = {
  // ... existing languages
  es: {
    translation: esTranslation,
  },
};
```

### 3. Add to Language Switcher
```typescript
// src/components/LanguageSwitcher.tsx
const languages = [
  // ... existing languages
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
];
```

### 4. Translate Content
- Translate all keys in the JSON file
- Test pluralization rules
- Verify cultural appropriateness

## 🚨 Common Issues & Solutions

### 1. Missing Translation Keys
**Problem**: Key not found, shows key instead of text
**Solution**: Add missing key to all language files

### 2. Interpolation Not Working
**Problem**: Variables not replaced in text
**Solution**: Check variable names match exactly
```typescript
// Correct
t('message', { name: 'John' })
// Translation: "Hello {{name}}"
```

### 3. Pluralization Issues
**Problem**: Wrong plural form displayed
**Solution**: Check plural rules for language
```json
{
  "item": "{{count}} item",
  "item_plural": "{{count}} items"
}
```

### 4. Language Not Persisting
**Problem**: Language resets on page reload
**Solution**: Check localStorage permissions and key name

## 🔮 Future Enhancements

### Potential Additions
- [ ] **Arabic (ar)** - Middle East, North Africa
- [ ] **Spanish (es)** - Latin America, Spain
- [ ] **Hindi (hi)** - India, South Asia
- [ ] **Russian (ru)** - Eastern Europe, Central Asia

### Advanced Features
- [ ] **RTL Support** - Right-to-left languages
- [ ] **Number Formatting** - Locale-specific numbers
- [ ] **Date Formatting** - Locale-specific dates
- [ ] **Currency Formatting** - Regional currency display
- [ ] **Lazy Loading** - Load translations on demand

### Integration Improvements
- [ ] **Translation Management** - External translation service
- [ ] **Automated Testing** - Translation completeness checks
- [ ] **Context Hints** - Help translators understand usage
- [ ] **Namespace Splitting** - Separate translation files by feature

## 📚 Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Language Codes (ISO 639-1)](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- [Unicode CLDR](https://cldr.unicode.org/) - Locale data
- [Google Translate](https://translate.google.com/) - Translation assistance

The i18n implementation provides comprehensive language support for the Jenga dApp, making it accessible to users across Africa, South America, Turkey, and Asia while maintaining the clean, modern design aesthetic in all languages.
