/**
 * Event Monitor Service
 * Monitors blockchain events and converts them to notifications
 */

import { createPublicClient, http, parseAbi, type Log, type Address } from 'viem';
import { citreaTestnet } from '@/lib/citrea-testnet';
import { 
  type BlockchainEvent, 
  EventType, 
  type EventFilter,
  type GroupCreatedEvent,
  type MemberJoinedEvent,
  type ContributionMadeEvent,
  type PayoutDistributedEvent,
  type RoundCompletedEvent,
  type GroupCompletedEvent
} from '@/types/events';

// ROSCA Contract ABI (events only)
const ROSCA_EVENTS_ABI = parseAbi([
  'event GroupCreated(uint256 indexed groupId, address indexed creator, uint256 contribution, uint256 maxMembers, uint256 cycleDuration)',
  'event MemberJoined(uint256 indexed groupId, address indexed member, uint256 memberCount)',
  'event ContributionMade(uint256 indexed groupId, address indexed member, uint256 amount, uint256 round)',
  'event PayoutDistributed(uint256 indexed groupId, address indexed recipient, uint256 amount, uint256 round)',
  'event RoundCompleted(uint256 indexed groupId, uint256 round, address indexed nextRecipient)',
  'event GroupCompleted(uint256 indexed groupId, uint256 totalSaved)'
]);

export interface EventMonitorConfig {
  contractAddress: Address;
  rpcUrl: string;
  pollingInterval: number; // milliseconds
  fromBlock: bigint;
  batchSize: number;
}

export type EventCallback = (event: BlockchainEvent) => void;

export class EventMonitorService {
  private static instance: EventMonitorService;
  private client: ReturnType<typeof createPublicClient>;
  private config: EventMonitorConfig;
  private callbacks: Map<EventType, EventCallback[]> = new Map();
  private isMonitoring = false;
  private lastProcessedBlock: bigint = 0n;
  private pollingTimer?: NodeJS.Timeout;

  constructor(config: EventMonitorConfig) {
    this.config = config;
    this.client = createPublicClient({
      chain: citreaTestnet,
      transport: http(config.rpcUrl)
    });
    this.lastProcessedBlock = config.fromBlock;
  }

  public static getInstance(config?: EventMonitorConfig): EventMonitorService {
    if (!EventMonitorService.instance && config) {
      EventMonitorService.instance = new EventMonitorService(config);
    }
    return EventMonitorService.instance;
  }

  /**
   * Start monitoring blockchain events
   */
  public async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    console.log('🔍 Starting event monitoring...');
    this.isMonitoring = true;

    // Get current block number
    try {
      const currentBlock = await this.client.getBlockNumber();
      if (this.lastProcessedBlock === 0n) {
        this.lastProcessedBlock = currentBlock - 100n; // Start from 100 blocks ago
      }
    } catch (error) {
      console.error('Failed to get current block number:', error);
    }

