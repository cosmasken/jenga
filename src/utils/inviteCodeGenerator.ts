// src/utils/inviteCodeGenerator.ts
import { type Address } from 'viem';

export interface InviteCode {
  code: string;
  type: 'platform' | 'chama';
  chamaAddress?: Address;
  inviter: Address;
  createdAt: Date;
  expiresAt: Date;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
}

export class InviteCodeGenerator {
  /**
   * Generates a unique invite code
   * @param inviter - Address of the user creating the invite
   * @param type - Type of invite (platform or chama)
   * @param chamaAddress - Optional chama address for chama invites
   * @returns Generated invite code string
   */
  static generateCode(
    inviter: Address, 
    type: 'platform' | 'chama',
    chamaAddress?: Address
  ): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const inviterShort = inviter.slice(2, 8).toUpperCase();
    
    if (type === 'chama' && chamaAddress) {
      const chamaShort = chamaAddress.slice(2, 6).toUpperCase();
      return `CHAMA_${inviterShort}_${chamaShort}_${timestamp}_${random}`;
    }
    
    return `SACCO_${inviterShort}_${timestamp}_${random}`;
  }

  /**
   * Creates a complete invite code object
   * @param inviter - Address of the user creating the invite
   * @param type - Type of invite (platform or chama)
   * @param chamaAddress - Optional chama address for chama invites
   * @param maxUses - Maximum number of times the code can be used (default: 10)
   * @returns Complete InviteCode object
   */
  static createInviteCode(
    inviter: Address,
    type: 'platform' | 'chama',
    chamaAddress?: Address,
    maxUses: number = 10
  ): InviteCode {
    const code = this.generateCode(inviter, type, chamaAddress);
    const createdAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(createdAt.getDate() + 30); // 30 days expiry

    return {
      code,
      type,
      chamaAddress,
      inviter,
      createdAt,
      expiresAt,
      maxUses,
      currentUses: 0,
      isActive: true
    };
  }

  /**
   * Validates an invite code format
   * @param code - The invite code to validate
   * @returns boolean indicating if the code format is valid
   */
  static isValidCodeFormat(code: string): boolean {
    const platformPattern = /^SACCO_[A-F0-9]{6}_[A-Z0-9]+_[A-Z0-9]{6}$/;
    const chamaPattern = /^CHAMA_[A-F0-9]{6}_[A-F0-9]{4}_[A-Z0-9]+_[A-Z0-9]{6}$/;
    
    return platformPattern.test(code) || chamaPattern.test(code);
  }

  /**
   * Extracts invite type from code
   * @param code - The invite code
   * @returns The invite type or null if invalid
   */
  static getInviteType(code: string): 'platform' | 'chama' | null {
    if (!this.isValidCodeFormat(code)) return null;
    
    if (code.startsWith('SACCO_')) return 'platform';
    if (code.startsWith('CHAMA_')) return 'chama';
    
    return null;
  }

  /**
   * Generates a shareable URL with invite code
   * @param code - The invite code
   * @param baseUrl - Base URL of the application
   * @param chamaAddress - Optional chama address for direct chama links
   * @returns Complete shareable URL
   */
  static generateShareableUrl(
    code: string,
    baseUrl: string = window.location.origin,
    chamaAddress?: Address
  ): string {
    const type = this.getInviteType(code);
    
    if (type === 'chama' && chamaAddress) {
      return `${baseUrl}/join?chama=${chamaAddress}&invite=${code}`;
    }
    
    return `${baseUrl}?invite=${code}`;
  }
}
