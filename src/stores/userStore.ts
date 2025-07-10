
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserStore } from '../types/zustand';
import { Achievement, Profile, Score } from '../types/user';

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      score: null,
      achievements: [],
      isLoading: false,
      error: null,

      setProfile: (profile: Profile) => {
        set({ profile, error: null });
      },

      updateScore: (score: Score) => {
        set({ score });
      },

      addAchievement: (achievement: Achievement) => {
        const { achievements } = get();
        const exists = achievements.find(a => a.id === achievement.id);
        if (!exists) {
          set({ achievements: [...achievements, achievement] });
        }
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearUser: () => {
        set({
          profile: null,
          score: null,
          achievements: [],
          error: null,
        });
      },
    }),
    {
      name: 'jenga-user-store',
      partialize: (state) => ({
        profile: state.profile,
        score: state.score,
        achievements: state.achievements,
      }),
    }
  )
);
