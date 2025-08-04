import React from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRosca } from '../hooks/useRosca';

/**
 * Dashboard component for logged-in users
 * Shows user stats, quick actions, and their chamas
 */
export function Dashboard() {
  const { primaryWallet, user } = useDynamicContext();
  const { isConnected, groupCount, getGroupCount } = useRosca();

  // Load group count when component mounts
  React.useEffect(() => {
    if (isConnected) {
      getGroupCount();
    }
  }, [isConnected, getGroupCount]);

  return (
    <section className="dashboard-section">
      {/* User Status */}
      <div className="wallet-status">
        <div className="status-indicator connected"></div>
        <span>
          Connected as {user?.email || `${primaryWallet?.address?.slice(0, 6)}...${primaryWallet?.address?.slice(-4)}`}
        </span>
      </div>

      {/* Dashboard Grid */}
      <div className="rosca-dashboard">
        {/* Stats Card */}
        <div className="rosca-card">
          <div className="rosca-card-header">
            <h3 className="rosca-card-title">Network Stats</h3>
            <span className="rosca-card-badge">Live</span>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value gradient-text">{groupCount}</div>
              <div className="stat-label">Total Chamas</div>
            </div>
            <div className="stat-item">
              <div className="stat-value gradient-text">₿ 0.00</div>
              <div className="stat-label">Your Balance</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="rosca-card">
          <div className="rosca-card-header">
            <h3 className="rosca-card-title">Quick Actions</h3>
            <span className="rosca-card-badge">New</span>
          </div>
          <div className="action-buttons">
            <button className="btn btn-primary">
              <span>🏗️</span>
              Create Chama
            </button>
            <button className="btn btn-secondary">
              <span>🔍</span>
              Browse Chamas
            </button>
          </div>
        </div>

        {/* Your Chamas Card */}
        <div className="rosca-card">
          <div className="rosca-card-header">
            <h3 className="rosca-card-title">Your Chamas</h3>
            <span className="rosca-card-badge">0</span>
          </div>
          <div className="empty-state">
            <p className="text-muted">
              You haven't joined any chamas yet. Create one or join an existing chama to get started!
            </p>
            <div className="action-buttons">
              <button className="btn btn-primary">
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="rosca-card">
          <div className="rosca-card-header">
            <h3 className="rosca-card-title">Recent Activity</h3>
            <span className="rosca-card-badge">New</span>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">🎉</div>
              <div className="activity-content">
                <p>Welcome to Jenga!</p>
                <span className="activity-time">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
