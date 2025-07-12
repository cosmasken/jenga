import React from 'react';
import { Loader2, Wallet, Network, Database, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Progress } from './progress';

export type LoadingType = 
  | 'wallet' 
  | 'network' 
  | 'transaction' 
  | 'data' 
  | 'contract' 
  | 'general';

export type LoadingState = 
  | 'idle' 
  | 'loading' 
  | 'success' 
  | 'error' 
  | 'timeout';

interface LoadingStateProps {
  type: LoadingType;
  state: LoadingState;
  message?: string;
  progress?: number;
  timeout?: number;
  onRetry?: () => void;
  onCancel?: () => void;
  className?: string;
}

const LoadingIcons = {
  wallet: Wallet,
  network: Network,
  transaction: Clock,
  data: Database,
  contract: Database,
  general: Loader2,
};

const LoadingMessages = {
  wallet: {
    loading: 'Connecting to wallet...',
    success: 'Wallet connected successfully',
    error: 'Failed to connect wallet',
    timeout: 'Wallet connection timed out',
  },
  network: {
    loading: 'Connecting to Citrea network...',
    success: 'Connected to network',
    error: 'Network connection failed',
    timeout: 'Network connection timed out',
  },
  transaction: {
    loading: 'Processing transaction...',
    success: 'Transaction confirmed',
    error: 'Transaction failed',
    timeout: 'Transaction timed out',
  },
  data: {
    loading: 'Loading data...',
    success: 'Data loaded successfully',
    error: 'Failed to load data',
    timeout: 'Data loading timed out',
  },
  contract: {
    loading: 'Interacting with smart contract...',
    success: 'Contract interaction successful',
    error: 'Contract interaction failed',
    timeout: 'Contract interaction timed out',
  },
  general: {
    loading: 'Loading...',
    success: 'Operation completed',
    error: 'Operation failed',
    timeout: 'Operation timed out',
  },
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  state,
  message,
  progress,
  timeout,
  onRetry,
  onCancel,
  className = '',
}) => {
  const Icon = LoadingIcons[type];
  const defaultMessage = LoadingMessages[type][state];
  const displayMessage = message || defaultMessage;

  const getStateColor = () => {
    switch (state) {
      case 'loading': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'timeout': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'success': return CheckCircle;
      case 'error': 
      case 'timeout': return AlertCircle;
      default: return Icon;
    }
  };

  const StateIcon = getStateIcon();
  const isAnimated = state === 'loading';

  return (
    <div className={`flex items-center gap-3 p-4 ${className}`}>
      <div className={`flex-shrink-0 ${getStateColor()}`}>
        <StateIcon 
          className={`w-5 h-5 ${isAnimated ? 'animate-spin' : ''}`} 
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className={`text-sm font-medium ${getStateColor()}`}>
            {displayMessage}
          </p>
          {timeout && state === 'loading' && (
            <Badge variant="outline" className="text-xs">
              {timeout}s
            </Badge>
          )}
        </div>
        
        {progress !== undefined && (
          <Progress value={progress} className="h-2 mt-2" />
        )}
        
        {(state === 'error' || state === 'timeout') && (onRetry || onCancel) && (
          <div className="flex gap-2 mt-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Retry
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Skeleton loading components
export const ChamaCardSkeleton: React.FC = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded w-full"></div>
          <div className="flex justify-between text-xs">
            <div className="h-3 bg-gray-200 rounded w-12"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    </CardContent>
  </Card>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Stats skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    
    {/* Chama cards skeleton */}
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <ChamaCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Transaction loading overlay
interface TransactionLoadingProps {
  isOpen: boolean;
  type: 'create' | 'join' | 'contribute' | 'start';
  hash?: string;
  onClose?: () => void;
}

export const TransactionLoading: React.FC<TransactionLoadingProps> = ({
  isOpen,
  type,
  hash,
  onClose,
}) => {
  if (!isOpen) return null;

  const getTransactionMessage = () => {
    switch (type) {
      case 'create': return 'Creating your chama...';
      case 'join': return 'Joining chama...';
      case 'contribute': return 'Processing contribution...';
      case 'start': return 'Starting chama...';
      default: return 'Processing transaction...';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {getTransactionMessage()}
              </h3>
              <p className="text-sm text-gray-600">
                Please confirm the transaction in your wallet and wait for confirmation.
              </p>
            </div>
            
            {hash && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Transaction Hash:</p>
                <p className="text-xs font-mono break-all">
                  {hash}
                </p>
              </div>
            )}
            
            <div className="flex justify-center">
              <Progress value={undefined} className="w-full h-2" />
            </div>
            
            {onClose && (
              <button
                onClick={onClose}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for managing loading states
export const useLoadingState = (initialState: LoadingState = 'idle') => {
  const [state, setState] = React.useState<LoadingState>(initialState);
  const [message, setMessage] = React.useState<string>('');
  const [progress, setProgress] = React.useState<number | undefined>();

  const setLoading = (msg?: string, prog?: number) => {
    setState('loading');
    if (msg) setMessage(msg);
    if (prog !== undefined) setProgress(prog);
  };

  const setSuccess = (msg?: string) => {
    setState('success');
    if (msg) setMessage(msg);
    setProgress(100);
  };

  const setError = (msg?: string) => {
    setState('error');
    if (msg) setMessage(msg);
    setProgress(undefined);
  };

  const reset = () => {
    setState('idle');
    setMessage('');
    setProgress(undefined);
  };

  return {
    state,
    message,
    progress,
    setLoading,
    setSuccess,
    setError,
    reset,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
  };
};
