import React, { useState, useEffect } from "react";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useDarkMode } from './lib/useDarkMode';
import { Landing } from './components/Landing';
import { Dashboard } from './components/Dashboard';
import { OnboardingFlow } from './components/OnboardingFlow';
import { ToastProvider } from './components/Toast';
import "./App.css";

function App() {
  const { isDarkMode } = useDarkMode();
  const isLoggedIn = useIsLoggedIn();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user has completed onboarding
  useEffect(() => {
    if (isLoggedIn) {
      const hasCompletedOnboarding = localStorage.getItem('jenga_onboarding_completed');
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [isLoggedIn]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <ToastProvider>
      <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="container">
          {/* Header Section */}
          <header className="app-header">
            <h1 className="app-title">
              <span className="bitcoin-symbol">₿</span>
              Jenga
              <span className="bitcoin-symbol">₿</span>
            </h1>
            <p className="app-subtitle">
              Bitcoin Chama dApp - Build Your Financial Future Together
            </p>
            <p className="text-muted">
              Create and manage Bitcoin savings circles on Citrea testnet
            </p>
          </header>

          {/* Main Content */}
          <main className="modal">
            {/* Wallet Connection Section */}
            <section className="wallet-section">
              <DynamicWidget />
            </section>

            {/* Conditional Content Based on Login Status */}
            {isLoggedIn ? <Dashboard /> : <Landing />}
          </main>

          {/* Footer */}
          <footer className="app-footer">
            <p className="text-muted">
              Built with ❤️ for the Bitcoin community • Powered by Citrea testnet
            </p>
          </footer>
        </div>

        {/* Onboarding Flow */}
        <OnboardingFlow 
          open={showOnboarding} 
          onComplete={handleOnboardingComplete} 
        />
      </div>
    </ToastProvider>
  );
}

export default App;
