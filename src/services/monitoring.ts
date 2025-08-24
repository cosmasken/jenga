/**
 * Production Monitoring and Analytics Service
 * Handles error tracking, performance monitoring, and user analytics
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

export interface ErrorInfo {
  error: Error;
  userId?: string;
  context?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  context?: Record<string, any>;
}

class MonitoringService {
  private isProduction = import.meta.env.PROD;
  private isInitialized = false;
  
  // In production, you'd integrate with services like:
  // - Sentry for error tracking
  // - Mixpanel/PostHog for analytics
  // - DataDog/New Relic for performance
  // - LogRocket for session recordings

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize error tracking (Sentry example)
      if (this.isProduction) {
        // await Sentry.init({
        //   dsn: import.meta.env.VITE_SENTRY_DSN,
        //   environment: import.meta.env.MODE,
        //   integrations: [
        //     new Sentry.BrowserTracing(),
        //   ],
        //   tracesSampleRate: 0.1,
        // });
        
        console.log('🔍 Production monitoring initialized');
      } else {
        console.log('🔍 Development monitoring enabled (console only)');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize monitoring:', error);
    }
  }

  /**
   * Track user events and blockchain interactions
   */
  trackEvent(event: AnalyticsEvent) {
    if (this.isProduction) {
      // Production: Send to analytics service
      // mixpanel.track(event.name, {
      //   ...event.properties,
      //   timestamp: event.timestamp || Date.now(),
      // });
      
      // PostHog example:
      // posthog.capture(event.name, event.properties);
    } else {
      // Development: Log to console
      console.log('📊 Analytics Event:', {
        name: event.name,
        properties: event.properties,
        userId: event.userId,
        timestamp: event.timestamp || Date.now(),
      });
    }
  }

  /**
   * Track errors with context
   */
  trackError(errorInfo: ErrorInfo) {
    const { error, userId, context, severity = 'medium' } = errorInfo;
    
    if (this.isProduction) {
      // Production: Send to error tracking service
      // Sentry.withScope((scope) => {
      //   if (userId) scope.setUser({ id: userId });
      //   scope.setLevel(severity);
      //   scope.setContext('errorContext', context || {});
      //   Sentry.captureException(error);
      // });
    } else {
      // Development: Enhanced console logging
      console.group(`🚨 Error Tracked [${severity.toUpperCase()}]`);
      console.error('Error:', error);
      console.log('User ID:', userId);
      console.log('Context:', context);
      console.log('Severity:', severity);
      console.groupEnd();
    }
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: PerformanceMetric) {
    if (this.isProduction) {
      // Production: Send to monitoring service
      // DataDog example:
      // DD_RUM.addTiming(metric.name, metric.value);
      
      // New Relic example:
      // newrelic.addCustomAttribute(metric.name, metric.value);
    } else {
      // Development: Log performance
      console.log(`⚡ Performance: ${metric.name} = ${metric.value}${metric.unit}`, metric.context);
    }
  }

  /**
   * Track blockchain transaction events
   */
  trackTransaction(type: 'join' | 'contribute' | 'start' | 'create', data: {
    chamaAddress?: string;
    txHash?: string;
    amount?: string;
    status: 'initiated' | 'confirmed' | 'failed';
    error?: string;
    gasUsed?: string;
    gasCost?: string;
  }) {
    this.trackEvent({
      name: `blockchain_${type}_${data.status}`,
      properties: {
        transaction_type: type,
        chama_address: data.chamaAddress,
        transaction_hash: data.txHash,
        amount: data.amount,
        gas_used: data.gasUsed,
        gas_cost: data.gasCost,
        error: data.error,
      },
    });

    // Track errors separately for failed transactions
    if (data.status === 'failed' && data.error) {
      this.trackError({
        error: new Error(`Transaction failed: ${data.error}`),
        context: {
          transaction_type: type,
          chama_address: data.chamaAddress,
          transaction_hash: data.txHash,
        },
        severity: 'high',
      });
    }
  }

  /**
   * Track user interactions
   */
  trackUserAction(action: string, properties?: Record<string, any>) {
    this.trackEvent({
      name: `user_${action}`,
      properties: {
        ...properties,
        page: window.location.pathname,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Track page views
   */
  trackPageView(page: string, properties?: Record<string, any>) {
    this.trackEvent({
      name: 'page_view',
      properties: {
        page,
        referrer: document.referrer,
        ...properties,
      },
    });
  }

  /**
   * Track API/blockchain call performance
   */
  trackApiCall(endpoint: string, duration: number, success: boolean, error?: string) {
    this.trackPerformance({
      name: `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}_duration`,
      value: duration,
      unit: 'ms',
      context: { endpoint, success, error },
    });

    if (!success && error) {
      this.trackError({
        error: new Error(`API call failed: ${error}`),
        context: { endpoint, duration },
        severity: 'medium',
      });
    }
  }

  /**
   * Set user context for tracking
   */
  setUser(userId: string, properties?: Record<string, any>) {
    if (this.isProduction) {
      // Sentry.setUser({ id: userId, ...properties });
      // mixpanel.identify(userId);
      // mixpanel.people.set(properties || {});
    } else {
      console.log('👤 User identified:', { userId, properties });
    }
  }

  /**
   * Clear user context (on logout)
   */
  clearUser() {
    if (this.isProduction) {
      // Sentry.setUser(null);
      // mixpanel.reset();
    } else {
      console.log('👤 User context cleared');
    }
  }

  /**
   * Track Web Vitals and performance
   */
  trackWebVitals() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Track Core Web Vitals
      import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
        onCLS((metric) => this.trackPerformance({
          name: 'cls',
          value: metric.value,
          unit: 'count',
          context: { rating: metric.rating },
        }));

        onFID((metric) => this.trackPerformance({
          name: 'fid',
          value: metric.value,
          unit: 'ms',
          context: { rating: metric.rating },
        }));

        onFCP((metric) => this.trackPerformance({
          name: 'fcp',
          value: metric.value,
          unit: 'ms',
          context: { rating: metric.rating },
        }));

        onLCP((metric) => this.trackPerformance({
          name: 'lcp',
          value: metric.value,
          unit: 'ms',
          context: { rating: metric.rating },
        }));

        onTTFB((metric) => this.trackPerformance({
          name: 'ttfb',
          value: metric.value,
          unit: 'ms',
          context: { rating: metric.rating },
        }));
      });
    }
  }
}

