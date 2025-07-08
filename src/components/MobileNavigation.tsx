import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  Users, 
  Coins, 
  Send, 
  BookOpen, 
  Bell, 
  TrendingUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const MobileNavigation = ({ currentView, onViewChange }: MobileNavigationProps) => {
  const { t } = useTranslation();

  const navigationItems = [
    {
      value: 'dashboard',
      icon: BarChart3,
      label: t('navigation.dashboard'),
    },
    {
      value: 'chamas',
      icon: Users,
      label: t('navigation.chamas'),
    },
    {
      value: 'stacking',
      icon: Coins,
      label: t('navigation.stacking'),
    },
    {
      value: 'p2p',
      icon: Send,
      label: t('navigation.p2p'),
    },
    {
      value: 'learn',
      icon: BookOpen,
      label: t('navigation.education'),
    },
    {
      value: 'notifications',
      icon: Bell,
      label: t('navigation.notifications'),
    },
    {
      value: 'insights',
      icon: TrendingUp,
      label: t('navigation.insights'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border z-50 md:hidden">
      <div className="grid grid-cols-7 h-16">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.value;
          
          return (
            <button
              key={item.value}
              onClick={() => onViewChange(item.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 transition-colors",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="text-xs font-medium truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
