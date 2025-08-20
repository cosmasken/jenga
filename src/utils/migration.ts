/**
 * Migration utilities for handling contract upgrades and localStorage cleanup
 */

import { type Address } from 'viem';

// Version tracking for migrations
const MIGRATION_VERSION_KEY = 'jenga_migration_version';
const CURRENT_VERSION = '2.0.0'; // Enhanced ROSCA version

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  const currentVersion = localStorage.getItem(MIGRATION_VERSION_KEY);
  return currentVersion !== CURRENT_VERSION;
}

/**
 * Clear old localStorage data that might contain incompatible contract addresses
 */
export function clearOldData() {
  console.log('🧹 Starting migration: Clearing old contract data...');
  
  // List of localStorage keys that might contain old contract addresses
  const keysToCheck = [
    'chamas', // Base key
  ];
  
  // Get all localStorage keys and find those that match patterns
  const allKeys = Object.keys(localStorage);
  const chamaKeys = allKeys.filter(key => 
    key.includes('chamas_0x') || // User-specific chama lists
    key.includes('rosca_') ||    // Old ROSCA data
    key.includes('chama_')       // Old chama data
  );
  
  // Clear identified keys
  [...keysToCheck, ...chamaKeys].forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`🗑️ Removing old data: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ Migration completed: Old contract data cleared');
}

/**
 * Perform full migration process
 */
export function runMigration() {
  if (!needsMigration()) {
    console.log('📝 No migration needed, already on version:', CURRENT_VERSION);
    return;
  }
  
  console.log('🚀 Running migration to version:', CURRENT_VERSION);
  
  // Clear old data
  clearOldData();
  
  // Mark migration as complete
  localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_VERSION);
  
  console.log('✅ Migration complete! Please refresh the page to see changes.');
  
  // Show user notification
  showMigrationNotification();
}

/**
 * Show migration notification to user
 */
function showMigrationNotification() {
  // Create a temporary notification div
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(45deg, #F7931A, #FF6B35);
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 320px;
    cursor: pointer;
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 18px;">🔄</span>
      <div>
        <div style="font-weight: 600;">Migration Complete!</div>
        <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">
          Updated to Enhanced ROSCA v2.0. Click to dismiss.
        </div>
      </div>
    </div>
  `;
  
  // Remove notification when clicked
  notification.addEventListener('click', () => {
    notification.remove();
    style.remove();
  });
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (document.contains(notification)) {
      notification.remove();
      style.remove();
    }
  }, 10000);
  
  document.body.appendChild(notification);
}

/**
 * Check if an address might be an old contract (for debugging)
 */
export function isLikelyOldContract(address: Address): boolean {
  // List of known old contract addresses that should be ignored
  const oldContractAddresses = [
    '0xEa353D5A300966f8598161F05f0945b570d8B499', // The problematic address from the logs
    // Add more old addresses here if needed
  ];
  
  return oldContractAddresses.some(oldAddr => 
    oldAddr.toLowerCase() === address.toLowerCase()
  );
}

/**
 * Get clean localStorage key for user chamas
 */
export function getChamaStorageKey(userAddress: Address): string {
  return `chamas_${userAddress.toLowerCase()}_v${CURRENT_VERSION}`;
}

/**
 * Safe localStorage operations that handle migration
 */
export const migrationSafeStorage = {
  /**
   * Get chama list for user, ensuring no old contract addresses
   */
  getUserChamas(userAddress: Address): Address[] {
    const key = getChamaStorageKey(userAddress);
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      
      const addresses: Address[] = JSON.parse(stored);
      // Filter out any old contract addresses
      return addresses.filter(addr => !isLikelyOldContract(addr));
    } catch (error) {
      console.error('Error reading chama list from localStorage:', error);
      return [];
    }
  },
  
  /**
   * Save chama list for user
   */
  setUserChamas(userAddress: Address, chamas: Address[]): void {
    const key = getChamaStorageKey(userAddress);
    try {
      // Filter out old contracts before saving
      const cleanChamas = chamas.filter(addr => !isLikelyOldContract(addr));
      localStorage.setItem(key, JSON.stringify(cleanChamas));
    } catch (error) {
      console.error('Error saving chama list to localStorage:', error);
    }
  },
  
  /**
   * Add chama to user's list if not already present
   */
  addUserChama(userAddress: Address, chamaAddress: Address): void {
    if (isLikelyOldContract(chamaAddress)) {
      console.warn('⚠️ Attempted to add old contract address, skipping:', chamaAddress);
      return;
    }
    
    const current = this.getUserChamas(userAddress);
    if (!current.includes(chamaAddress)) {
      this.setUserChamas(userAddress, [...current, chamaAddress]);
    }
  }
};
