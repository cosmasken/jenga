
import React from 'react';
import { useAccount } from 'wagmi';
import { Dashboard } from './Dashboard';
import { LandingPage } from '../components/landing/LandingPage';

const Index: React.FC = () => {
  const { isConnected } = useAccount();

  // Show landing page for unconnected users, dashboard for connected users
  return isConnected ? <Dashboard /> : <LandingPage />;
};

export default Index;
