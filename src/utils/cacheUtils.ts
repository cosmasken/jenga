/**
 * Cache management utilities for ROSCA data
 */

export function clearROSCACache(chamaAddress?: string) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  
  try {
    const keys = Object.keys(localStorage);
    
    if (chamaAddress) {
      // Clear cache for specific ROSCA
      const targetKeys = keys.filter(key => 
        key.includes(chamaAddress.toLowerCase()) ||
        key.includes(`rosca:info:${chamaAddress.toLowerCase()}`) ||
        key.includes(`rosca:status:${chamaAddress.toLowerCase()}`)
      );
      
      targetKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Cleared cache key: ${key}`);
      });
      
      console.log(`✅ Cleared ${targetKeys.length} cache entries for ROSCA: ${chamaAddress}`);
    } else {
      // Clear all ROSCA-related cache
      const roscaKeys = keys.filter(key => 
        key.includes('rosca:') || 
        key.includes('user:rosca') ||
        key.includes('0x') // Ethereum addresses
      );
      
      roscaKeys.forEach(key => localStorage.removeItem(key));
      console.log(`✅ Cleared ${roscaKeys.length} ROSCA cache entries`);
    }
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

export function clearUserCache(userAddress?: string) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  
  try {
    const keys = Object.keys(localStorage);
    
    if (userAddress) {
      const userKeys = keys.filter(key => 
        key.includes(userAddress.toLowerCase()) ||
        key.includes(`user:${userAddress.toLowerCase()}`)
      );
      
      userKeys.forEach(key => localStorage.removeItem(key));
      console.log(`✅ Cleared ${userKeys.length} cache entries for user: ${userAddress}`);
    }
  } catch (error) {
    console.error('Failed to clear user cache:', error);
  }
}

export function clearAllCache() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  
  try {
    localStorage.clear();
    console.log('✅ Cleared all localStorage cache');
  } catch (error) {
    console.error('Failed to clear all cache:', error);
  }
}
