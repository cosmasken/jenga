import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Example component demonstrating how to use the localization system
 * This component shows various translation patterns and best practices
 */
export const LocalizationExample = () => {
  const { t, i18n } = useTranslation();

  // Example of using translations with variables
  const handleStackSats = (amount: number) => {
    // This would show: "Added 1000 sats to your stack" in English
    // or "Imeongeza 1000 sats kwenye mkusanyo wako" in Swahili
    const message = t('stacking.addedSats', { amount });
    console.log(message);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {/* Basic translation */}
          {t('app.name')}
          
          {/* Show current language */}
          <Badge variant="outline">
            {i18n.language.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* App description */}
        <p className="text-sm text-muted-foreground">
          {t('app.description')}
        </p>

        {/* Navigation examples */}
        <div className="space-y-2">
          <h4 className="font-semibold">{t('navigation.dashboard')}</h4>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              {t('navigation.stacking')}
            </Button>
            <Button variant="outline" size="sm">
              {t('navigation.chamas')}
            </Button>
            <Button variant="outline" size="sm">
              {t('navigation.p2p')}
            </Button>
          </div>
        </div>

        {/* Common actions */}
        <div className="flex gap-2">
          <Button 
            onClick={() => handleStackSats(1000)}
            className="flex-1"
          >
            {t('stacking.stackSats')}
          </Button>
          <Button variant="outline" className="flex-1">
            {t('common.cancel')}
          </Button>
        </div>

        {/* Wallet status example */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>{t('wallet.connect')}:</strong> {t('wallet.notConnected')}
          </p>
        </div>

        {/* Language switching example */}
        <div className="text-xs text-muted-foreground">
          <p>
            <strong>{t('common.language')}:</strong> {i18n.language}
          </p>
          <p>
            Switch languages using the language selector in the header
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Example of how to use translations in different scenarios
export const TranslationPatterns = {
  // Basic translation
  basic: () => {
    const { t } = useTranslation();
    return t('app.name');
  },

  // Translation with variables
  withVariables: (amount: number) => {
    const { t } = useTranslation();
    return t('stacking.addedSats', { amount });
  },

  // Translation with count (pluralization)
  withCount: (count: number) => {
    const { t } = useTranslation();
    return t('chamas.members', { count });
  },

  // Conditional translation
  conditional: (isConnected: boolean) => {
    const { t } = useTranslation();
    return isConnected ? t('wallet.connected') : t('wallet.notConnected');
  },

  // Getting current language
  getCurrentLanguage: () => {
    const { i18n } = useTranslation();
    return i18n.language;
  },

  // Changing language programmatically
  changeLanguage: (languageCode: string) => {
    const { i18n } = useTranslation();
    i18n.changeLanguage(languageCode);
  },
};
