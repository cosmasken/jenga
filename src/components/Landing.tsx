import React from 'react';

/**
 * Landing component for non-logged-in users
 * Shows welcome message and features of the Bitcoin Chama dApp
 */
export function Landing() {
  return (
    <section className="welcome-section">
      <div className="welcome-content">
        <h2 className="gradient-text">Welcome to Bitcoin Chamas</h2>
        <p className="text-secondary">
          Join the future of collaborative savings with Bitcoin. Create or join savings circles 
          (chamas) where members contribute regularly and take turns receiving payouts.
        </p>
        
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <h4>Secure & Trustless</h4>
            <p>Smart contracts ensure transparent and automatic operations</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">₿</div>
            <h4>Bitcoin Native</h4>
            <p>Built on Citrea testnet for fast and cheap Bitcoin transactions</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">👥</div>
            <h4>Community Driven</h4>
            <p>Join with friends or meet new people in savings circles</p>
          </div>
        </div>

        <div className="cta-section">
          <h3>Ready to get started?</h3>
          <p className="text-muted">
            Connect your wallet above to create or join your first Bitcoin Chama
          </p>
        </div>
      </div>
    </section>
  );
}
