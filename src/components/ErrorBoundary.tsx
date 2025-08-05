/**
 * Error Boundary Component
 * Catches React errors and displays user-friendly error messages
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useErrorBoundary } from '@/hooks/use-error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In a real app, you'd send this to your error reporting service
    console.error('Bug report:', errorDetails);
    
    // For now, copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    alert('Error details copied to clipboard. Please share with support.');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="border-destructive/20">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-destructive">Something went wrong</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    We encountered an unexpected error. This has been logged and we'll look into it.
                  </p>
                  
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="text-left bg-muted p-3 rounded-md text-xs mb-4">
                      <summary className="cursor-pointer font-medium mb-2">
                        Error Details (Development)
                      </summary>
                      <div className="space-y-2">
                        <div>
                          <strong>Error:</strong> {this.state.error.message}
                        </div>
                        {this.state.error.stack && (
                          <div>
                            <strong>Stack:</strong>
                            <pre className="whitespace-pre-wrap text-xs mt-1">
                              {this.state.error.stack}
                            </pre>
                          </div>
                        )}
                        {this.state.errorInfo?.componentStack && (
                          <div>
                            <strong>Component Stack:</strong>
                            <pre className="whitespace-pre-wrap text-xs mt-1">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={this.handleRetry}
                    variant="bitcoin"
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  
                  <Button 
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                  
                  <Button 
                    onClick={this.handleReportBug}
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                  >
                    <Bug className="h-3 w-3 mr-2" />
                    Report Bug
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based Error Boundary wrapper
 */
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ErrorBoundaryWrapper({ children, fallback }: ErrorBoundaryWrapperProps) {
  const { logError } = useErrorBoundary();

  return (
    <ErrorBoundary onError={logError} fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * Lightweight Error Fallback for smaller components
 */
interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
}

export function ErrorFallback({ 
  error, 
  resetError, 
  title = "Something went wrong",
  message = "Please try again or refresh the page."
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      
      <h3 className="text-lg font-semibold text-destructive mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {message}
      </p>
      
      {process.env.NODE_ENV === 'development' && error && (
        <details className="text-left bg-muted p-3 rounded-md text-xs mb-4 max-w-md">
          <summary className="cursor-pointer font-medium mb-2">
            Error Details
          </summary>
          <pre className="whitespace-pre-wrap">
            {error.message}
          </pre>
        </details>
      )}
      
      {resetError && (
        <Button onClick={resetError} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}
