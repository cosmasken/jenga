
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChamaStore } from '../types/zustand';
import { Chama, Contribution } from '../types/chama';

export const useChamaStore = create<ChamaStore>()(
  persist(
    (set, get) => ({
      chamas: [],
      userChamas: [],
      availableChamas: [],
      selectedChama: null,
      contributions: [],
      isLoading: false,
      error: null,

      setChamas: (chamas: Chama[]) => {
        set({ chamas, error: null });
      },

      addChama: (chama: Chama) => {
        const { chamas } = get();
        set({ chamas: [...chamas, chama] });
      },

      updateChama: (chamaId: number, updates: Partial<Chama>) => {
        const { chamas } = get();
        const updatedChamas = chamas.map(chama =>
          chama.id === chamaId ? { ...chama, ...updates } : chama
        );
        set({ chamas: updatedChamas });
      },

      setSelectedChama: (selectedChama: Chama | null) => {
        set({ selectedChama });
      },

      addContribution: (contribution: Contribution) => {
        const { contributions } = get();
        set({ contributions: [...contributions, contribution] });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'jenga-chama-store',
      partialize: (state) => ({
        chamas: state.chamas,
        contributions: state.contributions,
      }),
    }
  )
);
