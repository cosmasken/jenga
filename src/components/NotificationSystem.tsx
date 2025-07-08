import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  BellOff, 
  Clock, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyNotifications, EmptyWalletConnection } from '@/components/ui/empty-state';
import { useAccount } from 'wagmi';

interface Notification {
  id: string;
  type: 'reminder' | 'achievement' | 'chama' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
  action?: () => void;
  actionText?: string;
}

interface NotificationSettings {
  weeklyReminders: boolean;
  chamaUpdates: boolean;
  achievements: boolean;
  systemAlerts: boolean;
  pushNotifications: boolean;
}

export const NotificationSystem = () => {
  const { isConnected } = useAccount();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<NotificationSettings>({
    weeklyReminders: true,
    chamaUpdates: true,
    achievements: true,
    systemAlerts: true,
    pushNotifications: false
  });

  const [showSettings, setShowSettings] = useState(false);

  // Load notifications from API or local storage
  useEffect(() => {
    if (isConnected) {
      loadNotifications();
    }
  }, [isConnected]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from your API
      // For now, we'll just simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load from localStorage or API
      const stored = localStorage.getItem('jenga-notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      }
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setError(null);
    await loadNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('jenga-notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('jenga-notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Clock className="w-4 h-4" />;
      case 'achievement': return <TrendingUp className="w-4 h-4" />;
      case 'chama': return <Users className="w-4 h-4" />;
      case 'system': return <AlertCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'text-orange-600 bg-orange-100';
      case 'achievement': return 'text-green-600 bg-green-100';
      case 'chama': return 'text-blue-600 bg-blue-100';
      case 'system': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && settings.pushNotifications) {
      Notification.requestPermission();
    }
  }, [settings.pushNotifications]);

  // Show appropriate states
  if (!isConnected) {
    return (
      <EmptyWalletConnection 
        onConnect={() => console.log('Connect wallet')}
      />
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 text-muted-foreground animate-spin" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return <EmptyNotifications onRefresh={handleRefresh} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h2 className="font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          Settings
        </Button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {key === 'weeklyReminders' && 'Get reminded about weekly contributions'}
                        {key === 'chamaUpdates' && 'Updates about your chama activities'}
                        {key === 'achievements' && 'Celebrate your milestones'}
                        {key === 'systemAlerts' && 'Important system notifications'}
                        {key === 'pushNotifications' && 'Browser push notifications'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BellOff className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground">No new notifications</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.read ? 'border-orange-200 bg-orange-50/30' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {notification.message}
                      </p>
                      
                      {notification.actionable && (
                        <Button size="sm" variant="outline">
                          {notification.actionText}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
