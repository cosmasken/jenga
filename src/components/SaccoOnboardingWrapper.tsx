import { useState, useEffect } from 'react';
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useUserStore } from '@/stores/userStore';
import { useSacco } from '@/hooks/useSacco';
import { CONTRACT_ADDRESSES } from '@/config';
import SaccoWelcome from './SaccoWelcome';
import SaccoDashboardTour from './SaccoDashboardTour';
import SaccoDashboard from '@/pages/SaccoDashboard';

interface SaccoOnboardingWrapperProps {
  className?: string;
}

export function SaccoOnboardingWrapper({ className = '' }: SaccoOnboardingWrapperProps) {
  const isLoggedIn = useIsLoggedIn();
  const {
    hasSeenSaccoWelcome,
    hasSeenDashboardTour,
    isFirstTimeUser,
    lastVisitedSacco,
    markGuideAsSeen,
    updateLastVisitedSacco,
    setFirstTimeUser,
  } = useUserStore();

  const { memberData, isLoading } = useSacco(CONTRACT_ADDRESSES.MICRO_SACCO);
  const isMember = memberData?.isMember || false;

  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Determine if user should see onboarding
  useEffect(() => {
    if (!isLoggedIn || isLoading) return;

    const now = Date.now();
    const daysSinceLastVisit = lastVisitedSacco 
      ? (now - lastVisitedSacco) / (1000 * 60 * 60 * 24) 
      : Infinity;

    // Show welcome screen if:
    // 1. First time user AND hasn't seen welcome
    // 2. OR hasn't visited SACCO in 30+ days AND hasn't seen welcome
    const shouldShowWelcome = !hasSeenSaccoWelcome && (
      isFirstTimeUser || daysSinceLastVisit > 30
    );

    // Show tour if:
    // 1. User is a member AND hasn't seen tour
    // 2. OR just completed welcome and became a member
    const shouldShowTour = isMember && !hasSeenDashboardTour;

    if (shouldShowWelcome && !onboardingComplete) {
      setShowWelcome(true);
    } else if (shouldShowTour && !onboardingComplete) {
      // Small delay to let dashboard render first
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setOnboardingComplete(true);
    }

    // Update last visited timestamp
    updateLastVisitedSacco();
  }, [
    isLoggedIn,
    isLoading,
    isMember,
    hasSeenSaccoWelcome,
    hasSeenDashboardTour,
    isFirstTimeUser,
    lastVisitedSacco,
    onboardingComplete,
    updateLastVisitedSacco,
  ]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    markGuideAsSeen('sacco-welcome');
    setFirstTimeUser(false);
    
    // If user is already a member, show tour next
    if (isMember) {
      setTimeout(() => {
        setShowTour(true);
      }, 500);
    } else {
      setOnboardingComplete(true);
    }
  };

  const handleWelcomeSkip = () => {
    setShowWelcome(false);
    markGuideAsSeen('sacco-welcome');
    setFirstTimeUser(false);
    setOnboardingComplete(true);
  };

  const handleTourComplete = () => {
    setShowTour(false);
    markGuideAsSeen('dashboard');
    setOnboardingComplete(true);
  };

  const handleTourClose = () => {
    setShowTour(false);
    setOnboardingComplete(true);
    // Don't mark as seen if they close without completing
  };

  // Show welcome screen
  if (showWelcome) {
    return (
      <SaccoWelcome
        onGetStarted={handleWelcomeComplete}
        onSkip={handleWelcomeSkip}
        className={className}
      />
    );
  }

  // Show dashboard with tour overlay
  return (
    <div className={className}>
      <SaccoDashboard />
      
      {showTour && (
        <SaccoDashboardTour
          isOpen={showTour}
          onClose={handleTourClose}
          onComplete={handleTourComplete}
        />
      )}
    </div>
  );
}

export default SaccoOnboardingWrapper;
