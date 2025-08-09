/**
 * TokenSelector Component
 * A comprehensive token selection component with icons, search, and filtering
 */

import React, { useState, useMemo } from 'react';
import { Check, ChevronDown, Search, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  getTokenSelectorOptions,
  getTokenInfo,
  type TokenSelectorOption,
} from '@/lib/tokenUtils';

interface TokenSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  includeNative?: boolean;
  includeTestTokens?: boolean;
  showFaucetBadge?: boolean;
  showStablecoinBadge?: boolean;
  disabled?: boolean;
  className?: string;
}

export function TokenSelector({
  value,
  onValueChange,
  placeholder = "Select token...",
  includeNative = true,
  includeTestTokens = true,
  showFaucetBadge = true,
  showStablecoinBadge = true,
  disabled = false,
  className,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tokens = useMemo(() => 
    getTokenSelectorOptions(includeNative, includeTestTokens),
    [includeNative, includeTestTokens]
  );

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;
    
    const query = searchQuery.toLowerCase();
    return tokens.filter(token => 
      token.value.toLowerCase().includes(query) ||
      token.label.toLowerCase().includes(query)
    );
  }, [tokens, searchQuery]);

  const selectedToken = useMemo(() => 
    tokens.find(token => token.value === value),
    [tokens, value]
  );

  const handleSelect = (tokenValue: string) => {
    onValueChange?.(tokenValue);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedToken && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedToken ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedToken.icon}</span>
              <span>{selectedToken.value}</span>
              <div className="flex gap-1">
                {showFaucetBadge && selectedToken.isTestToken && (
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Faucet
                  </Badge>
                )}
                {showStablecoinBadge && selectedToken.isStablecoin && (
                  <Badge variant="outline" className="text-xs">
                    Stable
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            placeholder
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search tokens..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <CommandList>
            <CommandEmpty>No tokens found.</CommandEmpty>
            
            {/* Native Tokens */}
            {filteredTokens.some(token => token.isNative) && (
              <CommandGroup heading="Native">
                {filteredTokens
                  .filter(token => token.isNative)
                  .map((token) => (
                    <TokenItem
                      key={token.value}
                      token={token}
                      isSelected={value === token.value}
                      onSelect={handleSelect}
                      showFaucetBadge={showFaucetBadge}
                      showStablecoinBadge={showStablecoinBadge}
                    />
                  ))}
              </CommandGroup>
            )}
            
            {/* Stablecoins */}
            {filteredTokens.some(token => token.isStablecoin) && (
              <CommandGroup heading="Stablecoins">
                {filteredTokens
                  .filter(token => token.isStablecoin)
                  .map((token) => (
                    <TokenItem
                      key={token.value}
                      token={token}
                      isSelected={value === token.value}
                      onSelect={handleSelect}
                      showFaucetBadge={showFaucetBadge}
                      showStablecoinBadge={showStablecoinBadge}
                    />
                  ))}
              </CommandGroup>
            )}
            
            {/* Other Tokens */}
            {filteredTokens.some(token => !token.isNative && !token.isStablecoin) && (
              <CommandGroup heading="Other">
                {filteredTokens
                  .filter(token => !token.isNative && !token.isStablecoin)
                  .map((token) => (
                    <TokenItem
                      key={token.value}
                      token={token}
                      isSelected={value === token.value}
                      onSelect={handleSelect}
                      showFaucetBadge={showFaucetBadge}
                      showStablecoinBadge={showStablecoinBadge}
                    />
                  ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface TokenItemProps {
  token: TokenSelectorOption;
  isSelected: boolean;
  onSelect: (value: string) => void;
  showFaucetBadge: boolean;
  showStablecoinBadge: boolean;
}

function TokenItem({
  token,
  isSelected,
  onSelect,
  showFaucetBadge,
  showStablecoinBadge,
}: TokenItemProps) {
  const tokenInfo = getTokenInfo(token.value);
  
  return (
    <CommandItem
      value={token.value}
      onSelect={() => onSelect(token.value)}
      className="flex items-center justify-between p-2 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{token.icon}</span>
        <div className="flex flex-col">
          <span className="font-medium">{token.value}</span>
          {tokenInfo?.name && (
            <span className="text-xs text-muted-foreground">
              {tokenInfo.name}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {showFaucetBadge && token.isTestToken && (
            <Badge variant="secondary" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Faucet
            </Badge>
          )}
          {showStablecoinBadge && token.isStablecoin && (
            <Badge variant="outline" className="text-xs">
              Stable
            </Badge>
          )}
        </div>
        
        {isSelected && (
          <Check className="h-4 w-4 text-primary" />
        )}
      </div>
    </CommandItem>
  );
}

export default TokenSelector;