    // Start polling for events
    this.startPolling();
  }

  /**
   * Stop monitoring blockchain events
   */
  public stopMonitoring(): void {
    console.log('⏹️ Stopping event monitoring...');
    this.isMonitoring = false;
    
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = undefined;
    }
  }

  /**
   * Subscribe to specific event types
   */
  public subscribe(eventType: EventType, callback: EventCallback): () => void {
    if (!this.callbacks.has(eventType)) {
      this.callbacks.set(eventType, []);
    }
    
    this.callbacks.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Get events for a specific user
   */
  public async getUserEvents(
    userAddress: Address, 
    filter: Partial<EventFilter> = {}
  ): Promise<BlockchainEvent[]> {
    const fromBlock = filter.fromBlock ? BigInt(filter.fromBlock) : this.lastProcessedBlock - 1000n;
    const toBlock = filter.toBlock ? BigInt(filter.toBlock) : await this.client.getBlockNumber();

    try {
      const logs = await this.client.getLogs({
        address: this.config.contractAddress,
        events: ROSCA_EVENTS_ABI,
        fromBlock,
        toBlock,
        strict: true
      });

      const events: BlockchainEvent[] = [];

      for (const log of logs) {
        const event = await this.parseLogToEvent(log, userAddress);
        if (event && this.isUserRelevantEvent(event, userAddress)) {
          events.push(event);
        }
      }

      return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Failed to get user events:', error);
      return [];
    }
  }

  /**
   * Start polling for new events
   */
  private startPolling(): void {
    const poll = async () => {
      if (!this.isMonitoring) return;

      try {
        await this.processNewEvents();
      } catch (error) {
        console.error('Error processing events:', error);
      }

      // Schedule next poll
      this.pollingTimer = setTimeout(poll, this.config.pollingInterval);
    };

    poll();
  }

  /**
   * Process new events since last check
   */
  private async processNewEvents(): Promise<void> {
    try {
      const currentBlock = await this.client.getBlockNumber();
      
      if (currentBlock <= this.lastProcessedBlock) {
        return; // No new blocks
      }

      const fromBlock = this.lastProcessedBlock + 1n;
      const toBlock = currentBlock;

      const logs = await this.client.getLogs({
        address: this.config.contractAddress,
        events: ROSCA_EVENTS_ABI,
        fromBlock,
        toBlock,
        strict: true
      });

      // Process each log
      for (const log of logs) {
        const event = await this.parseLogToEvent(log);
        if (event) {
          this.emitEvent(event);
        }
      }

      this.lastProcessedBlock = currentBlock;
    } catch (error) {
      console.error('Failed to process new events:', error);
    }
  }

  /**
   * Parse a log entry to a blockchain event
   */
  private async parseLogToEvent(log: Log, userAddress?: Address): Promise<BlockchainEvent | null> {
    try {
      const block = await this.client.getBlock({ blockNumber: log.blockNumber! });
      const timestamp = new Date(Number(block.timestamp) * 1000);

      const baseEvent = {
        id: `${log.transactionHash}_${log.logIndex}`,
        timestamp,
        blockNumber: Number(log.blockNumber!),
        transactionHash: log.transactionHash!,
        userAddress
      };

      switch (log.eventName) {
        case 'GroupCreated': {
          const { groupId, creator, contribution, maxMembers, cycleDuration } = log.args as any;
          return {
            ...baseEvent,
            type: EventType.GROUP_CREATED,
            data: {
              groupId,
              creator,
              contribution,
              maxMembers: Number(maxMembers),
              cycleDuration: Number(cycleDuration)
            }
          } as GroupCreatedEvent;
        }

        case 'MemberJoined': {
          const { groupId, member, memberCount } = log.args as any;
          return {
            ...baseEvent,
            type: EventType.MEMBER_JOINED,
            data: {
              groupId,
              member,
              memberCount: Number(memberCount)
            }
          } as MemberJoinedEvent;
        }

        case 'ContributionMade': {
          const { groupId, member, amount, round } = log.args as any;
          return {
            ...baseEvent,
            type: EventType.CONTRIBUTION_MADE,
            data: {
              groupId,
              member,
              amount,
              round: Number(round)
            }
          } as ContributionMadeEvent;
        }

        case 'PayoutDistributed': {
          const { groupId, recipient, amount, round } = log.args as any;
          return {
            ...baseEvent,
            type: EventType.PAYOUT_DISTRIBUTED,
            data: {
              groupId,
              recipient,
              amount,
              round: Number(round)
            }
          } as PayoutDistributedEvent;
        }

        case 'RoundCompleted': {
          const { groupId, round, nextRecipient } = log.args as any;
          return {
            ...baseEvent,
            type: EventType.ROUND_COMPLETED,
            data: {
              groupId,
              round: Number(round),
              nextRecipient
            }
          } as RoundCompletedEvent;
        }

        case 'GroupCompleted': {
          const { groupId, totalSaved } = log.args as any;
          return {
            ...baseEvent,
            type: EventType.GROUP_COMPLETED,
            data: {
              groupId,
              totalSaved
            }
          } as GroupCompletedEvent;
        }

        default:
          console.warn('Unknown event type:', log.eventName);
          return null;
      }
    } catch (error) {
      console.error('Failed to parse log to event:', error);
      return null;
    }
  }

  /**
   * Check if an event is relevant to a specific user
   */
  private isUserRelevantEvent(event: BlockchainEvent, userAddress: Address): boolean {
    switch (event.type) {
      case EventType.GROUP_CREATED:
        return (event as GroupCreatedEvent).data.creator.toLowerCase() === userAddress.toLowerCase();
      
      case EventType.MEMBER_JOINED:
        return (event as MemberJoinedEvent).data.member.toLowerCase() === userAddress.toLowerCase();
      
      case EventType.CONTRIBUTION_MADE:
        return (event as ContributionMadeEvent).data.member.toLowerCase() === userAddress.toLowerCase();
      
      case EventType.PAYOUT_DISTRIBUTED:
        return (event as PayoutDistributedEvent).data.recipient.toLowerCase() === userAddress.toLowerCase();
      
      case EventType.ROUND_COMPLETED:
      case EventType.GROUP_COMPLETED:
        // These events are relevant to all group members
        // TODO: Check if user is a member of the group
        return true;
      
      default:
        return false;
    }
  }

  /**
   * Emit an event to all subscribers
   */
  private emitEvent(event: BlockchainEvent): void {
    const callbacks = this.callbacks.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  /**
   * Get monitoring status
   */
  public getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      lastProcessedBlock: this.lastProcessedBlock,
      subscriberCount: Array.from(this.callbacks.values()).reduce((sum, callbacks) => sum + callbacks.length, 0)
    };
  }
}
