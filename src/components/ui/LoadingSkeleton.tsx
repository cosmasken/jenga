import React from 'react';

interface LoadingSkeletonProps {
  type?: 'dashboard' | 'chama-card' | 'list' | 'form' | 'stats';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'dashboard', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return (
          <div className="animate-pulse fade-in">
            {/* Header */}
            <div className="mb-8">
              <div className="h-8 skeleton rounded w-1/3 mb-2"></div>
              <div className="h-4 skeleton rounded w-1/2"></div>
            </div>
            
            {/* Stats Cards */}
            <div className="responsive-grid mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="stats-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 skeleton rounded-lg"></div>
                    <div className="w-16 h-6 skeleton rounded-full"></div>
                  </div>
                  <div className="h-8 skeleton rounded w-3/4 mb-1"></div>
                  <div className="h-4 skeleton rounded w-1/2"></div>
                </div>
              ))}
            </div>
            
            {/* Quick Actions */}
            <div className="stats-card mb-8">
              <div className="h-6 skeleton rounded w-1/4 mb-4"></div>
              <div className="responsive-grid">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 skeleton rounded-lg"></div>
                ))}
              </div>
            </div>
            
            {/* Chama Cards */}
            <div className="stats-card">
              <div className="h-6 skeleton rounded w-1/4 mb-6"></div>
              <div className="responsive-grid">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-6 border border-gray-200 dark:border-border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-6 skeleton rounded w-2/3"></div>
                      <div className="w-16 h-6 skeleton rounded-full"></div>
                    </div>
                    <div className="h-2 skeleton rounded-full mb-4"></div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="h-12 skeleton rounded"></div>
                      <div className="h-12 skeleton rounded"></div>
                    </div>
                    <div className="h-12 skeleton rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'chama-card':
        return (
          <div className="animate-pulse card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 skeleton rounded w-2/3"></div>
              <div className="w-16 h-6 skeleton rounded-full"></div>
            </div>
            <div className="h-2 skeleton rounded-full mb-4"></div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-12 skeleton rounded"></div>
              <div className="h-12 skeleton rounded"></div>
            </div>
            <div className="h-12 skeleton rounded-lg"></div>
          </div>
        );

      case 'list':
        return (
          <div className="animate-pulse space-y-4">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 card">
                <div className="w-12 h-12 skeleton rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 skeleton rounded w-3/4 mb-2"></div>
                  <div className="h-3 skeleton rounded w-1/2"></div>
                </div>
                <div className="h-6 skeleton rounded w-20"></div>
              </div>
            ))}
          </div>
        );

      case 'form':
        return (
          <div className="animate-pulse space-y-6">
            {[...Array(count)].map((_, i) => (
              <div key={i}>
                <div className="h-4 skeleton rounded w-1/4 mb-2"></div>
                <div className="h-12 skeleton rounded-lg"></div>
              </div>
            ))}
          </div>
        );

      case 'stats':
        return (
          <div className="animate-pulse stats-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 skeleton rounded-lg"></div>
              <div className="w-16 h-6 skeleton rounded-full"></div>
            </div>
            <div className="h-8 skeleton rounded w-3/4 mb-1"></div>
            <div className="h-4 skeleton rounded w-1/2"></div>
          </div>
        );

      default:
        return (
          <div className="animate-pulse">
            <div className="h-4 skeleton rounded w-full"></div>
          </div>
        );
    }
  };

  return <>{renderSkeleton()}</>;
};
