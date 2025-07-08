import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simpleAuth';

export const AppHeader = () => {
  const { isAuthenticated, user, logout, dynamicUser } = useSimpleAuth();
  const { t } = useTranslation();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Brand Section */}
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            {t('app.name')}
          </div>
          <Badge variant="secondary" className="hidden md:inline-flex">
            Beta
          </Badge>
        </div>

        {/* Tagline - Hidden on mobile */}
        <div className="hidden lg:block text-sm text-muted-foreground max-w-md text-center">
          {t('app.tagline')}
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* User indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
                <Wallet className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">
                  {user?.username || user?.first_name || dynamicUser?.firstName || 'Connected'}
                </span>
              </div>
              
              <Button 
                onClick={logout}
                variant="outline"
                size="sm"
              >
                {t('wallet.disconnect')}
              </Button>
            </div>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              {t('wallet.notConnected')}
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
};
