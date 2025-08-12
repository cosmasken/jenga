import { toast as hotToast } from "react-hot-toast";

// Custom toast configurations with Bitcoin theme
export const toast = {
  success: (message: string) => {
    hotToast.success(`✅ ${message}`, {
      style: {
        background: '#000',
        color: '#fff',
        border: '1px solid #F7931A',
        fontFamily: 'IBM Plex Mono, monospace',
      },
      iconTheme: {
        primary: '#10B981',
        secondary: '#000',
      },
    });
  },
  
  error: (message: string) => {
    hotToast.error(`❌ ${message}`, {
      style: {
        background: '#000',
        color: '#fff',
        border: '1px solid #EF4444',
        fontFamily: 'IBM Plex Mono, monospace',
      },
      iconTheme: {
        primary: '#EF4444',
        secondary: '#000',
      },
    });
  },
  
  loading: (message: string) => {
    return hotToast.loading(message, {
      style: {
        background: '#000',
        color: '#fff',
        border: '1px solid #F7931A',
        fontFamily: 'IBM Plex Mono, monospace',
      },
    });
  },
  
  dismiss: hotToast.dismiss,
};
