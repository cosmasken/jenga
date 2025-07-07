import { createClient } from '@supabase/supabase-js';

// Supabase client setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables not configured. Onboarding features will be limited.');
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  required: boolean;
  order: number;
}

export interface UserProfile {
  id: string;
  wallet_address: string;
  email?: string;
  display_name?: string;
  onboarding_completed: boolean;
  tutorial_steps_completed: string[];
  chama_preferences?: {
    preferred_contribution_amount?: number;
    preferred_frequency?: 'weekly' | 'monthly';
    risk_tolerance?: 'low' | 'medium' | 'high';
    community_interests?: string[];
  };
  created_at: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Jenga',
    description: 'Learn about Bitcoin-native community lending circles',
    component: 'WelcomeStep',
    required: true,
    order: 1
  },
  {
    id: 'wallet_setup',
    title: 'Wallet Setup',
    description: 'Connect and configure your wallet for Citrea',
    component: 'WalletSetupStep',
    required: true,
    order: 2
  },
  {
    id: 'profile_creation',
    title: 'Create Profile',
    description: 'Set up your community profile',
    component: 'ProfileCreationStep',
    required: true,
    order: 3
  },
  {
    id: 'chama_education',
    title: 'Understanding Chamas',
    description: 'Learn how rotating savings circles work',
    component: 'ChamaEducationStep',
    required: true,
    order: 4
  },
  {
    id: 'first_contribution',
    title: 'Make Your First Contribution',
    description: 'Join a practice chama or create your own',
    component: 'FirstContributionStep',
    required: false,
    order: 5
  }
];

export class OnboardingService {
  static async createUserProfile(walletAddress: string, email?: string): Promise<UserProfile | null> {
    if (!supabase) {
      console.warn('Supabase not configured, using localStorage fallback');
      // Fallback to localStorage for development
      const profile: UserProfile = {
        id: walletAddress,
        wallet_address: walletAddress,
        email,
        onboarding_completed: false,
        tutorial_steps_completed: [],
        created_at: new Date().toISOString()
      };
      localStorage.setItem(`jenga_profile_${walletAddress}`, JSON.stringify(profile));
      return profile;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            wallet_address: walletAddress,
            email,
            onboarding_completed: false,
            tutorial_steps_completed: []
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  static async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    if (!supabase) {
      // Fallback to localStorage
      const stored = localStorage.getItem(`jenga_profile_${walletAddress}`);
      return stored ? JSON.parse(stored) : null;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  static async completeOnboardingStep(
    walletAddress: string, 
    stepId: string, 
    metadata?: any
  ): Promise<boolean> {
    if (!supabase) {
      // Fallback to localStorage
      const stored = localStorage.getItem(`jenga_profile_${walletAddress}`);
      if (!stored) return false;
      
      const profile: UserProfile = JSON.parse(stored);
      const updatedSteps = [...profile.tutorial_steps_completed, stepId];
      profile.tutorial_steps_completed = updatedSteps;
      profile.onboarding_completed = updatedSteps.length >= ONBOARDING_STEPS.filter(s => s.required).length;
      
      localStorage.setItem(`jenga_profile_${walletAddress}`, JSON.stringify(profile));
      return true;
    }

    try {
      // Get current user profile
      const profile = await this.getUserProfile(walletAddress);
      if (!profile) return false;

      // Update completed steps
      const updatedSteps = [...profile.tutorial_steps_completed, stepId];
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          tutorial_steps_completed: updatedSteps,
          onboarding_completed: updatedSteps.length >= ONBOARDING_STEPS.filter(s => s.required).length
        })
        .eq('wallet_address', walletAddress);

      if (updateError) throw updateError;

      // Log the step completion
      const { error: logError } = await supabase
        .from('onboarding_progress')
        .insert([
          {
            user_id: profile.id,
            step_name: stepId,
            metadata
          }
        ]);

      if (logError) throw logError;
      return true;
    } catch (error) {
      console.error('Error completing onboarding step:', error);
      return false;
    }
  }

  static async updateUserPreferences(
    walletAddress: string, 
    preferences: Partial<UserProfile['chama_preferences']>
  ): Promise<boolean> {
    if (!supabase) {
      // Fallback to localStorage
      const stored = localStorage.getItem(`jenga_profile_${walletAddress}`);
      if (!stored) return false;
      
      const profile: UserProfile = JSON.parse(stored);
      profile.chama_preferences = { ...profile.chama_preferences, ...preferences };
      localStorage.setItem(`jenga_profile_${walletAddress}`, JSON.stringify(profile));
      return true;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          chama_preferences: preferences
        })
        .eq('wallet_address', walletAddress);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }

  static getNextOnboardingStep(completedSteps: string[]): OnboardingStep | null {
    const nextStep = ONBOARDING_STEPS
      .filter(step => !completedSteps.includes(step.id))
      .sort((a, b) => a.order - b.order)[0];
    
    return nextStep || null;
  }

  static getOnboardingProgress(completedSteps: string[]): {
    completed: number;
    total: number;
    percentage: number;
  } {
    const requiredSteps = ONBOARDING_STEPS.filter(s => s.required);
    const completedRequired = completedSteps.filter(step => 
      requiredSteps.some(rs => rs.id === step)
    );

    return {
      completed: completedRequired.length,
      total: requiredSteps.length,
      percentage: Math.round((completedRequired.length / requiredSteps.length) * 100)
    };
  }
}
