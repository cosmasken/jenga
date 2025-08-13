// src/services/inviteStorage.ts
import { type Address } from 'viem';
import { type InviteCode } from '@/utils/inviteCodeGenerator';

const STORAGE_KEY = 'sacco_invite_codes';
const PENDING_INVITE_KEY = 'sacco_pending_invite';

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
   * Increments the usage count for an invite code
   * @param code - The invite code string
   * @returns boolean indicating if the increment was successful
   */
  static incrementUsage(code: string): boolean {
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
   * Clears all invite codes (for testing/debugging)
   */
  static clearAllInviteCodes(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PENDING_INVITE_KEY);
    } catch (error) {
      console.error('Failed to clear invite codes:', error);
    }
  }

  /**
   * Gets invite statistics for a user
   * @param inviter - Address of the inviter
   * @returns Statistics object
   */
  static getInviteStats(inviter: Address): {
    totalInvites: number;
    activeInvites: number;
    totalUses: number;
    platformInvites: number;
    chamaInvites: number;
  } {
    try {
      const userCodes = this.getUserInviteCodes(inviter);
      
      return {
        totalInvites: userCodes.length,
        activeInvites: userCodes.filter(code => code.isActive).length,
        totalUses: userCodes.reduce((sum, code) => sum + code.currentUses, 0),
        platformInvites: userCodes.filter(code => code.type === 'platform').length,
        chamaInvites: userCodes.filter(code => code.type === 'chama').length
      };
    } catch (error) {
      console.error('Failed to get invite stats:', error);
      return {
        totalInvites: 0,
        activeInvites: 0,
        totalUses: 0,
        platformInvites: 0,
        chamaInvites: 0
      };
    }
  }
}
