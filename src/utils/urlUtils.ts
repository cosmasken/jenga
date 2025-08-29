/**
 * Get the correct base URL for the current environment
 */
export function getBaseUrl(): string {
  // For Vercel deployments
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // For server-side or build time
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.VITE_APP_URL) {
    return process.env.VITE_APP_URL;
  }
  
  // Fallback for development
  return 'http://localhost:5173';
}

/**
 * Generate chama share URL
 */
export function getChamaUrl(chamaAddress: string): string {
  return `${getBaseUrl()}/chama/${chamaAddress}`;
}

/**
 * Generate chama invite URL with invite code
 */
export function getChamaInviteUrl(chamaAddress: string, inviteCode: string): string {
  return `${getBaseUrl()}/chama/${chamaAddress}?invite=${inviteCode}`;
}
