import { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export default function Toast({ 
  type, 
  message, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}: ToastProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-100';
      case 'error':
        return 'text-red-100';
      case 'warning':
        return 'text-yellow-100';
    }
  };

  return (
    <div className={`glassmorphism p-4 rounded-lg border ${getBorderColor()} animate-slide-up`}>
      <div className="flex items-center space-x-3">
        {getIcon()}
        <span className={`font-medium ${getTextColor()}`}>{message}</span>
        <button
          onClick={onClose}
          className={`ml-auto transition-colors ${
            type === 'success' ? 'text-green-400 hover:text-green-300' :
            type === 'error' ? 'text-red-400 hover:text-red-300' :
            'text-yellow-400 hover:text-yellow-300'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
