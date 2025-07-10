
import React, { useEffect } from 'react';
import { Dashboard } from './Dashboard';
import useWallet from '../stores/useWallet';
import { useUserStore } from '../stores/userStore';
import { getMockUserProfile } from '../data/mockData';

const Index: React.FC = () => {
  const { isConnected, address } = useWallet();
  const { setProfile } = useUserStore();

  // useEffect(() => {
  //   // Mock wallet connection for development
  //   const mockConnection = () => {
  //     const mockAddress = '0x1111111111111111111111111111111111111111'; // Alice's address
      
  //     setConnection({
  //       address: mockAddress,
  //       chainId: 5115,
  //       balance: '100000000000000000', // 0.1 BTC in Wei
  //       isConnected: true,
  //       provider: null,
  //     });

  //     // Load mock profile
  //     const mockProfile = getMockUserProfile(mockAddress);
  //     if (mockProfile) {
  //       setProfile(mockProfile);
  //     }
  //   };

  //   // Auto-connect for demo purposes
  //   if (!connection?.isConnected) {
  //     setTimeout(mockConnection, 1000);
  //   }
  // }, [connection, setConnection, setProfile]);

  return <Dashboard />;
};

export default Index;
