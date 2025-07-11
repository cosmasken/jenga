
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { Navbar } from './Navbar';
import { WalletConnect } from '../WalletConnect';

export const Layout: React.FC = () => {
  const { isConnected } = useAccount();
  const { t } = useTranslation();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto fade-in">
          <div className="welcome-logo">
            <span className="text-3xl text-white">₿</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('welcome.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {t('welcome.subtitle')}
          </p>
          <div className="space-y-4">
            <WalletConnect />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('welcome.needFunds')}{' '}
              <a 
                href="https://faucet.testnet.citrea.xyz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 underline transition-colors"
              >
                {t('welcome.faucet')}
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};
