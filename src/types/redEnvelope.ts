
export interface RedEnvelope {
  sender: string;
  recipients: string[];
  totalAmount: number;
  amounts: number[];
  isRandom: boolean;
  claimed: boolean;
}

export interface RedEnvelopeMode {
  type: 'equal' | 'random';
  maxRecipients: number;
}

export interface RedEnvelopeTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  pattern: string;
}

export interface RedEnvelopeHistory {
  sent: RedEnvelope[];
  received: RedEnvelope[];
  totalSent: number;
  totalReceived: number;
}

export const RED_ENVELOPE_THEMES: RedEnvelopeTheme[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin Classic',
    colors: {
      primary: '#F7931A',
      secondary: '#FF9900',
      accent: '#FFD700',
    },
    pattern: 'bitcoin-logo',
  },
  {
    id: 'blockchain',
    name: 'Blockchain',
    colors: {
      primary: '#1A73E8',
      secondary: '#4285F4',
      accent: '#34A853',
    },
    pattern: 'chain-links',
  },
  {
    id: 'traditional',
    name: 'Traditional Red',
    colors: {
      primary: '#DC2626',
      secondary: '#EF4444',
      accent: '#F59E0B',
    },
    pattern: 'dragons',
  },
];
