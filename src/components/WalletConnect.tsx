import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Wallet, LogOut, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const WalletConnect: React.FC = () => {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const { t } = useTranslation();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: t('wallet.addressCopied'),
        description: t('wallet.addressCopiedDesc'),
      });
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const openExplorer = () => {
    if (address) {
      window.open(`https://explorer.testnet.citrea.xyz/address/${address}`, '_blank');
    }
  };

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-950">
            <Wallet className="w-4 h-4" />
            {formatAddress(address)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{t('wallet.connectedWith', { connector: connector?.name })}</p>
            <p className="text-xs text-muted-foreground">{address}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
            <Copy className="w-4 h-4 mr-2" />
            {t('wallet.copyAddress')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openExplorer} className="cursor-pointer">
            <ExternalLink className="w-4 h-4 mr-2" />
            {t('wallet.viewOnExplorer')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => disconnect()} 
            className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('wallet.disconnect')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          variant={connector.name === 'Web3Auth' ? 'default' : 'outline'}
          className={connector.name === 'Web3Auth' ? 
            'btn-primary' : 
            'btn-secondary'
          }
        >
          <Wallet className="w-4 h-4 mr-2" />
          {connector.name === 'Web3Auth' ? t('wallet.connectWithSocial') : `${t('wallet.connect')} ${connector.name}`}
        </Button>
      ))}
    </div>
  );
};
