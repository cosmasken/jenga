import React, { useEffect, useState } from 'react';

export interface ToastProps {
  id?: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  title, 
  description, 
  variant = 'default', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return '✅';
      case 'destructive':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getColors = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'destructive':
        return 'bg-red-500 text-white';
      default:
        return 'bg-bitcoin-orange text-white';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-20 left-4 right-4 z-60 ${getColors()} p-4 rounded-xl flex items-start space-x-3 shadow-lg animate-slide-up`}
    >
      <span className="text-xl">{getIcon()}</span>
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        {description && (
          <div className="text-sm opacity-90 mt-1">{description}</div>
        )}
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        className="opacity-70 hover:opacity-100 transition-opacity text-xl"
      >
        ×
      </button>
    </div>
  );
};

// Toast Provider Context (optional - for managing multiple toasts)
interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'onClose'>) => void;
}

export const ToastContext = React.createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const showToast = (toast: Omit<ToastProps, 'onClose'>) => {
    const id = Date.now().toString();
    const newToast = {
      ...toast,
      id,
      onClose: () => removeToast(id)
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    // Fallback for when ToastProvider is not used
    return {
      toast: (props: Omit<ToastProps, 'onClose'>) => {
        console.log('Toast:', props.title, props.description);
      }
    };
  }
  return { toast: context.showToast };
};
