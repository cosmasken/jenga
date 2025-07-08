import { supabase } from './supabase'

// Simplified onboarding - just 3 essential steps
export interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: string
  required: boolean
}

export const SIMPLE_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Jenga',
    description: 'Your Bitcoin-native savings companion',
    icon: '👋',
    required: true
  },
  {
    id: 'understand_chamas',
    title: 'What are Chamas?',
    description: 'Community savings circles that help you save together',
    icon: '🤝',
    required: true
  },
  {
    id: 'ready_to_start',
    title: 'Ready to Start!',
    description: 'Start stacking sats or join a savings circle',
    icon: '🚀',
    required: true
  }
]

export class SimpleOnboardingService {
  // Complete onboarding for a user
  static async completeOnboarding(walletAddress: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
          tutorial_steps_completed: SIMPLE_ONBOARDING_STEPS.map(step => step.id),
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress)

      if (error) throw error
      
      console.log('✅ Onboarding completed for:', walletAddress)
      return true
    } catch (error) {
      console.error('❌ Failed to complete onboarding:', error)
      return false
    }
  }

  // Check if user needs onboarding
  static needsOnboarding(user: any): boolean {
    return !user?.onboarding_completed
  }

  // Skip onboarding (for users who want to dive right in)
  static async skipOnboarding(walletAddress: string): Promise<boolean> {
    return this.completeOnboarding(walletAddress)
  }
}
