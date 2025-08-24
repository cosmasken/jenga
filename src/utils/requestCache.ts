/**
 * Request Caching and Rate Limiting Utility
 * Prevents excessive API calls to Blast API and other RPC endpoints
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface RequestConfig {
  cacheKey: string;
  cacheDuration?: number; // in milliseconds
  forceRefresh?: boolean;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private lastRequestTimes = new Map<string, number>();
  
  // Rate limiting configuration
  private readonly MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
  private readonly DEFAULT_CACHE_DURATION = 30000; // 30 seconds default cache
  private readonly MAX_CACHE_SIZE = 1000;

  /**
   * Get cached data or execute request with caching and rate limiting
   */
  async getCachedOrFetch<T>(
    requestFn: () => Promise<T>,
    config: RequestConfig
  ): Promise<T> {
    const { cacheKey, cacheDuration = this.DEFAULT_CACHE_DURATION, forceRefresh = false } = config;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached !== null) {
        console.log(`📦 Cache hit for ${cacheKey}`);
        return cached;
      }
    }

    // Check if request is already pending
    const pendingRequest = this.pendingRequests.get(cacheKey);
    if (pendingRequest) {
      console.log(`⏳ Request already pending for ${cacheKey}`);
      return pendingRequest;
    }

    // Rate limiting check
    await this.enforceRateLimit(cacheKey);

    // Execute request with caching
    const requestPromise = this.executeWithCache(requestFn, cacheKey, cacheDuration);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Get data from cache if valid
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Execute request and cache result
   */
  private async executeWithCache<T>(
    requestFn: () => Promise<T>,
    cacheKey: string,
    cacheDuration: number
  ): Promise<T> {
    console.log(`🌐 Making request for ${cacheKey}`);
    
    try {
      const result = await requestFn();
      
      // Cache the result
      const now = Date.now();
      this.setCache(cacheKey, result, now + cacheDuration);
      
      // Update last request time
      this.lastRequestTimes.set(cacheKey, now);
      
      console.log(`✅ Request completed and cached for ${cacheKey}`);
      return result;
    } catch (error) {
      console.error(`❌ Request failed for ${cacheKey}:`, error);
      throw error;
    }
  }

  /**
   * Enforce rate limiting between requests
   */
  private async enforceRateLimit(key: string): Promise<void> {
    const lastRequestTime = this.lastRequestTimes.get(key);
    if (!lastRequestTime) return;

    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏱️ Rate limiting: waiting ${waitTime}ms before next request to ${key}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Set cache entry with size management
   */
  private setCache<T>(key: string, data: T, expiresAt: number): void {
    // Manage cache size
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanupExpiredEntries();
      
      // If still too large, remove oldest entries
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2));
        toRemove.forEach(([key]) => this.cache.delete(key));
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt
    });
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear cache for specific key or all cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
      console.log(`🗑️ Cleared cache for ${key}`);
    } else {
      this.cache.clear();
      this.pendingRequests.clear();
      this.lastRequestTimes.clear();
      console.log('🗑️ Cleared all cache');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    const validEntries = Array.from(this.cache.values()).filter(entry => now <= entry.expiresAt);
    
    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      pendingRequests: this.pendingRequests.size,
      lastRequestTimes: this.lastRequestTimes.size
    };
  }

  /**
   * Create cache key from parameters
   */
  static createKey(prefix: string, ...params: (string | number | boolean)[]): string {
    return `${prefix}:${params.join(':')}`;
  }
}

// Global cache instance
export const requestCache = new RequestCache();

/**
 * Cached blockchain read function
 */
export async function cachedBlockchainRead<T>(
  requestFn: () => Promise<T>,
  cacheKey: string,
  options: {
    cacheDuration?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<T> {
  return requestCache.getCachedOrFetch(requestFn, {
    cacheKey,
    ...options
  });
}

/**
 * Create cache key for ROSCA operations
 */
export function createROSCACacheKey(operation: string, address: string, ...params: any[]): string {
  return RequestCache.createKey(`rosca:${operation}`, address, ...params);
}

/**
 * Create cache key for user operations
 */
export function createUserCacheKey(operation: string, userAddress: string, ...params: any[]): string {
  return RequestCache.createKey(`user:${operation}`, userAddress, ...params);
}

/**
 * Batch cache operations for multiple requests
 */
export async function batchCachedRequests<T>(
  requests: Array<{
    fn: () => Promise<T>;
    key: string;
    cacheDuration?: number;
  }>
): Promise<T[]> {
  const promises = requests.map(({ fn, key, cacheDuration }) =>
    requestCache.getCachedOrFetch(fn, { cacheKey: key, cacheDuration })
  );
  
  return Promise.all(promises);
}

/**
 * Hook for cache management in React components
 */
export function useCacheManager() {
  const clearCache = (key?: string) => requestCache.clearCache(key);
  const getCacheStats = () => requestCache.getCacheStats();
  
  return {
    clearCache,
    getCacheStats,
    requestCache
  };
}
