/**
 * Production-ready Error Boundary with user-friendly error handling
 * Replaces localStorage-dependent error handling with proper error states
 */

import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'component' | 'critical';
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

/**
 * Production Error Boundary with different fallback UIs based on error level
 */
export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
    
    // Log error to monitoring service in production
    this.logError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: React.ErrorInfo) {
    // In production, send to monitoring service (Sentry, LogRocket, etc.)
    console.group('🚨 Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
    
    // Example: Send to Sentry
    // Sentry.withScope((scope) => {
    //   scope.setTag('errorBoundary', true);
    //   scope.setLevel('error');
    //   scope.setContext('errorInfo', errorInfo);
    //   Sentry.captureException(error);
    // });
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
      });
    } else {
      // Max retries reached, reload page
      window.location.reload();
    }
  };

  private handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorReport = {
      errorId,
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    // Copy to clipboard for user to report
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
    alert('Error report copied to clipboard. Please paste it when reporting the issue.');
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Custom fallback
    if (this.props.fallback) {
      return this.props.fallback;
    }

    const { level = 'component' } = this.props;
    const { error, errorId } = this.state;

    // Critical level - full page error
    if (level === 'critical') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-red-200 dark:border-red-800">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-800 dark:text-red-200">
                Critical Error Occurred
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                <AlertDescription className="text-red-800 dark:text-red-200">
                  A critical error has occurred that prevents the application from working properly.
                  Please try refreshing the page or contact support if the issue persists.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Error Details:</p>
                <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                  {error?.message || 'Unknown error occurred'}
                </p>
                <p className="text-xs text-gray-500 mt-2">Error ID: {errorId}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw size={16} className="mr-2" />
                  Try Again ({this.maxRetries - this.retryCount} attempts left)
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex-1"
                >
                  <Home size={16} className="mr-2" />
                  Go Home
                </Button>
              </div>

              <Button 
                onClick={this.handleReportError}
                variant="ghost"
                size="sm"
                className="w-full text-gray-600"
              >
                <Bug size={14} className="mr-2" />
                Copy Error Report
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Page level error
    if (level === 'page') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={24} className="text-orange-600" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                We encountered an error while loading this page.
              </p>
              
              <div className="flex gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw size={16} className="mr-2" />
                  Retry
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex-1"
                >
                  <Home size={16} className="mr-2" />
                  Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Component level error (default)
    return (
      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <div className="space-y-2">
            <p className="font-medium">Component Error</p>
            <p className="text-sm">
              {error?.message || 'An error occurred in this component'}
            </p>
            <Button 
              onClick={this.handleRetry}
              size="sm"
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <RefreshCw size={14} className="mr-1" />
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
}

/**
 * Higher-order component for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  level: Props['level'] = 'component'
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary level={level}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for handling async errors in components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);
  
  const resetError = React.useCallback(() => setError(null), []);
  
  const handleError = React.useCallback((error: Error) => {
    console.error('Async error caught:', error);
    setError(error);
  }, []);
  
  // Throw error to be caught by error boundary
  if (error) {
    throw error;
  }
  
  return { handleError, resetError };
}

/**
 * Query Error Fallback for TanStack Query
 */
export function QueryErrorFallback({ 
  error, 
  refetch 
}: { 
  error: Error; 
  refetch: () => void; 
}) {
  return (
    <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800 dark:text-red-200">
        <div className="space-y-2">
          <p className="font-medium">Failed to load data</p>
          <p className="text-sm">{error.message}</p>
          <Button 
            onClick={refetch}
            size="sm"
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw size={14} className="mr-1" />
            Try Again
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
