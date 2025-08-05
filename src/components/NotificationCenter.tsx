/**
 * Notification Center Component
 * Displays notification history with filtering and management
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter, 
  Search,
  Settings,
  ExternalLink,
  Bitcoin,
  Users,
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { 
  type Notification, 
  NotificationType, 
  NotificationPriority 
} from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const notifications = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<NotificationType[]>(Object.values(NotificationType));
  const [selectedPriorities, setSelectedPriorities] = useState<NotificationPriority[]>(Object.values(NotificationPriority));
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'recent'>('all');

  // Filter notifications based on search and filters
  const filteredNotifications = useMemo(() => {
    let filtered = notifications.notifications;

    // Filter by tab
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (activeTab === 'recent') {
      filtered = notifications.getRecentNotifications(24);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query)
      );
    }

    // Filter by type and priority
    filtered = filtered.filter(n => 
      selectedTypes.includes(n.type) &&
      selectedPriorities.includes(n.priority)
    );

    return filtered;
  }, [notifications.notifications, activeTab, searchQuery, selectedTypes, selectedPriorities, notifications]);

  const getNotificationIcon = (notification: Notification) => {
    switch (notification.type) {
      case NotificationType.SUCCESS:
        const successNotif = notification as any;
        if (successNotif.variant === 'contribution') return <Bitcoin className="h-4 w-4 text-bitcoin" />;
        if (successNotif.variant === 'payout') return <TrendingUp className="h-4 w-4 text-green-500" />;
        if (successNotif.variant === 'groupCreated') return <Users className="h-4 w-4 text-blue-500" />;
        return <Check className="h-4 w-4 text-green-500" />;
      case NotificationType.ERROR:
        return <X className="h-4 w-4 text-red-500" />;
      case NotificationType.WARNING:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case NotificationType.INFO:
        return <Info className="h-4 w-4 text-blue-500" />;
      case NotificationType.EVENT:
        return <Bell className="h-4 w-4 text-bitcoin" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case NotificationPriority.HIGH:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case NotificationPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case NotificationPriority.LOW:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-bitcoin" />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {notifications.unreadCount > 0 && (
                <Badge variant="secondary" className="bg-bitcoin/10 text-bitcoin">
                  {notifications.unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <NotificationPreferences />
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 space-y-3 border-b">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={notifications.markAllAsRead}
                  disabled={notifications.unreadCount === 0}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark All Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={notifications.clearAll}
                  disabled={notifications.notifications.length === 0}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>

              {/* Filter Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">Filter by Type</div>
                  {Object.values(NotificationType).map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTypes([...selectedTypes, type]);
                        } else {
                          setSelectedTypes(selectedTypes.filter(t => t !== type));
                        }
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-sm font-medium">Filter by Priority</div>
                  {Object.values(NotificationPriority).map((priority) => (
                    <DropdownMenuCheckboxItem
                      key={priority}
                      checked={selectedPriorities.includes(priority)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPriorities([...selectedPriorities, priority]);
                        } else {
                          setSelectedPriorities(selectedPriorities.filter(p => p !== priority));
                        }
                      }}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread {notifications.unreadCount > 0 && `(${notifications.unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="all" className="mt-0">
                <NotificationList 
                  notifications={filteredNotifications}
                  onMarkAsRead={notifications.markAsRead}
                  onRemove={notifications.removeNotification}
                  getIcon={getNotificationIcon}
                  getPriorityColor={getPriorityColor}
                />
              </TabsContent>
              <TabsContent value="unread" className="mt-0">
                <NotificationList 
                  notifications={filteredNotifications}
                  onMarkAsRead={notifications.markAsRead}
                  onRemove={notifications.removeNotification}
                  getIcon={getNotificationIcon}
                  getPriorityColor={getPriorityColor}
                />
              </TabsContent>
              <TabsContent value="recent" className="mt-0">
                <NotificationList 
                  notifications={filteredNotifications}
                  onMarkAsRead={notifications.markAsRead}
                  onRemove={notifications.removeNotification}
                  getIcon={getNotificationIcon}
                  getPriorityColor={getPriorityColor}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  getIcon: (notification: Notification) => React.ReactNode;
  getPriorityColor: (priority: NotificationPriority) => string;
}

function NotificationList({ 
  notifications, 
  onMarkAsRead, 
  onRemove, 
  getIcon, 
  getPriorityColor 
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No notifications</h3>
        <p className="text-sm text-muted-foreground/70">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
              notification.read 
                ? 'bg-muted/30 border-muted' 
                : 'bg-background border-bitcoin/20 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {notification.title}
                    </h4>
                    <p className={`text-xs mt-1 ${notification.read ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                      {notification.message}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getPriorityColor(notification.priority)}`}
                    >
                      {notification.priority}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {notification.action && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={notification.action.handler}
                        className="h-6 px-2 text-xs text-bitcoin hover:text-bitcoin-foreground hover:bg-bitcoin/10"
                      >
                        {notification.action.label}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                    
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkAsRead(notification.id)}
                        className="h-6 px-2 text-xs"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(notification.id)}
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
