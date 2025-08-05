/**
 * Notification Toast Component
 * Enhanced toast component with Bitcoin theming and notification integration
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  Bitcoin, 
  ExternalLink,
  Bell,
  TrendingUp,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  type Notification, 
  NotificationType, 
  NotificationPriority 
} from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
  onAction?: () => void;
  className?: string;
}

export function NotificationToast({ 
  notification, 
  onDismiss, 
  onAction,
  className = '' 
}: NotificationToastProps) {
  const getIcon = () => {
    switch (notification.type) {
      case NotificationType.SUCCESS:
        const successNotif = notification as any;
        if (successNotif.variant === 'contribution') return <Bitcoin className="h-5 w-5 text-bitcoin" />;
        if (successNotif.variant === 'payout') return <TrendingUp className="h-5 w-5 text-green-500" />;
        if (successNotif.variant === 'groupCreated') return <Users className="h-5 w-5 text-blue-500" />;
        return <Check className="h-5 w-5 text-green-500" />;
      case NotificationType.ERROR:
        return <X className="h-5 w-5 text-red-500" />;
      case NotificationType.WARNING:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case NotificationType.INFO:
        return <Info className="h-5 w-5 text-blue-500" />;
      case NotificationType.EVENT:
        return <Bell className="h-5 w-5 text-bitcoin" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case NotificationType.SUCCESS:
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case NotificationType.ERROR:
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case NotificationType.WARNING:
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case NotificationType.INFO:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case NotificationType.EVENT:
        return 'bg-bitcoin/5 border-bitcoin/20 dark:bg-bitcoin/10 dark:border-bitcoin/30';
      default:
        return 'bg-background border-border';
    }
  };

  const getPriorityIndicator = () => {
    if (notification.priority === NotificationPriority.URGENT) {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      );
    }
    if (notification.priority === NotificationPriority.HIGH) {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ 
        type: 'spring', 
        damping: 25, 
        stiffness: 300,
        duration: 0.3 
      }}
      className={`
        relative max-w-sm w-full rounded-lg border shadow-lg p-4
        ${getBackgroundColor()}
        ${className}
      `}
    >
      {getPriorityIndicator()}
      
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">
                {notification.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {notification.message}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
              </span>
              
              {notification.priority !== NotificationPriority.LOW && (
                <Badge 
                  variant="secondary" 
                  className="text-xs px-1.5 py-0.5 h-auto"
                >
                  {notification.priority}
                </Badge>
              )}
            </div>
            
            {notification.action && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  notification.action?.handler();
                  onAction?.();
                }}
                className="h-6 px-2 text-xs text-bitcoin hover:text-bitcoin-foreground hover:bg-bitcoin/10"
              >
                {notification.action.label}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {notification.expiresAt && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ 
            duration: (notification.expiresAt.getTime() - Date.now()) / 1000,
            ease: 'linear'
          }}
          className="absolute bottom-0 left-0 h-1 bg-bitcoin/30 rounded-b-lg"
        />
      )}
    </motion.div>
  );
}

/**
 * Notification Toast Container
 * Manages multiple toast notifications with stacking
 */
interface NotificationToastContainerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  maxVisible?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function NotificationToastContainer({ 
  notifications, 
  onDismiss,
  maxVisible = 5,
  position = 'top-right'
}: NotificationToastContainerProps) {
  const visibleNotifications = notifications.slice(0, maxVisible);
  const hiddenCount = Math.max(0, notifications.length - maxVisible);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className={`fixed z-50 ${getPositionClasses()} space-y-2`}>
      {visibleNotifications.map((notification, index) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1 - (index * 0.1), 
            scale: 1 - (index * 0.05),
            y: index * -8
          }}
          style={{ zIndex: maxVisible - index }}
        >
          <NotificationToast
            notification={notification}
            onDismiss={() => onDismiss(notification.id)}
          />
        </motion.div>
      ))}
      
      {hiddenCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Badge variant="secondary" className="text-xs">
            +{hiddenCount} more
          </Badge>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Compact Notification Toast for mobile
 */
export function CompactNotificationToast({ 
  notification, 
  onDismiss 
}: Pick<NotificationToastProps, 'notification' | 'onDismiss'>) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="flex items-center gap-3 bg-background border rounded-lg p-3 shadow-lg max-w-xs"
    >
      <div className="flex-shrink-0">
        {notification.type === NotificationType.SUCCESS && <Check className="h-4 w-4 text-green-500" />}
        {notification.type === NotificationType.ERROR && <X className="h-4 w-4 text-red-500" />}
        {notification.type === NotificationType.WARNING && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
        {notification.type === NotificationType.INFO && <Info className="h-4 w-4 text-blue-500" />}
        {notification.type === NotificationType.EVENT && <Bell className="h-4 w-4 text-bitcoin" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {notification.message}
        </p>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onDismiss}
        className="h-6 w-6 p-0 flex-shrink-0"
      >
        <X className="h-3 w-3" />
      </Button>
    </motion.div>
  );
}
