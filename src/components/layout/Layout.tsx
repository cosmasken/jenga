import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-background">
      {/* Only show Navbar for connected users */}
      {isConnected && <Navbar />}
      
      {/* Always render the Outlet to allow pages to handle their own auth logic */}
      <main className={isConnected ? "pt-16" : ""}>
        <Outlet />
      </main>
    </div>
  );
};
