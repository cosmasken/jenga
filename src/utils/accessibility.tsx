import React, { useEffect, useRef } from 'react';

// Screen reader announcement hook
export function useAnnouncement() {
  const announceRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority);
      announceRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  const AnnouncementRegion = () => (
    <div
      ref={announceRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    />
  );

  return { announce, AnnouncementRegion };
}

// Keyboard navigation hook
export function useKeyboardNavigation(
  elements: React.RefObject<HTMLElement>[],
  options: {
    loop?: boolean;
    onEscape?: () => void;
    onEnter?: (index: number) => void;
  } = {}
) {
  const { loop = true, onEscape, onEnter } = options;
  const [currentIndex, setCurrentIndex] = React.useState(-1);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          setCurrentIndex(prev => {
            const next = prev + 1;
            if (next >= elements.length) {
              return loop ? 0 : prev;
            }
            return next;
          });
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          setCurrentIndex(prev => {
            const next = prev - 1;
            if (next < 0) {
              return loop ? elements.length - 1 : 0;
            }
            return next;
          });
          break;

        case 'Enter':
        case ' ':
          if (currentIndex >= 0 && onEnter) {
            event.preventDefault();
            onEnter(currentIndex);
          }
          break;

        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;

        case 'Home':
          event.preventDefault();
          setCurrentIndex(0);
          break;

        case 'End':
          event.preventDefault();
          setCurrentIndex(elements.length - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, elements.length, loop, onEscape, onEnter]);

  // Focus the current element
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < elements.length) {
      elements[currentIndex].current?.focus();
    }
  }, [currentIndex, elements]);

  return { currentIndex, setCurrentIndex };
}

// Skip navigation component
export function SkipNavigation({ targets }: { targets: Array<{ id: string; label: string }> }) {
  return (
    <div className="sr-only focus-within:not-sr-only fixed top-0 left-0 z-[9999] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-2">
      <p className="text-sm font-semibold mb-2">Skip to:</p>
      <div className="flex flex-col gap-1">
        {targets.map(target => (
          <a
            key={target.id}
            href={`#${target.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
          >
            {target.label}
          </a>
        ))}
      </div>
    </div>
  );
}

// Focus management hook for modals and overlays
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstElementRef = useRef<HTMLElement | null>(null);
  const lastElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    firstElementRef.current = focusableElements[0] as HTMLElement;
    lastElementRef.current = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element when trap becomes active
    firstElementRef.current?.focus();

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElementRef.current) {
          event.preventDefault();
          lastElementRef.current?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElementRef.current) {
          event.preventDefault();
          firstElementRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isActive]);

  return containerRef;
}

// High contrast mode detection
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
}

// Reduced motion detection
export function useReducedMotion() {
  const [shouldReduceMotion, setShouldReduceMotion] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setShouldReduceMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return shouldReduceMotion;
}

// ARIA live region for dynamic content updates
interface LiveRegionProps {
  children: React.ReactNode;
  level?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

export function LiveRegion({ 
  children, 
  level = 'polite', 
  atomic = true, 
  relevant = 'all',
  className = ""
}: LiveRegionProps) {
  return (
    <div
      aria-live={level}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={className}
      role="status"
    >
      {children}
    </div>
  );
}

// Accessibility utilities
export const a11y = {
  // Generate unique IDs for form controls
  generateId: (prefix: string = 'element') => 
    `${prefix}-${Math.random().toString(36).substr(2, 9)}`,

  // ARIA attributes for buttons
  buttonProps: (label: string, expanded?: boolean, controls?: string) => ({
    'aria-label': label,
    ...(expanded !== undefined && { 'aria-expanded': expanded }),
    ...(controls && { 'aria-controls': controls }),
  }),

  // ARIA attributes for form fields
  fieldProps: (label: string, required?: boolean, describedBy?: string, invalid?: boolean) => ({
    'aria-label': label,
    ...(required && { 'aria-required': true }),
    ...(describedBy && { 'aria-describedby': describedBy }),
    ...(invalid && { 'aria-invalid': true }),
  }),

  // ARIA attributes for status indicators
  statusProps: (status: string, level: 'polite' | 'assertive' = 'polite') => ({
    role: 'status',
    'aria-live': level,
    'aria-label': status,
  }),
};
