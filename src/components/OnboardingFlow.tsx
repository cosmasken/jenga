import React, { useState } from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: 'Welcome to Jenga',
    subtitle: 'Join Bitcoin savings circles with friends and family. Save together, grow together.',
    icon: '👥',
  },
  {
    id: 2,
    title: 'Create Your Profile',
    subtitle: 'Set up your profile to get started',
    icon: '👤',
  },
  {
    id: 3,
    title: 'Join or Create a Chama',
    subtitle: 'Start saving with your community',
    icon: '➕',
  },
  {
    id: 4,
    title: "You're All Set!",
    subtitle: 'Welcome to Jenga. Start saving with your community today.',
    icon: '✅',
  },
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ open, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const { primaryWallet, user } = useDynamicContext();

  if (!open) return null;

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCompleteOnboarding = () => {
    // Store onboarding completion in localStorage
    localStorage.setItem('jenga_onboarding_completed', 'true');
    localStorage.setItem('jenga_user_display_name', displayName);
    
    // Trigger confetti effect (you can add this later)
    console.log('🎉 Onboarding completed!');
    
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Component
            title={steps[0].title}
            subtitle={steps[0].subtitle}
            icon={steps[0].icon}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <Step2Component
            title={steps[1].title}
            displayName={displayName}
            setDisplayName={setDisplayName}
            onNext={nextStep}
          />
        );
      case 3:
        return (
          <Step3Component
            title={steps[2].title}
            subtitle={steps[2].subtitle}
            onNext={nextStep}
          />
        );
      case 4:
        return (
          <Step4Component
            title={steps[3].title}
            subtitle={steps[3].subtitle}
            icon={steps[3].icon}
            onComplete={handleCompleteOnboarding}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-midnight z-50">
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                currentStep >= step.id 
                  ? 'bg-bitcoin-orange text-white shadow-bitcoin' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-1 rounded transition-all ${
                  currentStep > step.id 
                    ? 'bg-bitcoin-orange' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {getCurrentStepComponent()}
      </div>
    </div>
  );
};

function Step1Component({ title, subtitle, icon, onNext }: {
  title: string;
  subtitle: string;
  icon: string;
  onNext: () => void;
}) {
  return (
    <>
      <div className="w-24 h-24 bg-bitcoin-orange/10 rounded-full flex items-center justify-center mb-8">
        <span className="text-4xl">{icon}</span>
      </div>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">{subtitle}</p>
      <button
        onClick={onNext}
        className="bg-gradient-to-r from-bitcoin-orange to-bitcoin-orange-dark text-white px-8 py-4 rounded-xl font-medium hover:shadow-bitcoin transition-all"
      >
        Get Started
      </button>
    </>
  );
}

function Step2Component({ title, displayName, setDisplayName, onNext }: {
  title: string;
  displayName: string;
  setDisplayName: (name: string) => void;
  onNext: () => void;
}) {
  return (
    <>
      <h2 className="text-2xl font-bold mb-8">{title}</h2>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <button className="text-bitcoin-orange hover:text-bitcoin-orange-light transition-colors flex items-center space-x-2 mx-auto">
            <span>📷</span>
            <span>Add Photo</span>
          </button>
        </div>
        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent"
        />
      </div>
      <button
        onClick={onNext}
        disabled={!displayName.trim()}
        className="bg-gradient-to-r from-bitcoin-orange to-bitcoin-orange-dark text-white px-8 py-4 rounded-xl font-medium hover:shadow-bitcoin transition-all mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </>
  );
}

function Step3Component({ title, subtitle, onNext }: {
  title: string;
  subtitle: string;
  onNext: () => void;
}) {
  return (
    <>
      <h2 className="text-2xl font-bold mb-8">{title}</h2>
      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        <button className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-bitcoin-orange transition-colors">
          <span className="text-bitcoin-orange text-2xl mb-3 block">➕</span>
          <div className="font-medium">Create New Chama</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Start a savings circle</div>
        </button>
        <button className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-bitcoin-orange transition-colors">
          <span className="text-bitcoin-orange text-2xl mb-3 block">🔗</span>
          <div className="font-medium">Join with Invite</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Use invitation link</div>
        </button>
      </div>
      <button
        onClick={onNext}
        className="bg-gradient-to-r from-bitcoin-orange to-bitcoin-orange-dark text-white px-8 py-4 rounded-xl font-medium hover:shadow-bitcoin transition-all mt-8"
      >
        Continue
      </button>
    </>
  );
}

function Step4Component({ title, subtitle, icon, onComplete }: {
  title: string;
  subtitle: string;
  icon: string;
  onComplete: () => void;
}) {
  return (
    <>
      <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-8">
        <span className="text-green-500 text-4xl">{icon}</span>
      </div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">{subtitle}</p>
      <button
        onClick={onComplete}
        className="bg-gradient-to-r from-bitcoin-orange to-bitcoin-orange-dark text-white px-8 py-4 rounded-xl font-medium hover:shadow-bitcoin transition-all"
      >
        Go to Dashboard
      </button>
    </>
  );
}
