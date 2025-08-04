
1: import React from 'react';
2:
3: /**
    4:  * Landing component for non-logged-in users
    5:  * Shows welcome message and features of the Bitcoin Chama dApp
    6:  */
7: export function Landing() {
    8: return (
        9: <section className="welcome-section">
            10:       <div className="welcome-content">
                11:         <h2 className="gradient-text">Welcome to Bitcoin Chamas</h2>
                12:         <p className="text-secondary">
                    13:           Join the future of collaborative savings with Bitcoin. Create or join savings circles
                    14:           (chamas) where members contribute regularly and take turns receiving payouts.
                    15:         </p>
                16:
                17:         <div className="features-grid">
                    18:           <div className="feature-item">
                        19:             <div className="feature-icon">🔒</div>
                        20:             <h4>Secure & Trustless</h4>
                        21:             <p>Smart contracts ensure transparent and automatic operations</p>
                        22:           </div>
                    23:           <div className="feature-item">
                        24:             <div className="feature-icon">₿</div>
                        25:             <h4>Bitcoin Native</h4>
                        26:             <p>Built on Citrea testnet for fast and cheap Bitcoin transactions</p>
                        27:           </div>
                    28:           <div className="feature-item">
                        29:             <div className="feature-icon">👥</div>
                        30:             <h4>Community Driven</h4>
                        31:             <p>Join with friends or meet new people in savings circles</p>
                        32:           </div>
                    33:         </div>
                34:
                35:         <div className="cta-section">
                    36:           <h3>Ready to get started?</h3>
                    37:           <p className="text-muted">
                        38:             Connect your wallet above to create or join your first Bitcoin Chama
                        39:           </p>
                    40:         </div>
                41:       </div>
            42:     </section>
    43:   );
    44:
}
