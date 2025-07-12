import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  BellRing, 
  Users, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { ChamaStatusCard } from './ChamaStatusCard';
import { useGetUserChamas } from '@/hooks/useJengaContract';
import { useAccount } from 'wagmi';
import { Address } from 'viem';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  chamaId?: bigint;
  read: boolean;
}

export const LiveChamaDashboard: React.FC = () => {
  const { address } = useAccount();
  const { data: userChamas, isLoading, refetch } = useGetUserChamas(address as Address);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const categorizeChamas = () => {
    if (!userChamas) return { recruiting: [], active: [], completed: [] };
    
    return userChamas.reduce((acc, chama) => {
      const memberCount = chama.members?.length || 0;
      const maxMembers = Number(chama.maxMembers);
      const isFull = memberCount >= maxMembers;
      const hasStarted = chama.currentCycle > 0n;
      
      if (!chama.active) {
        acc.completed.push(chama);
      } else if (!isFull) {
        acc.recruiting.push(chama);
      } else {
        acc.active.push(chama);
      }
      
      return acc;
    }, { recruiting: [] as any[], active: [] as any[], completed: [] as any[] });
  };

  const { recruiting, active, completed } = categorizeChamas();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Chamas</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your savings circles with real-time updates
          </p>
        </div>
        
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            {unreadCount > 0 ? (
              <BellRing className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto z-50 shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Notifications</CardTitle>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No notifications yet
                  </p>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        notification.read 
                          ? 'bg-gray-50 dark:bg-gray-800' 
                          : 'bg-blue-50 dark:bg-blue-950 border-blue-200'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-2">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Recruiting</p>
                <p className="text-xl font-bold">{recruiting.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-xl font-bold">{active.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-bold">{completed.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Live Updates</p>
                <p className="text-sm font-medium text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chama Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recruiting" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Recruiting ({recruiting.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Active ({active.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recruiting" className="space-y-4">
          {recruiting.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No chamas currently recruiting</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recruiting.map(chama => (
                <ChamaStatusCard
                  key={chama.id.toString()}
                  chamaId={chama.id}
                  userAddress={address}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {active.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No active chamas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {active.map(chama => (
                <ChamaStatusCard
                  key={chama.id.toString()}
                  chamaId={chama.id}
                  userAddress={address}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completed.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No completed chamas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completed.map(chama => (
                <ChamaStatusCard
                  key={chama.id.toString()}
                  chamaId={chama.id}
                  userAddress={address}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
