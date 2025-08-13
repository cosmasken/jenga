// src/services/inviteStorage.ts
import { type Address } from 'viem';
import { type InviteCode } from '@/utils/inviteCodeGenerator';

const STORAGE_KEY = 'sacco_invite_codes';
const PENDING_INVITE_KEY = 'sacco_pending_invite';
const CLICK_TRACKING_KEY = 'sacco_invite_clicks';
const USAGE_TRACKING_KEY = 'sacco_invite_usage';

export interface InviteClick {
  code: string;
  timestamp: Date;
  userAgent: string;
  referrer: string;
  converted: boolean;
  sessionId: string;
}

export interface InviteUsage {
  code: string;
  userAddress: Address;
  timestamp: Date;
  type: 'click' | 'conversion';
  sessionId: string;
}

export class InviteStorageService {
  /**
   * Saves an invite code to localStorage
   * @param inviteCode - The invite code object to save
   */
  static saveInviteCode(inviteCode: InviteCode): void {
    try {
      const existingCodes = this.getAllInviteCodes();
      const updatedCodes = [...existingCodes, inviteCode];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCodes));
    } catch (error) {
      console.error('Failed to save invite code:', error);
    }
  }

  /**
   * Records a real click on an invite link
   * @param code - The invite code that was clicked
   * @param converted - Whether this click resulted in a conversion
   */
  static recordClick(code: string, converted: boolean = false): void {
    try {
      const sessionId = this.getOrCreateSessionId();
      const click: InviteClick = {
        code,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        converted,
        sessionId
      };

      const existingClicks = this.getAllClicks();
      existingClicks.push(click);
      localStorage.setItem(CLICK_TRACKING_KEY, JSON.stringify(existingClicks));

      console.log('📊 Invite click recorded:', { code: code.slice(-6), converted, sessionId });
    } catch (error) {
      console.error('Failed to record click:', error);
    }
  }

  /**
   * Records real usage of an invite code
   * @param code - The invite code
   * @param userAddress - Address of the user who used the code
   * @param type - Type of usage (click or conversion)
   */
  static recordUsage(code: string, userAddress: Address, type: 'click' | 'conversion'): void {
    try {
      const sessionId = this.getOrCreateSessionId();
      const usage: InviteUsage = {
        code,
        userAddress,
        timestamp: new Date(),
        type,
        sessionId
      };

      const existingUsage = this.getAllUsage();
      existingUsage.push(usage);
      localStorage.setItem(USAGE_TRACKING_KEY, JSON.stringify(existingUsage));

      console.log('📈 Invite usage recorded:', { code: code.slice(-6), type, user: userAddress.slice(0, 8) });
    } catch (error) {
      console.error('Failed to record usage:', error);
    }
  }

  /**
   * Gets real analytics for an invite code
   * @param code - The invite code
   */
  static getRealAnalytics(code: string) {
    try {
      const clicks = this.getAllClicks().filter(click => click.code === code);
      const usage = this.getAllUsage().filter(u => u.code === code);
      const conversions = clicks.filter(click => click.converted);
      
      return {
        totalClicks: clicks.length,
        totalConversions: conversions.length,
        conversionRate: clicks.length > 0 ? (conversions.length / clicks.length) * 100 : 0,
        lastClicked: clicks.length > 0 ? clicks[clicks.length - 1].timestamp : null,
        uniqueUsers: [...new Set(usage.map(u => u.userAddress))],
        clickHistory: clicks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        usageHistory: usage.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      };
    } catch (error) {
      console.error('Failed to get real analytics:', error);
      return {
        totalClicks: 0,
        totalConversions: 0,
        conversionRate: 0,
        lastClicked: null,
        uniqueUsers: [],
        clickHistory: [],
        usageHistory: []
      };
    }
  }

  /**
   * Retrieves all invite codes for a specific user
   * @param inviter - Address of the inviter
   * @returns Array of invite codes created by the user
   */
  static getUserInviteCodes(inviter: Address): InviteCode[] {
    try {
      const allCodes = this.getAllInviteCodes();
      return allCodes.filter(code => 
        code.inviter.toLowerCase() === inviter.toLowerCase()
      );
    } catch (error) {
      console.error('Failed to get user invite codes:', error);
      return [];
    }
  }

  /**
   * Retrieves a specific invite code by its code string
   * @param code - The invite code string
   * @returns The invite code object or null if not found
   */
  static getInviteCode(code: string): InviteCode | null {
    try {
      const allCodes = this.getAllInviteCodes();
      const inviteCode = allCodes.find(invite => invite.code === code);
      
      if (!inviteCode) return null;
      
      // Check if code is expired
      const now = new Date();
      const expiresAt = new Date(inviteCode.expiresAt);
      
      if (now > expiresAt) {
        // Mark as inactive if expired
        this.updateInviteCode(code, { isActive: false });
        return { ...inviteCode, isActive: false };
      }
      
      return inviteCode;
    } catch (error) {
      console.error('Failed to get invite code:', error);
      return null;
    }
  }

  /**
   * Updates an existing invite code
   * @param code - The invite code string
   * @param updates - Partial updates to apply
   */
  static updateInviteCode(code: string, updates: Partial<InviteCode>): void {
    try {
      const allCodes = this.getAllInviteCodes();
      const codeIndex = allCodes.findIndex(invite => invite.code === code);
      
      if (codeIndex === -1) return;
      
      allCodes[codeIndex] = { ...allCodes[codeIndex], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allCodes));
    } catch (error) {
      console.error('Failed to update invite code:', error);
    }
  }

  /**
   * Increments the usage count for an invite code (real usage)
   * @param code - The invite code string
   * @param userAddress - Address of the user who used the code
   * @returns boolean indicating if the increment was successful
   */
  static incrementUsage(code: string, userAddress?: Address): boolean {
    try {
      const inviteCode = this.getInviteCode(code);
      
      if (!inviteCode || !inviteCode.isActive) return false;
      if (inviteCode.currentUses >= inviteCode.maxUses) return false;
      
      const newUsageCount = inviteCode.currentUses + 1;
      const isStillActive = newUsageCount < inviteCode.maxUses;
      
      this.updateInviteCode(code, {
        currentUses: newUsageCount,
        isActive: isStillActive
      });

      // Record the conversion
      this.recordClick(code, true);
      if (userAddress) {
        this.recordUsage(code, userAddress, 'conversion');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to increment invite usage:', error);
      return false;
    }
  }

  /**
   * Stores a pending invite code for processing after wallet connection
   * @param code - The invite code to store as pending
   */
  static setPendingInvite(code: string): void {
    try {
      localStorage.setItem(PENDING_INVITE_KEY, code);
      // Record the click when invite is detected
      this.recordClick(code, false);
    } catch (error) {
      console.error('Failed to set pending invite:', error);
    }
  }

  /**
   * Retrieves and clears the pending invite code
   * @returns The pending invite code or null if none exists
   */
  static getPendingInvite(): string | null {
    try {
      const code = localStorage.getItem(PENDING_INVITE_KEY);
      if (code) {
        localStorage.removeItem(PENDING_INVITE_KEY);
      }
      return code;
    } catch (error) {
      console.error('Failed to get pending invite:', error);
      return null;
    }
  }

  /**
   * Gets invite statistics for a user with real data
   * @param inviter - Address of the inviter
   * @returns Statistics object with real tracking data
   */
  static getInviteStats(inviter: Address): {
    totalInvites: number;
    activeInvites: number;
    totalUses: number;
    platformInvites: number;
    chamaInvites: number;
    totalClicks: number;
    totalConversions: number;
    avgConversionRate: number;
  } {
    try {
      const userCodes = this.getUserInviteCodes(inviter);
      const allClicks = this.getAllClicks();
      const allUsage = this.getAllUsage();
      
      // Get clicks and conversions for user's codes
      const userClicks = allClicks.filter(click => 
        userCodes.some(code => code.code === click.code)
      );
      const userConversions = userClicks.filter(click => click.converted);
      
      const avgConversionRate = userClicks.length > 0 
        ? (userConversions.length / userClicks.length) * 100 
        : 0;
      
      return {
        totalInvites: userCodes.length,
        activeInvites: userCodes.filter(code => code.isActive).length,
        totalUses: userCodes.reduce((sum, code) => sum + code.currentUses, 0),
        platformInvites: userCodes.filter(code => code.type === 'platform').length,
        chamaInvites: userCodes.filter(code => code.type === 'chama').length,
        totalClicks: userClicks.length,
        totalConversions: userConversions.length,
        avgConversionRate: parseFloat(avgConversionRate.toFixed(1))
      };
    } catch (error) {
      console.error('Failed to get invite stats:', error);
      return {
        totalInvites: 0,
        activeInvites: 0,
        totalUses: 0,
        platformInvites: 0,
        chamaInvites: 0,
        totalClicks: 0,
        totalConversions: 0,
        avgConversionRate: 0
      };
    }
  }

  /**
   * Gets or creates a session ID for tracking
   */
  private static getOrCreateSessionId(): string {
    const sessionKey = 'sacco_session_id';
    let sessionId = sessionStorage.getItem(sessionKey);
    
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      sessionStorage.setItem(sessionKey, sessionId);
    }
    
    return sessionId;
  }

  /**
   * Retrieves all clicks from localStorage
   */
  private static getAllClicks(): InviteClick[] {
    try {
      const stored = localStorage.getItem(CLICK_TRACKING_KEY);
      if (!stored) return [];
      
      const clicks = JSON.parse(stored);
      return clicks.map((click: any) => ({
        ...click,
        timestamp: new Date(click.timestamp)
      }));
    } catch (error) {
      console.error('Failed to parse clicks from storage:', error);
      return [];
    }
  }

  /**
   * Retrieves all usage data from localStorage
   */
  private static getAllUsage(): InviteUsage[] {
    try {
      const stored = localStorage.getItem(USAGE_TRACKING_KEY);
      if (!stored) return [];
      
      const usage = JSON.parse(stored);
      return usage.map((u: any) => ({
        ...u,
        timestamp: new Date(u.timestamp)
      }));
    } catch (error) {
      console.error('Failed to parse usage from storage:', error);
      return [];
    }
  }

  /**
   * Retrieves all invite codes from localStorage
   * @returns Array of all stored invite codes
   */
  private static getAllInviteCodes(): InviteCode[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const codes = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      return codes.map((code: any) => ({
        ...code,
        createdAt: new Date(code.createdAt),
        expiresAt: new Date(code.expiresAt)
      }));
    } catch (error) {
      console.error('Failed to parse invite codes from storage:', error);
      return [];
    }
  }

  /**
   * Clears all invite codes and tracking data (for testing/debugging)
   */
  static clearAllInviteCodes(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PENDING_INVITE_KEY);
      localStorage.removeItem(CLICK_TRACKING_KEY);
      localStorage.removeItem(USAGE_TRACKING_KEY);
      sessionStorage.removeItem('sacco_session_id');
    } catch (error) {
      console.error('Failed to clear invite codes:', error);
    }
  }
}
