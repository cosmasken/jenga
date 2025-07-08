import { supabase } from './supabase'; // Use main Supabase client

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
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  reputation_score: number;
  total_contributions: number;
  total_payouts: number;
  chamas_joined: number;
  stacking_streak: number;
  preferred_language: string;
  location?: string;
  phone_number?: string;
  is_verified: boolean;
  onboarding_completed?: boolean;
  tutorial_steps_completed?: string[];
  chama_preferences?: {
    preferred_contribution_amount?: number;
    preferred_frequency?: 'weekly' | 'monthly';
    risk_tolerance?: 'low' | 'medium' | 'high';
    community_interests?: string[];
  };
  created_at: string;
  updated_at: string;
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
  // Simplified - user creation is now handled by authBridge
  static async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
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
    userId: string, 
    stepId: string, 
    metadata?: any
  ): Promise<boolean> {
    try {
      // Get current user profile
      const { data: profile, error: fetchError } = await supabase
        .from('users')
        .select('tutorial_steps_completed, onboarding_completed')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Update completed steps
      const currentSteps = profile?.tutorial_steps_completed || [];
      const updatedSteps = [...currentSteps, stepId];
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          tutorial_steps_completed: updatedSteps,
          onboarding_completed: updatedSteps.length >= ONBOARDING_STEPS.filter(s => s.required).length
        })
        .eq('id', userId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Error completing onboarding step:', error);
      return false;
    }
  }

  static async updateUserProfile(
    userId: string, 
    updates: Partial<Pick<UserProfile, 'username' | 'email' | 'first_name' | 'last_name'>>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
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
