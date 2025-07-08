# 🌍 Jenga Localization Guide

Jenga now supports multiple languages to serve our global community of Bitcoin savers. This guide explains how to use and extend the localization system.

## 🗣️ Supported Languages

- **English** (en) 🇺🇸 - Default language
- **Kiswahili** (sw) 🇰🇪 - For East African communities
- **Português** (pt) 🇧🇷 - For Brazilian and Portuguese-speaking communities
- **Türkçe** (tr) 🇹🇷 - For Turkish communities
- **Filipino** (tl) 🇵🇭 - For Filipino communities

## 🎯 How to Use Translations

### In React Components

```tsx
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('app.name')}</h1>
      <p>{t('app.description')}</p>
      <button>{t('common.save')}</button>
    </div>
  );
};
```

### With Variables/Interpolation

```tsx
// Translation with variables
const message = t('stacking.addedSats', { amount: 1000 });
// Result: "Added 1000 sats to your stack"

// Translation with count
const members = t('chamas.members', { count: 5 });
// Result: "5 members"
```

### Accessing Current Language

```tsx
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t, i18n } = useTranslation();
  
  const currentLanguage = i18n.language; // 'en', 'sw', 'pt', etc.
  
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };
};
```

## 🔧 Language Switcher

The language switcher is automatically included in the app header. Users can:

1. Click the language button (shows current language flag and name)
2. Select from the dropdown menu
3. Language preference is saved in localStorage
4. Page content updates immediately

## 📁 File Structure

```
src/
├── locales/
│   ├── en/
│   │   └── common.json
│   ├── sw/
│   │   └── common.json
│   ├── pt/
│   │   └── common.json
│   ├── tr/
│   │   └── common.json
│   └── tl/
│       └── common.json
├── lib/
│   └── i18n.ts
└── components/
    └── LanguageSwitcher.tsx
```

## 🎨 Translation Keys Structure

### App Information
- `app.name` - Application name
- `app.tagline` - Main tagline
- `app.description` - App description

### Navigation
- `navigation.dashboard` - Dashboard tab
- `navigation.stacking` - Personal Stacking tab
- `navigation.chamas` - Chama Circles tab
- `navigation.p2p` - P2P Sending tab
- `navigation.insights` - Finance Insights tab
- `navigation.education` - Learn tab
- `navigation.notifications` - Notifications tab

### Wallet
- `wallet.connect` - Connect wallet button
- `wallet.disconnect` - Disconnect button
- `wallet.connecting` - Connecting state
- `wallet.connected` - Connected state
- `wallet.notConnected` - Not connected message

### Common Actions
- `common.loading` - Loading text
- `common.error` - Error text
- `common.success` - Success text
- `common.save` - Save button
- `common.cancel` - Cancel button
- `common.confirm` - Confirm button

### Feature-Specific
- `stacking.*` - Personal stacking features
- `chamas.*` - Chama circles features
- `insights.*` - Financial insights
- `education.*` - Learning modules
- `p2p.*` - P2P sending features
- `notifications.*` - Notification system

## ➕ Adding New Languages

1. **Create language directory:**
   ```bash
   mkdir src/locales/[language-code]
   ```

2. **Add translation file:**
   ```bash
   cp src/locales/en/common.json src/locales/[language-code]/common.json
   ```

3. **Translate the content:**
   Edit the new JSON file with translations

4. **Update i18n configuration:**
   ```tsx
   // In src/lib/i18n.ts
   import newLangCommon from '../locales/[language-code]/common.json';
   
   const resources = {
     // ... existing languages
     [languageCode]: {
       common: newLangCommon,
     },
   };
   
   export const languages = [
     // ... existing languages
     { code: '[language-code]', name: 'Language Name', flag: '🏳️' },
   ];
   ```

## 🔄 Adding New Translation Keys

1. **Add to English (base) file:**
   ```json
   // src/locales/en/common.json
   {
     "newFeature": {
       "title": "New Feature",
       "description": "This is a new feature"
     }
   }
   ```

2. **Add to all other language files:**
   Translate and add the same key structure to all language files

3. **Use in components:**
   ```tsx
   const title = t('newFeature.title');
   const description = t('newFeature.description');
   ```

## 🎯 Best Practices

### 1. Key Naming
- Use descriptive, hierarchical keys: `feature.action.element`
- Group related translations: `stacking.dailyGoal`, `stacking.totalStacked`
- Use consistent naming patterns

### 2. Interpolation
- Use named parameters: `{{amount}}` instead of `{0}`
- Provide context in key names: `addedSats` vs `added`

### 3. Pluralization
- Use i18next pluralization features for count-dependent text
- Example: `"members": "{{count}} member", "members_plural": "{{count}} members"`

### 4. Context
- Provide context for translators in comments or separate files
- Consider cultural differences, not just language differences

### 5. Fallbacks
- Always provide English translations as fallback
- Test with missing translations to ensure graceful degradation

## 🧪 Testing Translations

1. **Switch languages in the UI** and verify all text updates
2. **Test with long translations** to ensure UI doesn't break
3. **Test interpolation** with various values
4. **Check RTL languages** if added (Arabic, Hebrew, etc.)

## 🌐 Cultural Considerations

### Swahili (Kenya/Tanzania)
- "Chama" is already a Swahili word for savings group
- Use formal/respectful language for financial contexts
- Consider mobile-first usage patterns

### Portuguese (Brazil)
- Use Brazilian Portuguese conventions
- Consider regional financial terminology
- Mobile usage is very common

### Turkish
- Formal language for financial applications
- Consider longer text due to language structure
- Mobile-first approach

### Filipino
- Mix of English and Filipino terms is acceptable
- "Chama" concept may need explanation
- Mobile-centric user base

## 🚀 Future Enhancements

- **Dynamic loading** of translation files
- **Professional translation** services integration
- **Community translation** platform
- **Regional variants** (e.g., European vs Brazilian Portuguese)
- **Currency formatting** per locale
- **Date/time formatting** per locale
- **Number formatting** per locale

## 📞 Support

For translation issues or to contribute new languages, please:
1. Open an issue on GitHub
2. Contact the development team
3. Join our community Discord for translation discussions

---

**Happy translating! 🌍✨**
