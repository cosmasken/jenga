/**
 * TokenBalance Component
 * Displays token balance with icon and formatting
 */

import React from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getTokenInfo,
  getTokenIcon,
  formatTokenAmount,
  hasTokenFaucet,
  getFaucetAmount,
  getTokenColor,
} from '@/lib/tokenUtils';

interface TokenBalanceProps {
  symbol: string;
  balance: bigint | string | number;
  showFaucetButton?: boolean;
  onFaucetClick?: () => void;
  isLoading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TokenBalance({
  symbol,
  balance,
  showFaucetButton = true,
  onFaucetClick,
  isLoading = false,
  className,
  size = 'md',
}: TokenBalanceProps) {
  const tokenInfo = getTokenInfo(symbol);
  const icon = getTokenIcon(symbol);
  const formattedBalance = formatTokenAmount(balance, symbol);
  const hasFaucet = hasTokenFaucet(symbol);
  const faucetAmount = getFaucetAmount(symbol);
  const tokenColor = getTokenColor(symbol);

  const sizeClasses = {
    sm: {
      icon: 'text-lg',
      balance: 'text-sm',
      symbol: 'text-xs',
      button: 'h-6 px-2 text-xs',
    },
    md: {
      icon: 'text-2xl',
      balance: 'text-lg font-semibold',
      symbol: 'text-sm',
      button: 'h-8 px-3 text-sm',
    },
    lg: {
      icon: 'text-3xl',
      balance: 'text-2xl font-bold',
      symbol: 'text-base',
      button: 'h-10 px-4',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn("flex items-center justify-between p-3 border rounded-lg", className)}>
      <div className="flex items-center gap-3">
        <div 
          className={cn(classes.icon, "flex-shrink-0")}
          style={{ color: tokenColor }}
        >
          {icon}
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={classes.balance}>
              {isLoading ? '...' : formattedBalance}
            </span>
            <span className={cn(classes.symbol, "text-muted-foreground")}>
              {symbol}
            </span>
          </div>
          
          {tokenInfo?.name && (
            <span className="text-xs text-muted-foreground">
              {tokenInfo.name}
            </span>
          )}
          
          {tokenInfo?.isTestToken && (
            <Badge variant="secondary" className="w-fit mt-1 text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Test Token
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showFaucetButton && hasFaucet && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFaucetClick}
            disabled={isLoading}
            className={classes.button}
          >
            <Zap className="w-4 h-4 mr-1" />
            Get {faucetAmount}
          </Button>
        )}
      </div>
    </div>
  );
}

export default TokenBalance;
