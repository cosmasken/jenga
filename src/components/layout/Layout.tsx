
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Navbar } from './Navbar';
import { WalletConnect } from '../WalletConnect';

export const Layout: React.FC = () => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="welcome-container">
        <div className="text-center max-w-md mx-auto fade-in">
          <div className="welcome-logo">
            <span className="text-3xl text-white">₿</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Jenga</h1>
          <p className="text-gray-600 mb-8">
            Stack Bitcoin together with your friends in rotating savings circles (Chamas)
          </p>
          <div className="space-y-4">
            <WalletConnect />
            <p className="text-sm text-gray-500">
              Need testnet funds? Visit the{' '}
              <a 
                href="https://faucet.testnet.citrea.xyz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600 underline transition-colors"
              >
                Citrea Faucet
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
