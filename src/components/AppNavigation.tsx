import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface AppNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const AppNavigation = ({ currentView, onViewChange }: AppNavigationProps) => {
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
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <Tabs value={currentView} onValueChange={onViewChange} className="w-full">
          <TabsList className="grid w-full grid-cols-7 h-14 bg-transparent border-0 p-0">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="flex items-center gap-2 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent hover:bg-muted/50 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {item.label}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
    </nav>
  );
};
