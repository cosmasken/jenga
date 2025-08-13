// src/utils/inviteCodeGenerator.ts
import { type Address } from 'viem';

export interface InviteCode {
  code: string;
  type: 'chama';
  chamaAddress: Address;
  chamaName?: string;
  inviter: Address;
  createdAt: Date;
  expiresAt: Date;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
}

export class InviteCodeGenerator {
  /**
   * Generates a unique invite code for chama invites
   * @param inviter - Address of the user creating the invite
   * @param chamaAddress - Address of the chama to invite to
   * @returns Generated invite code string
   */
  static generateCode(inviter: Address, chamaAddress: Address): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const inviterShort = inviter.slice(2, 8).toUpperCase();
    const chamaShort = chamaAddress.slice(2, 6).toUpperCase();
    
    return `CHAMA_${inviterShort}_${chamaShort}_${timestamp}_${random}`;
  }

  /**
   * Creates a complete invite code object for chama invites
   * @param inviter - Address of the user creating the invite
   * @param chamaAddress - Address of the chama to invite to
   * @param chamaName - Optional name of the chama
   * @param maxUses - Maximum number of times the code can be used (default: 10)
   * @returns Complete InviteCode object
   */
  static createInviteCode(
    inviter: Address,
    chamaAddress: Address,
    chamaName?: string,
    maxUses: number = 10
  ): InviteCode {
    const code = this.generateCode(inviter, chamaAddress);
    const createdAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(createdAt.getDate() + 30); // 30 days expiry

    return {
      code,
      type: 'chama',
      chamaAddress,
      chamaName,
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
    const chamaPattern = /^CHAMA_[A-F0-9]{6}_[A-F0-9]{4}_[A-Z0-9]+_[A-Z0-9]{6}$/;
    return chamaPattern.test(code);
  }

  /**
   * Extracts invite type from code (always chama now)
   * @param code - The invite code
   * @returns The invite type or null if invalid
   */
  static getInviteType(code: string): 'chama' | null {
    if (!this.isValidCodeFormat(code)) return null;
    return 'chama';
  }

  /**
   * Extracts chama address from invite code
   * @param code - The invite code
   * @returns The chama address or null if invalid
   */
  static extractChamaAddress(code: string): Address | null {
    if (!this.isValidCodeFormat(code)) return null;
    
    // Extract chama address from code format: CHAMA_INVITER_CHAMA_TIMESTAMP_RANDOM
    const parts = code.split('_');
    if (parts.length < 3) return null;
    
    // This is a simplified extraction - in production you'd store the mapping
    // For now, we'll need to pass the chama address separately in URLs
    return null;
  }

  /**
   * Generates a shareable URL with invite code for chama
   * @param code - The invite code
   * @param chamaAddress - Address of the chama
   * @param baseUrl - Base URL of the application
   * @returns Complete shareable URL
   */
  static generateShareableUrl(
    code: string,
    chamaAddress: Address,
    baseUrl: string = window.location.origin
  ): string {
    return `${baseUrl}/join?chama=${chamaAddress}&invite=${code}`;
  }
}
