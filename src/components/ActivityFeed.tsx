import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bell, 
  BellOff, 
  Activity, 
  Users, 
  Coins, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Gift,
  Zap,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { useActivityFeed } from '@/hooks/useActivityFeed';

interface ActivityItem {
  id: string;
  type: 'contribution' | 'payout' | 'member_joined' | 'round_completed' | 'loan' | 'repayment';
  title: string;
  description: string;
  timestamp: Date;
  chamaName?: string;
  chamaAddress?: string;
  amount?: number;
  currency?: string;
  userAddress?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface ActivityFeedProps {
  userAddress: string;
  onActivityClick?: (activity: ActivityItem) => void;
  showNotifications?: boolean;
  maxItems?: number;
}

export function ActivityFeed({ 
  userAddress, 
  onActivityClick,
  showNotifications = true,
  maxItems = 10 
}: ActivityFeedProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Fetch real activity data from database
  const { data: activities = [], isLoading, error, refetch } = useActivityFeed(userAddress, maxItems);

  // Update unread count when activities change
  useEffect(() => {
    setUnreadCount(activities.filter(a => !a.isRead).length);
  }, [activities]);

  const handleRefresh = () => {
    refetch();
  };

  const markAsRead = (activityId: string) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, isRead: true }
        : activity
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setActivities(prev => prev.map(activity => ({ ...activity, isRead: true })));
    setUnreadCount(0);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contribution': return <Coins className="h-4 w-4 text-green-600" />;
      case 'payout': return <TrendingUp className="h-4 w-4 text-bitcoin" />;
      case 'member_joined': return <Users className="h-4 w-4 text-blue-600" />;
      case 'round_completed': return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case 'loan': return <Zap className="h-4 w-4 text-orange-600" />;
      case 'repayment': return <RefreshCw className="h-4 w-4 text-cyan-600" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string, isRead: boolean) => {
    if (isRead) return 'text-gray-400';
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const displayedActivities = showAll ? activities : activities.slice(0, maxItems);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-bitcoin" />
            Recent Activity
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                {unreadCount}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="ml-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {showNotifications && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
              >
                {notificationsEnabled ? (
                  <Bell className="h-4 w-4 text-bitcoin" />
                ) : (
                  <BellOff className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            )}
            
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No recent activity
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Your chama contributions and transactions will appear here
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <AnimatePresence>
              {displayedActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    !activity.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                  onClick={() => {
                    markAsRead(activity.id);
                    onActivityClick?.(activity);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${!activity.isRead ? 'opacity-100' : 'opacity-60'}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium text-sm ${
                          !activity.isRead 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {activity.title}
                        </h4>
                        {!activity.isRead && (
                          <div className="w-2 h-2 bg-bitcoin rounded-full"></div>
                        )}
                      </div>
                      
                      <p className={`text-xs mb-2 ${
                        !activity.isRead 
                          ? 'text-gray-600 dark:text-gray-300' 
                          : 'text-gray-500 dark:text-gray-500'
                      }`}>
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {activity.chamaName && (
                            <Badge variant="outline" className="text-xs">
                              {activity.chamaName}
                            </Badge>
                          )}
                          {activity.amount && (
                            <span className="text-xs font-medium text-bitcoin">
                              {activity.amount.toFixed(6)} {activity.currency}
                            </span>
                          )}
                        </div>
                        
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {activities.length > maxItems && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
              className="w-full text-sm"
            >
              {showAll ? 'Show Less' : `Show ${activities.length - maxItems} More`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Live Status Indicator Component
export function LiveStatusIndicator({ 
  isConnected, 
  lastUpdate, 
  onReconnect 
}: { 
  isConnected: boolean; 
  lastUpdate?: Date;
  onReconnect?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${
        isConnected 
          ? 'bg-green-500 animate-pulse' 
          : 'bg-red-500'
      }`} />
      <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
        {isConnected ? 'Live' : 'Disconnected'}
      </span>
      {lastUpdate && (
        <span className="text-gray-500">
          • Updated {formatTimeAgo(lastUpdate)}
        </span>
      )}
      {!isConnected && onReconnect && (
        <Button size="sm" variant="ghost" onClick={onReconnect} className="h-5 px-2 text-xs">
          Reconnect
        </Button>
      )}
    </div>
  );
}

// Toast Notification Hook for real-time updates
export function useRealtimeNotifications(userAddress: string) {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (!isEnabled || !userAddress) return;

    // Mock WebSocket or polling implementation
    const interval = setInterval(() => {
      // This would be replaced with actual blockchain event listening
      const shouldNotify = Math.random() < 0.1; // 10% chance for demo
      
      if (shouldNotify) {
        const notifications = [
          {
            title: "💰 Payment Received",
            description: "You received 0.001 cBTC from Family Savings"
          },
          {
            title: "👥 New Member",
            description: "Alice joined your Friends Circle chama"
          },
          {
            title: "🎯 Round Complete", 
            description: "Round 3 completed in Community Savers"
          }
        ];
        
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        
        toast({
          title: randomNotification.title,
          description: randomNotification.description,
          duration: 5000,
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isEnabled, userAddress]);

  return {
    isEnabled,
    toggle: () => setIsEnabled(prev => !prev)
  };
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
}
