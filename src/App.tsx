import React from "react";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useDarkMode } from './lib/useDarkMode';
import { Landing } from './components/Landing';
import { Dashboard } from './components/Dashboard';
import "./App.css";

function App() {
  const { isDarkMode } = useDarkMode();
  const isLoggedIn = useIsLoggedIn();

  return (
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
    </div>
  );
}

export default App;
