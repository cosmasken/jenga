
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home } from 'lucide-react';
import { useAccount } from 'wagmi';
import { WalletConnect } from '../WalletConnect';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isConnected } = useAccount();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-card border-b border-orange-200 dark:border-border z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="welcome-logo w-8 h-8 mb-0">
              <span className="text-white font-bold text-lg">₿</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-foreground group-hover:text-orange-500 transition-colors">
              Jenga
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`nav-link ${
                  isActive(path) ? 'nav-link-active' : 'nav-link-inactive'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center">
            <WalletConnect />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:text-foreground dark:hover:text-orange-500 dark:hover:bg-orange-950 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-card border-b border-orange-200 dark:border-border shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive(path)
                    ? 'text-orange-600 bg-orange-50 dark:text-orange-500 dark:bg-orange-950'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:text-foreground dark:hover:text-orange-500 dark:hover:bg-orange-950'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
            
            <div className="border-t border-gray-200 dark:border-border pt-4 mt-4">
              <div className="px-3">
                <WalletConnect />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
