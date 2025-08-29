import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface ActivityItem {
  id: string;
  type: 'contribution' | 'payout' | 'member_joined' | 'round_completed' | 'status_changed' | 'chama_created';
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

export function useActivityFeed(userAddress: string, maxItems: number = 10) {
  return useQuery({
    queryKey: ['activity-feed', userAddress, maxItems],
    queryFn: async (): Promise<ActivityItem[]> => {
      // Get events from chamas where user is a member or creator
      const { data: events, error } = await supabase
        .from('chama_events')
        .select(`
          *,
          chamas!inner(name, chain_address, creator_address),
          chama_members!inner(member_address, user_address)
        `)
        .or(`chamas.creator_address.eq.${userAddress},chama_members.member_address.eq.${userAddress},chama_members.user_address.eq.${userAddress}`)
        .order('created_at', { ascending: false })
        .limit(maxItems);

      if (error) {
        console.warn('Failed to fetch activity:', error);
        return [];
      }

      return (events || []).map(event => {
        const eventType = event.event_type;
        let title = '';
        let description = '';
        let priority: 'low' | 'medium' | 'high' = 'low';

        switch (eventType) {
          case 'chama_created':
            title = 'Chama Created';
            description = `New chama "${event.chamas.name}" was created`;
            priority = 'medium';
            break;
          case 'member_joined':
            title = 'Member Joined';
            description = `New member joined "${event.chamas.name}"`;
            priority = 'low';
            break;
          case 'status_changed':
            title = 'Status Updated';
            description = `"${event.chamas.name}" status changed to ${event.event_data?.new_status || 'updated'}`;
            priority = 'medium';
            break;
          case 'contribution_made':
            title = 'Contribution Made';
            description = `Contribution made to "${event.chamas.name}"`;
            priority = 'high';
            break;
          case 'round_started':
            title = 'Round Started';
            description = `New round started in "${event.chamas.name}"`;
            priority = 'high';
            break;
          default:
            title = 'Activity';
            description = `Activity in "${event.chamas.name}"`;
        }

        return {
          id: event.id,
          type: eventType as ActivityItem['type'],
          title,
          description,
          timestamp: new Date(event.created_at),
          chamaName: event.chamas.name,
          chamaAddress: event.chamas.chain_address,
          userAddress: event.actor_address,
          isRead: false, // Could be tracked in a separate table
          priority,
          currency: 'cBTC'
        };
      });
    },
    enabled: !!userAddress,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
