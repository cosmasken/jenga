/**
 * Notification Preferences Component
 * Allows users to configure notification settings
 */


import { motion } from 'framer-motion';
import { Settings, Bell, BellOff, Volume2, VolumeX, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useNotifications } from '@/hooks/use-notifications';
import { 
  NotificationType, 
  NotificationPriority 
} from '@/types/notifications';
import { EventType } from '@/types/events';

interface NotificationPreferencesProps {
  trigger?: React.ReactNode;
}

export function NotificationPreferences({ trigger }: NotificationPreferencesProps) {
  const { preferences, updatePreferences, resetPreferences } = useNotifications();

  const handleToggleType = (type: NotificationType, enabled: boolean) => {
    updatePreferences({
      types: {
        ...preferences.types,
        [type]: enabled
      }
    });
  };

  const handleToggleEvent = (event: EventType, enabled: boolean) => {
    updatePreferences({
      events: {
        ...preferences.events,
        [event]: enabled
      }
    });
  };

  const handleTogglePriority = (priority: NotificationPriority, enabled: boolean) => {
    updatePreferences({
      priority: {
        ...preferences.priority,
        [priority]: enabled
      }
    });
  };

  const defaultTrigger = (
    <Button variant="outline" size="icon">
      <Settings className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-bitcoin" />
            Notification Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Enable Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Turn on/off all notifications
                  </p>
                </div>
                <Switch
                  checked={preferences.enabled}
                  onCheckedChange={(enabled) => updatePreferences({ enabled })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Auto-expire Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically remove old notifications
                  </p>
                </div>
                <Switch
                  checked={preferences.autoExpire}
                  onCheckedChange={(autoExpire) => updatePreferences({ autoExpire })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Sound Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Play sound for new notifications
                  </p>
                </div>
                <Switch
                  checked={preferences.soundEnabled}
                  onCheckedChange={(soundEnabled) => updatePreferences({ soundEnabled })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Desktop Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Show browser notifications
                  </p>
                </div>
                <Switch
                  checked={preferences.desktopNotifications}
                  onCheckedChange={(desktopNotifications) => updatePreferences({ desktopNotifications })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(preferences.types).map(([type, enabled]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {type === NotificationType.SUCCESS && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Success</Badge>}
                      {type === NotificationType.ERROR && <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Error</Badge>}
                      {type === NotificationType.WARNING && <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Warning</Badge>}
                      {type === NotificationType.INFO && <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Info</Badge>}
                      {type === NotificationType.EVENT && <Badge className="bg-bitcoin/10 text-bitcoin">Event</Badge>}
                    </div>
                    <span className="text-sm capitalize">{type} notifications</span>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => handleToggleType(type as NotificationType, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Event Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ROSCA Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(preferences.events).map(([event, enabled]) => (
                <div key={event} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {event.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {getEventDescription(event as EventType)}
                    </p>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => handleToggleEvent(event as EventType, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Priority Levels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Priority Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(preferences.priority).map(([priority, enabled]) => (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={getPriorityBadgeColor(priority as NotificationPriority)}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Badge>
                    <span className="text-sm">
                      {getPriorityDescription(priority as NotificationPriority)}
                    </span>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => handleTogglePriority(priority as NotificationPriority, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={resetPreferences}
            >
              Reset to Defaults
            </Button>
            
            <div className="text-xs text-muted-foreground">
              Changes are saved automatically
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getEventDescription(event: EventType): string {
  switch (event) {
    case EventType.GROUP_CREATED:
      return 'When a new ROSCA group is created';
    case EventType.MEMBER_JOINED:
      return 'When someone joins your group';
    case EventType.CONTRIBUTION_MADE:
      return 'When contributions are made';
    case EventType.PAYOUT_DISTRIBUTED:
      return 'When payouts are distributed';
    case EventType.ROUND_COMPLETED:
      return 'When a round is completed';
    case EventType.GROUP_COMPLETED:
      return 'When a group cycle finishes';
    case EventType.NETWORK_CHANGED:
      return 'When network changes occur';
    case EventType.WALLET_CONNECTED:
      return 'When wallet is connected';
    case EventType.WALLET_DISCONNECTED:
      return 'When wallet is disconnected';
    case EventType.TRANSACTION_CONFIRMED:
      return 'When transactions are confirmed';
    case EventType.TRANSACTION_FAILED:
      return 'When transactions fail';
    default:
      return 'Event notifications';
  }
}

function getPriorityBadgeColor(priority: NotificationPriority): string {
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
}

function getPriorityDescription(priority: NotificationPriority): string {
  switch (priority) {
    case NotificationPriority.URGENT:
      return 'Critical notifications requiring immediate attention';
    case NotificationPriority.HIGH:
      return 'Important notifications you should see soon';
    case NotificationPriority.MEDIUM:
      return 'Regular notifications for general updates';
    case NotificationPriority.LOW:
      return 'Minor notifications and background updates';
    default:
      return 'Standard notifications';
  }
}
