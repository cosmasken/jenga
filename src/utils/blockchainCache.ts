/**
 * Production-ready blockchain request cache
 * Handles rate limiting, stale-while-revalidate patterns, and optimistic updates
 */

import { requestCache } from './requestCache';

interface BlockchainCacheConfig {
  /**
   * Cache duration in milliseconds
   */
  cacheDuration: number;
  
  /**
   * Stale time - how long to serve stale data while revalidating
   */
  staleTime: number;
  
  /**
   * Background revalidation - update cache in background
   */
  backgroundRevalidate: boolean;
  
  /**
   * Retry configuration
   */
  retry: {
    attempts: number;
    delay: number;
    backoff: number;
  };
  
  /**
   * Dedupe similar requests
   */
  dedupe: boolean;
}

const DEFAULT_CONFIG: BlockchainCacheConfig = {
  cacheDuration: 30000, // 30 seconds
  staleTime: 10000, // 10 seconds
  backgroundRevalidate: true,
  retry: {
    attempts: 3,
    delay: 1000,
    backoff: 2,
  },
  dedupe: true,
};

// Cache configurations for different types of blockchain data
export const BLOCKCHAIN_CACHE_CONFIGS = {
  // Static/rarely changing data
  STATIC: {
    ...DEFAULT_CONFIG,
    cacheDuration: 300000, // 5 minutes
    staleTime: 60000, // 1 minute
  },
  
  // User membership status - semi-static
  MEMBERSHIP: {
    ...DEFAULT_CONFIG,
    cacheDuration: 60000, // 1 minute
    staleTime: 20000, // 20 seconds
  },
  
  // ROSCA status and round data - more dynamic
  ROSCA_STATUS: {
    ...DEFAULT_CONFIG,
    cacheDuration: 30000, // 30 seconds
    staleTime: 10000, // 10 seconds
  },
  
  // Live data like contributions, balances - most dynamic
  LIVE_DATA: {
    ...DEFAULT_CONFIG,
    cacheDuration: 15000, // 15 seconds
    staleTime: 5000, // 5 seconds
    backgroundRevalidate: true,
  },
  
  // Real-time data that changes frequently
  REAL_TIME: {
    ...DEFAULT_CONFIG,
    cacheDuration: 5000, // 5 seconds
    staleTime: 2000, // 2 seconds
    backgroundRevalidate: true,
  },
} as const;

class BlockchainCache {
  private backgroundTasks = new Map<string, NodeJS.Timeout>();
  private retryAttempts = new Map<string, number>();
  
  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: Partial<BlockchainCacheConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    // Check if data exists and handle stale-while-revalidate
    const cached = this.getCachedData<T>(key);
    const now = Date.now();
    
    if (cached) {
      const age = now - cached.timestamp;
      
      // Fresh data - return immediately
      if (age <= finalConfig.staleTime) {
        return cached.data;
      }
      
      // Stale but within cache duration - revalidate in background if enabled
      if (age <= finalConfig.cacheDuration && finalConfig.backgroundRevalidate) {
        this.revalidateInBackground(key, fetchFn, finalConfig);
        return cached.data; // Return stale data immediately
      }
    }
    