// Global monitoring instance
export const monitoring = new MonitoringService();

// Initialize monitoring
monitoring.initialize();

/**
 * React hook for tracking component lifecycle and errors
 */
export function useMonitoring(componentName: string) {
  const trackComponentEvent = (event: string, properties?: Record<string, any>) => {
    monitoring.trackEvent({
      name: `component_${componentName}_${event}`,
      properties: {
        component: componentName,
        ...properties,
      },
    });
  };

  const trackComponentError = (error: Error, context?: Record<string, any>) => {
    monitoring.trackError({
      error,
      context: {
        component: componentName,
        ...context,
      },
      severity: 'medium',
    });
  };

  return {
    trackComponentEvent,
    trackComponentError,
    trackUserAction: monitoring.trackUserAction.bind(monitoring),
    trackTransaction: monitoring.trackTransaction.bind(monitoring),
  };
}

/**
 * Higher-order function to track API calls
 */
export function withApiTracking<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  name: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    
    try {
      const result = await fn(...args);
      const duration = performance.now() - startTime;
      
      monitoring.trackApiCall(name, duration, true);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      monitoring.trackApiCall(name, duration, false, errorMessage);
      throw error;
    }
  };
}

/**
 * Production monitoring setup recommendations:
 * 
 * 1. **Error Tracking**: 
 *    - Sentry for error tracking and performance monitoring
 *    - LogRocket for session recordings and debugging
 * 
 * 2. **Analytics**: 
 *    - Mixpanel or PostHog for user behavior tracking
 *    - Google Analytics 4 for web analytics
 * 
 * 3. **Performance Monitoring**:
 *    - DataDog or New Relic for application performance
 *    - Web Vitals for Core Web Vitals tracking
 * 
 * 4. **Blockchain Specific**:
 *    - Alchemy Notify for transaction monitoring
 *    - The Graph for indexing blockchain events
 *    - Custom dashboards for gas usage and costs
 * 
 * 5. **User Experience**:
 *    - Hotjar for heatmaps and user sessions
 *    - FullStory for complete user session recordings
 */

export default monitoring;
