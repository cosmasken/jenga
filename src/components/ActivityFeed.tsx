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
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Mock data for demonstration - replace with real blockchain data
  useEffect(() => {
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'contribution',
        title: 'Payment Received',
        description: 'You received 0.001 cBTC from Family Savings',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        chamaName: 'Family Savings',
        amount: 0.001,
        currency: 'cBTC',
        isRead: false,
        priority: 'medium'
      },
      {
        id: '2',
        type: 'member_joined',
        title: 'New Member Joined',
        description: 'Alice joined your Friends Circle chama',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        chamaName: 'Friends Circle',
        isRead: false,
        priority: 'low'
      },
      {
        id: '3',
        type: 'round_completed',
        title: 'Round Completed',
        description: 'Round 3 of Family Savings has been completed',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        chamaName: 'Family Savings',
        isRead: true,
        priority: 'high'
      }
    ];
    
    setActivities(mockActivities);
    setUnreadCount(mockActivities.filter(a => !a.isRead).length);
  }, [userAddress]);

  const markAsRead = (activityId: string) => {\n    setActivities(prev => prev.map(activity => \n      activity.id === activityId \n        ? { ...activity, isRead: true }\n        : activity\n    ));\n    setUnreadCount(prev => Math.max(0, prev - 1));\n  };\n\n  const markAllAsRead = () => {\n    setActivities(prev => prev.map(activity => ({ ...activity, isRead: true })));\n    setUnreadCount(0);\n  };\n\n  const getActivityIcon = (type: string) => {\n    switch (type) {\n      case 'contribution': return <Coins className=\"h-4 w-4 text-green-600\" />;\n      case 'payout': return <TrendingUp className=\"h-4 w-4 text-bitcoin\" />;\n      case 'member_joined': return <Users className=\"h-4 w-4 text-blue-600\" />;\n      case 'round_completed': return <CheckCircle className=\"h-4 w-4 text-purple-600\" />;\n      case 'loan': return <Zap className=\"h-4 w-4 text-orange-600\" />;\n      case 'repayment': return <RefreshCw className=\"h-4 w-4 text-cyan-600\" />;\n      default: return <Activity className=\"h-4 w-4 text-gray-400\" />;\n    }\n  };\n\n  const getPriorityColor = (priority: string, isRead: boolean) => {\n    if (isRead) return 'text-gray-400';\n    switch (priority) {\n      case 'high': return 'text-red-600';\n      case 'medium': return 'text-orange-600';\n      case 'low': return 'text-gray-600';\n      default: return 'text-gray-600';\n    }\n  };\n\n  const formatTimeAgo = (date: Date) => {\n    const now = new Date();\n    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));\n    \n    if (diffInMinutes < 1) return 'Just now';\n    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;\n    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;\n    return `${Math.floor(diffInMinutes / 1440)}d ago`;\n  };\n\n  const displayedActivities = showAll ? activities : activities.slice(0, maxItems);\n\n  return (\n    <Card className=\"w-full\">\n      <CardHeader className=\"pb-3\">\n        <div className=\"flex items-center justify-between\">\n          <CardTitle className=\"flex items-center gap-2\">\n            <Activity className=\"h-5 w-5 text-bitcoin\" />\n            Recent Activity\n            {unreadCount > 0 && (\n              <Badge variant=\"secondary\" className=\"bg-red-100 text-red-700\">\n                {unreadCount}\n              </Badge>\n            )}\n          </CardTitle>\n          \n          <div className=\"flex items-center gap-2\">\n            {showNotifications && (\n              <Button\n                size=\"sm\"\n                variant=\"ghost\"\n                onClick={() => setNotificationsEnabled(!notificationsEnabled)}\n                title={notificationsEnabled ? \"Disable notifications\" : \"Enable notifications\"}\n              >\n                {notificationsEnabled ? (\n                  <Bell className=\"h-4 w-4 text-bitcoin\" />\n                ) : (\n                  <BellOff className=\"h-4 w-4 text-gray-400\" />\n                )}\n              </Button>\n            )}\n            \n            {unreadCount > 0 && (\n              <Button\n                size=\"sm\"\n                variant=\"ghost\"\n                onClick={markAllAsRead}\n                className=\"text-xs\"\n              >\n                Mark all read\n              </Button>\n            )}\n          </div>\n        </div>\n      </CardHeader>\n      \n      <CardContent className=\"p-0\">\n        {activities.length === 0 ? (\n          <div className=\"p-8 text-center\">\n            <Activity className=\"h-8 w-8 text-gray-400 mx-auto mb-3\" />\n            <p className=\"text-sm text-gray-600 dark:text-gray-400\">\n              No recent activity\n            </p>\n            <p className=\"text-xs text-gray-500 mt-1\">\n              Your chama contributions and transactions will appear here\n            </p>\n          </div>\n        ) : (\n          <div className=\"max-h-96 overflow-y-auto\">\n            <AnimatePresence>\n              {displayedActivities.map((activity, index) => (\n                <motion.div\n                  key={activity.id}\n                  initial={{ opacity: 0, x: -20 }}\n                  animate={{ opacity: 1, x: 0 }}\n                  exit={{ opacity: 0, x: 20 }}\n                  transition={{ delay: index * 0.05 }}\n                  className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${\n                    !activity.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''\n                  }`}\n                  onClick={() => {\n                    markAsRead(activity.id);\n                    onActivityClick?.(activity);\n                  }}\n                >\n                  <div className=\"flex items-start gap-3\">\n                    <div className={`mt-1 ${!activity.isRead ? 'opacity-100' : 'opacity-60'}`}>\n                      {getActivityIcon(activity.type)}\n                    </div>\n                    \n                    <div className=\"flex-1 min-w-0\">\n                      <div className=\"flex items-center gap-2 mb-1\">\n                        <h4 className={`font-medium text-sm ${\n                          !activity.isRead \n                            ? 'text-gray-900 dark:text-white' \n                            : 'text-gray-600 dark:text-gray-400'\n                        }`}>\n                          {activity.title}\n                        </h4>\n                        {!activity.isRead && (\n                          <div className=\"w-2 h-2 bg-bitcoin rounded-full\"></div>\n                        )}\n                      </div>\n                      \n                      <p className={`text-xs mb-2 ${\n                        !activity.isRead \n                          ? 'text-gray-600 dark:text-gray-300' \n                          : 'text-gray-500 dark:text-gray-500'\n                      }`}>\n                        {activity.description}\n                      </p>\n                      \n                      <div className=\"flex items-center justify-between\">\n                        <div className=\"flex items-center gap-2\">\n                          {activity.chamaName && (\n                            <Badge variant=\"outline\" className=\"text-xs\">\n                              {activity.chamaName}\n                            </Badge>\n                          )}\n                          {activity.amount && (\n                            <span className=\"text-xs font-medium text-bitcoin\">\n                              {activity.amount.toFixed(6)} {activity.currency}\n                            </span>\n                          )}\n                        </div>\n                        \n                        <span className=\"text-xs text-gray-500 flex items-center gap-1\">\n                          <Clock className=\"h-3 w-3\" />\n                          {formatTimeAgo(activity.timestamp)}\n                        </span>\n                      </div>\n                    </div>\n                  </div>\n                </motion.div>\n              ))}\n            </AnimatePresence>\n          </div>\n        )}\n        \n        {activities.length > maxItems && (\n          <div className=\"p-4 border-t border-gray-200 dark:border-gray-700\">\n            <Button\n              variant=\"ghost\"\n              onClick={() => setShowAll(!showAll)}\n              className=\"w-full text-sm\"\n            >\n              {showAll ? 'Show Less' : `Show ${activities.length - maxItems} More`}\n            </Button>\n          </div>\n        )}\n      </CardContent>\n    </Card>\n  );\n}\n\n// Live Status Indicator Component\nexport function LiveStatusIndicator({ \n  isConnected, \n  lastUpdate, \n  onReconnect \n}: { \n  isConnected: boolean; \n  lastUpdate?: Date;\n  onReconnect?: () => void;\n}) {\n  return (\n    <div className=\"flex items-center gap-2 text-xs\">\n      <div className={`w-2 h-2 rounded-full ${\n        isConnected \n          ? 'bg-green-500 animate-pulse' \n          : 'bg-red-500'\n      }`} />\n      <span className={isConnected ? 'text-green-600' : 'text-red-600'}>\n        {isConnected ? 'Live' : 'Disconnected'}\n      </span>\n      {lastUpdate && (\n        <span className=\"text-gray-500\">\n          • Updated {formatTimeAgo(lastUpdate)}\n        </span>\n      )}\n      {!isConnected && onReconnect && (\n        <Button size=\"sm\" variant=\"ghost\" onClick={onReconnect} className=\"h-5 px-2 text-xs\">\n          Reconnect\n        </Button>\n      )}\n    </div>\n  );\n}\n\n// Toast Notification Hook for real-time updates\nexport function useRealtimeNotifications(userAddress: string) {\n  const [isEnabled, setIsEnabled] = useState(true);\n\n  useEffect(() => {\n    if (!isEnabled || !userAddress) return;\n\n    // Mock WebSocket or polling implementation\n    const interval = setInterval(() => {\n      // This would be replaced with actual blockchain event listening\n      const shouldNotify = Math.random() < 0.1; // 10% chance for demo\n      \n      if (shouldNotify) {\n        const notifications = [\n          {\n            title: \"💰 Payment Received\",\n            description: \"You received 0.001 cBTC from Family Savings\"\n          },\n          {\n            title: \"👥 New Member\",\n            description: \"Alice joined your Friends Circle chama\"\n          },\n          {\n            title: \"🎯 Round Complete\", \n            description: \"Round 3 completed in Community Savers\"\n          }\n        ];\n        \n        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];\n        \n        toast({\n          title: randomNotification.title,\n          description: randomNotification.description,\n          duration: 5000,\n        });\n      }\n    }, 30000); // Check every 30 seconds\n\n    return () => clearInterval(interval);\n  }, [isEnabled, userAddress]);\n\n  return {\n    isEnabled,\n    toggle: () => setIsEnabled(prev => !prev)\n  };\n}\n\n// Helper function to format time ago\nfunction formatTimeAgo(date: Date): string {\n  const now = new Date();\n  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));\n  \n  if (diffInMinutes < 1) return 'Just now';\n  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;\n  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;\n  return `${Math.floor(diffInMinutes / 1440)}d ago`;\n}