    // No cache or expired - fetch fresh data
    return this.fetchWithRetry(key, fetchFn, finalConfig);
  }
  
  private async fetchWithRetry<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: BlockchainCacheConfig
  ): Promise<T> {
    const attempts = this.retryAttempts.get(key) || 0;
    
    try {
      const data = await requestCache.getCachedOrFetch(fetchFn, {
        cacheKey: key,
        cacheDuration: config.cacheDuration,
      });
      
      // Reset retry counter on success
      this.retryAttempts.delete(key);
      return data;
    } catch (error) {
      if (attempts < config.retry.attempts) {
        this.retryAttempts.set(key, attempts + 1);
        const delay = config.retry.delay * Math.pow(config.retry.backoff, attempts);
        
        console.warn(`Blockchain request failed, retrying in ${delay}ms (attempt ${attempts + 1}/${config.retry.attempts})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(key, fetchFn, config);
      }
      
      // All retries failed
      this.retryAttempts.delete(key);
      throw error;
    }
  }
  
  private revalidateInBackground<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: BlockchainCacheConfig
  ): void {
    // Prevent multiple background tasks for the same key
    if (this.backgroundTasks.has(key)) return;
    
    const timeout = setTimeout(async () => {
      try {
        await this.fetchWithRetry(key, fetchFn, config);
        console.log(`Background revalidation successful for ${key}`);
      } catch (error) {
        console.warn(`Background revalidation failed for ${key}:`, error);
      } finally {
        this.backgroundTasks.delete(key);
      }
    }, 100); // Small delay to avoid blocking main thread
    
    this.backgroundTasks.set(key, timeout);
  }
  
  private getCachedData<T>(key: string): { data: T; timestamp: number } | null {
    const cached = (requestCache as any).cache.get(key);
    if (!cached) return null;
    
    return {
      data: cached.data,
      timestamp: cached.timestamp,
    };
  }
  
  /**
   * Batch multiple blockchain requests with intelligent caching
   */
  async batchGet<T>(
    requests: Array<{
      key: string;
      fetchFn: () => Promise<T>;
      config?: Partial<BlockchainCacheConfig>;
    }>
  ): Promise<T[]> {
    // Group requests by similar config/timing to optimize
    const grouped = this.groupRequestsByPriority(requests);
    const results: T[] = new Array(requests.length);
    
    // Execute high priority (real-time) requests first
    if (grouped.high.length > 0) {
      const highResults = await Promise.all(
        grouped.high.requests.map(({ key, fetchFn, config }) =>
          this.get(key, fetchFn, config)
        )
      );
      grouped.high.indices.forEach((index, i) => {
        results[index] = highResults[i];
      });
    }
    
    // Execute medium priority requests
    if (grouped.medium.length > 0) {
      const mediumResults = await Promise.all(
        grouped.medium.requests.map(({ key, fetchFn, config }) =>
          this.get(key, fetchFn, config)
        )
      );
      grouped.medium.indices.forEach((index, i) => {
        results[index] = mediumResults[i];
      });
    }
    
    // Execute low priority requests (can be done in background)
    if (grouped.low.length > 0) {
      const lowResults = await Promise.all(
        grouped.low.requests.map(({ key, fetchFn, config }) =>
          this.get(key, fetchFn, config)
        )
      );
      grouped.low.indices.forEach((index, i) => {
        results[index] = lowResults[i];
      });
    }
    
    return results;
  }
  
  private groupRequestsByPriority<T>(
    requests: Array<{
      key: string;
      fetchFn: () => Promise<T>;
      config?: Partial<BlockchainCacheConfig>;
    }>
  ) {
    const groups = {
      high: { requests: [] as any[], indices: [] as number[] },
      medium: { requests: [] as any[], indices: [] as number[] },
      low: { requests: [] as any[], indices: [] as number[] },
    };
    
    requests.forEach((request, index) => {
      const staleTime = request.config?.staleTime || DEFAULT_CONFIG.staleTime;
      
      if (staleTime <= 5000) {
        groups.high.requests.push(request);
        groups.high.indices.push(index);
      } else if (staleTime <= 20000) {
        groups.medium.requests.push(request);
        groups.medium.indices.push(index);
      } else {
        groups.low.requests.push(request);
        groups.low.indices.push(index);
      }
    });
    
    return groups;
  }
  
  /**
   * Invalidate cache for specific patterns
   */
  invalidate(pattern: string): void {
    requestCache.clearCache(pattern);
  }
  
  /**
   * Optimistic update - update cache immediately, then revalidate
   */
  optimisticUpdate<T>(key: string, data: T, revalidateFn?: () => Promise<T>): void {
    // Set cache directly
    (requestCache as any).setCache(key, data, Date.now() + 30000);
    
    // Revalidate in background if function provided
    if (revalidateFn) {
      setTimeout(async () => {
        try {
          await revalidateFn();
        } catch (error) {
          console.warn('Optimistic update revalidation failed:', error);
          // Could revert optimistic update here if needed
        }
      }, 100);
    }
  }
  
  cleanup(): void {
    // Clear all background tasks
    for (const [key, timeout] of this.backgroundTasks.entries()) {
      clearTimeout(timeout);
    }
    this.backgroundTasks.clear();
    this.retryAttempts.clear();
  }
}

// Global instance
export const blockchainCache = new BlockchainCache();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    blockchainCache.cleanup();
  });
}

/**
 * Helper functions for common blockchain data patterns
 */
export function createChamaDataKey(operation: string, chamaAddress: string, ...params: any[]): string {
  return `chama:${operation}:${chamaAddress}:${params.join(':')}`;
}

export function createUserDataKey(operation: string, userAddress: string, ...params: any[]): string {
  return `user:${operation}:${userAddress}:${params.join(':')}`;
}

/**
 * Specialized functions for common patterns
 */
export async function getChamaBasicInfo(chamaAddress: string, fetchFn: () => Promise<any>) {
  return blockchainCache.get(
    createChamaDataKey('info', chamaAddress),
    fetchFn,
    BLOCKCHAIN_CACHE_CONFIGS.STATIC
  );
}

export async function getUserMembership(chamaAddress: string, userAddress: string, fetchFn: () => Promise<boolean>) {
  return blockchainCache.get(
    createUserDataKey('membership', userAddress, chamaAddress),
    fetchFn,
    BLOCKCHAIN_CACHE_CONFIGS.MEMBERSHIP
  );
}

export async function getRoscaStatus(chamaAddress: string, fetchFn: () => Promise<any>) {
  return blockchainCache.get(
    createChamaDataKey('status', chamaAddress),
    fetchFn,
    BLOCKCHAIN_CACHE_CONFIGS.ROSCA_STATUS
  );
}

export async function getLiveData(key: string, fetchFn: () => Promise<any>) {
  return blockchainCache.get(key, fetchFn, BLOCKCHAIN_CACHE_CONFIGS.LIVE_DATA);
}
