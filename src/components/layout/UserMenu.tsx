// src/components/UserMenu.tsx
import { useState, useEffect } from 'react';
import useWallet from '../../stores/useWallet';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { LogOut, User, Settings, Wallet, Copy, Check } from 'lucide-react';
import { useToast } from '../ui/use-toast';

export function UserMenu() {
  const { isConnected, address, connect, disconnect } = useWallet();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: 'Connection failed',
        description: 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoggingOut(true);
      await disconnect();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const copyToClipboard = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected || !address) {
    return (
      <Button
        onClick={handleConnect}
        className="bg-[hsl(var(--primary))] text-black hover:bg-[hsl(var(--accent))] font-mono text-xs tracking-wider border-2 border-[hsl(var(--primary))] hover:border-[hsl(var(--accent))] card-hover transition-all duration-200"
      >
        <Wallet className="w-4 h-4 mr-2" />
        CONNECT WALLET
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="hidden md:flex items-center space-x-2 bg-[hsl(var(--card))] border-2 border-[hsl(var(--primary))] px-4 py-2 rounded-full card-hover">
        <Wallet className="w-4 h-4 text-green-400" />
        <span className="text-xs font-mono tracking-wider text-[hsl(var(--primary))]">CONNECTED</span>
        <span className="flex items-center ml-2">
          <span className="font-mono text-xs text-[hsl(var(--accent))]">{truncateAddress(address)}</span>
          <button
            onClick={copyToClipboard}
            className="ml-1 text-[hsl(var(--primary))] hover:text-[hsl(var(--accent))] transition-colors duration-200"
            title={copiedAddress ? "Copied!" : "Copy address"}
          >
            {copiedAddress ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[hsl(var(--card))] border-2 border-[hsl(var(--primary))] card-hover" align="end" forceMount>
          <DropdownMenuLabel className="font-normal text-[hsl(var(--primary))]">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{truncateAddress(address)}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
         
          
          <DropdownMenuItem asChild>
            <button onClick={copyToClipboard} className="w-full text-left">
              <Copy className="mr-2 h-4 w-4" />
              Copy Address
            </button>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <button onClick={handleDisconnect} className="w-full text-left">
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? 'Logging out...' : 'Disconnect'}
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}