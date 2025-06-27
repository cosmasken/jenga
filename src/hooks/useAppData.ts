import useAppStore from '@/store/appStore';
import type { AppStore } from '@/store/appStore';

// Hook to get the entire store
export const useAppData = () => {
  return useAppStore();
};

// Hook to get user data
export const useUser = () => {
  return useAppStore(state => state.user);
};

// Hook to get chamas data
export const useChamas = () => {
  return useAppStore(state => state.chamas);
};

// Hook to get a specific chama by ID
export const useChama = (id: number) => {
  return useAppStore(state => 
    state.chamas.find(chama => chama.id === id)
  );
};

// Hook to get networks
export const useNetworks = () => {
  return useAppStore(state => state.networks);
};

// Hook to get app settings
export const useSettings = () => {
  return useAppStore(state => state.settings);
};

// Hook to update user data
export const useUpdateUser = () => {
  return useAppStore(state => (userData: Partial<AppStore['user']>) => {
    state.user = { ...state.user, ...userData };
  });
};

// Hook to update settings
export const useUpdateSettings = () => {
  return useAppStore(state => (settings: Partial<AppStore['settings']>) => {
    state.settings = { ...state.settings, ...settings };
  });
};
