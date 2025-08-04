follow the following instrcutions tep by step
 convert the following landing page import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Bitcoin, 
  Users, 
  Shield, 
  TrendingUp, 
  Wallet, 
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { getWeb3Auth } from '@/lib/web3auth-config';
import ThemeToggle from '@/components/ThemeToggle';

export default function LandingPage() {
  const { isFullyAuthenticated } = useAppStore();
  const [, setLocation] = useLocation();

  const handleConnect = async () => {
    const web3auth = getWeb3Auth();
    if (web3auth) {
      await web3auth.connect();
    }
  };

  // Redirect authenticated users away from landing page
  useEffect(() => {
    if (isFullyAuthenticated()) {
      console.log('🔄 Authenticated user on landing page, redirecting to dashboard');
      setLocation('/');
    }
  }, [isFullyAuthenticated, setLocation]);

  // Don't render landing page content if user is authenticated
  if (isFullyAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-bitcoin/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bitcoin className="text-bitcoin" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Redirecting...</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You're already logged in. Taking you to your dashboard.
          </p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <Bitcoin className="text-bitcoin" size={24} />,
      title: "Bitcoin-Powered Savings",
      description: "Save in cBTC on Citrea, Bitcoin's most secure Layer 2"
    },
    {
      icon: <Users className="text-blue-600" size={24} />,
      title: "Community-Driven",
      description: "Join trusted savings circles with family and friends"
    },
    {
      icon: <Shield className="text-green-600" size={24} />,
      title: "Smart Contract Security",
      description: "Transparent, automated, and trustless group management"
    },
    {
      icon: <TrendingUp className="text-purple-600" size={24} />,
      title: "Guaranteed Returns",
      description: "Receive your full payout when it's your turn"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Savers" },
    { number: "$2.5M+", label: "Total Saved" },
    { number: "500+", label: "Groups Created" },
    { number: "99.8%", label: "Success Rate" }
  ];

  const testimonials = [
    {
      name: "Maria Rodriguez",
      role: "Family Group Organizer",
      content: "ROSCA helped our family save $12,000 for our new home. The Bitcoin backing gives us confidence in our savings.",
      avatar: "👩‍💼"
    },
    {
      name: "James Chen",
      role: "Community Leader",
      content: "Managing our neighborhood savings circle is so much easier with smart contracts. Everyone trusts the process.",
      avatar: "👨‍💻"
    },
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      content: "Our workplace ROSCA helped 20 employees build emergency funds. The transparency is incredible.",
      avatar: "👩‍🚀"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-bitcoin/5 via-background to-yellow-400/5">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-bitcoin rounded-full flex items-center justify-center">
                <Bitcoin className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold">ROSCA</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Bitcoin Savings Circles</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <ThemeToggle />
              <Button 
                onClick={handleConnect}
                className="bg-bitcoin hover:bg-bitcoin/90 text-white text-sm sm:text-base"
              >
                <Wallet size={16} className="mr-2" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="inline sm:hidden">Connect</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 bg-bitcoin/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bitcoin className="text-bitcoin" size={40} />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-bitcoin to-yellow-500 bg-clip-text text-transparent">
              Save Together,<br />Grow Together
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Join the future of community savings with Bitcoin-powered ROSCA circles. 
              Transparent, secure, and built for families, friends, and communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleConnect}
                size="lg"
                className="bg-bitcoin hover:bg-bitcoin/90 text-white px-8 py-4 text-lg"
              >
                <Wallet size={20} className="mr-2" />
                Start Saving Now
                <ArrowRight size={20} className="ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn How It Works
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-bitcoin mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose ROSCA?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Built on Bitcoin's security with modern smart contract technology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white/50 dark:bg-gray-900/50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How ROSCA Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Simple, transparent, and automated savings circles
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-bitcoin/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-bitcoin">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create or Join</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start a savings circle with friends and family, or join an existing group
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-bitcoin/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-bitcoin">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Contribute Monthly</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Everyone contributes the same amount each month in cBTC
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-bitcoin/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-bitcoin">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Receive Payout</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Take turns receiving the full pool amount when it's your turn
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Real stories from real savers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xl">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-bitcoin to-yellow-500 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Your Savings Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of families building wealth together with Bitcoin-powered ROSCA circles
            </p>
            <Button 
              onClick={handleConnect}
              size="lg"
              className="bg-white text-bitcoin hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              <Wallet size={20} className="mr-2" />
              Connect Wallet & Start Saving
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bitcoin className="text-bitcoin" size={24} />
                <span className="text-xl font-bold">ROSCA</span>
              </div>
              <p className="text-gray-400 text-sm">
                Bitcoin-powered savings circles for families, friends, and communities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>How It Works</li>
                <li>Security</li>
                <li>Pricing</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Discord</li>
                <li>Twitter</li>
                <li>Telegram</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Bug Reports</li>
                <li>Feature Requests</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 ROSCA. Built on Citrea, Bitcoin's Layer 2. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
 to replace our current bland landing page


review the following modlas and create versions for our which are compatible with or contract, modify  or remove parameters that exist in these modals but dont match our userosca hook.

onboardingflow 
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, Plus, Link, Check, Camera } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import confetti from '@/lib/confetti';

const steps = [
  {
    id: 1,
    title: 'Welcome to ROSCA',
    subtitle: 'Join savings circles with friends and family. Save together, grow together.',
    icon: Users,
  },
  {
    id: 2,
    title: 'Create Your Profile',
    subtitle: 'Set up your profile to get started',
    icon: User,
  },
  {
    id: 3,
    title: 'Join or Create a Group',
    subtitle: 'Start saving with your community',
    icon: Plus,
  },
  {
    id: 4,
    title: "You're All Set!",
    subtitle: 'Welcome to ROSCA. Start saving with your community today.',
    icon: Check,
  },
];

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const { hasCompletedOnboarding, completeOnboarding, connectedWallet, setCurrentView, loadGroups } = useAppStore();

  if (hasCompletedOnboarding) return null;

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCompleteOnboarding = () => {
    completeOnboarding({ 
      id: Date.now().toString(),
      displayName,
      avatar: '/api/placeholder/32/32',
      walletAddress: connectedWallet || 'demo-wallet'
    });
    confetti();
    setTimeout(() => {
      if (setCurrentView) setCurrentView('dashboard');
      if (loadGroups) loadGroups();
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
    <div className="fixed inset-0 bg-white dark:bg-midnight z-40">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center h-full p-6 text-center"
        >
          {getCurrentStepComponent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Step1Component({ title, subtitle, icon: Icon, onNext }: {
  title: string;
  subtitle: string;
  icon: any;
  onNext: () => void;
}) {
  return (
    <>
      <div className="w-24 h-24 bg-bitcoin/10 rounded-full flex items-center justify-center mb-8">
        <Icon className="text-bitcoin text-4xl" size={48} />
      </div>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">{subtitle}</p>
      <Button
        onClick={onNext}
        className="bg-bitcoin hover:bg-bitcoin/90 text-white px-8 py-4 rounded-xl font-medium min-h-[48px]"
      >
        Get Started
      </Button>
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
            <User className="text-gray-500 text-2xl" size={32} />
          </div>
          <button className="text-bitcoin hover:text-bitcoin/80 transition-colors flex items-center space-x-2 mx-auto">
            <Camera size={16} />
            <span>Add Photo</span>
          </button>
        </div>
        <Input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-4 min-h-[48px]"
        />
      </div>
      <Button
        onClick={onNext}
        disabled={!displayName.trim()}
        className="bg-bitcoin hover:bg-bitcoin/90 text-white px-8 py-4 rounded-xl font-medium min-h-[48px] mt-8"
      >
        Continue
      </Button>
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
        <button className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-bitcoin transition-colors min-h-[48px]">
          <Plus className="text-bitcoin text-2xl mb-3 mx-auto" size={32} />
          <div className="font-medium">Create New Group</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Start a savings circle</div>
        </button>
        <button className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-bitcoin transition-colors min-h-[48px]">
          <Link className="text-bitcoin text-2xl mb-3 mx-auto" size={32} />
          <div className="font-medium">Join with Invite</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Use invitation link</div>
        </button>
      </div>
      <Button
        onClick={onNext}
        className="bg-bitcoin hover:bg-bitcoin/90 text-white px-8 py-4 rounded-xl font-medium min-h-[48px] mt-8"
      >
        Continue
      </Button>
    </>
  );
}

function Step4Component({ title, subtitle, icon: Icon, onComplete }: {
  title: string;
  subtitle: string;
  icon: any;
  onComplete: () => void;
}) {
  return (
    <>
      <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-8">
        <Icon className="text-green-500 text-4xl" size={48} />
      </div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">{subtitle}</p>
      <Button
        onClick={onComplete}
        className="bg-bitcoin hover:bg-bitcoin/90 text-white px-8 py-4 rounded-xl font-medium min-h-[48px]"
      >
        Go to Dashboard
      </Button>
    </>
  );
}


payment modal 
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRoscaContract } from '@/hooks/useRoscaContract';
import { useContractIntegration } from '@/hooks/useContractIntegration';

export default function PaymentModal() {
  const { showPaymentModal, selectedPaymentGroup, togglePaymentModal } = useAppStore();
  const { makeContribution, loading } = useRoscaContract();
  const { refreshGroupData } = useContractIntegration();
  const { toast } = useToast();

  const handleConfirmPayment = async () => {
    if (!selectedPaymentGroup) return;

    try {
      await makeContribution(parseInt(selectedPaymentGroup.id), selectedPaymentGroup.contributionAmount);
      
      toast({
        title: "Payment Successful! ✅",
        description: "Your contribution has been confirmed.",
      });
      
      togglePaymentModal(false);
      
      // Refresh the specific group data to show updated payment status
      await refreshGroupData(selectedPaymentGroup.id);
      
    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!showPaymentModal || !selectedPaymentGroup) return null;

  // Network fee for Citrea (Bitcoin L2) transactions
  const networkFee = 2.50;
  const total = selectedPaymentGroup.contributionAmount + networkFee;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        onClick={() => togglePaymentModal(false)}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-bitcoin/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="text-bitcoin text-2xl" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Monthly Contribution</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Pay your ${selectedPaymentGroup.contributionAmount} contribution to {selectedPaymentGroup.name}
              </p>
            </div>
            <button
              onClick={() => togglePaymentModal(false)}
              className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
              <span className="font-semibold">${selectedPaymentGroup.contributionAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Network Fee</span>
              <span className="font-semibold">${networkFee.toFixed(2)}</span>
            </div>
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-bitcoin">${total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="w-full bg-bitcoin hover:bg-bitcoin/90 text-white py-3 rounded-xl font-medium min-h-[48px]"
            >
              {loading ? 'Processing...' : 'Confirm Payment'}
            </Button>
            <Button
              onClick={() => togglePaymentModal(false)}
              variant="outline"
              className="w-full py-3 rounded-xl font-medium min-h-[48px]"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


invitemodal 
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  DollarSign, 
  RotateCcw, 
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useInviteStore } from '@/store/useInviteStore';
import { useAppStore } from '@/store/useAppStore';
import { useRoscaContract } from '@/hooks/useRoscaContract';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatExpiryDate, isInviteExpired } from '@/lib/invite-utils';

export default function InvitePreviewModal() {
  const { currentInvite, showInvitePreview, toggleInvitePreview, markAsJoined } = useInviteStore();
  const { user, addGroup } = useAppStore();
  const { joinGroup, loading } = useRoscaContract();
  const { toast } = useToast();
  
  const [isJoining, setIsJoining] = useState(false);

  if (!showInvitePreview || !currentInvite) return null;

  const { inviteData } = currentInvite;
  const isExpired = isInviteExpired(inviteData.expiresAt);
  const canJoin = !isExpired && !currentInvite.hasJoined;

  const handleJoinGroup = async () => {
    if (!user || !canJoin) return;

    setIsJoining(true);
    try {
      // Call smart contract to join group
      await joinGroup(parseInt(inviteData.groupId));
      
      // Mark invite as joined
      markAsJoined(currentInvite.inviteCode);
      
      // Add group to user's groups (this would normally come from contract events)
      const newGroup = {
        id: inviteData.groupId,
        name: inviteData.groupName,
        description: `ROSCA group created by ${inviteData.creatorName}`,
        totalMembers: inviteData.currentMembers + 1,
        contributionAmount: inviteData.contributionAmount,
        totalRounds: inviteData.totalRounds,
        currentRound: 1,
        status: 'active' as const,
        isUserTurn: false,
        isUserPaid: false,
        poolBalance: inviteData.contributionAmount * (inviteData.currentMembers + 1),
        nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        currentRecipient: '',
        members: []
      };
      
      addGroup(newGroup);
      
      toast({
        title: "🎉 Welcome to the group!",
        description: `You've successfully joined "${inviteData.groupName}"`,
      });
      
      // Close modal
      toggleInvitePreview(false);
      
    } catch (error: any) {
      console.error('Failed to join group:', error);
      toast({
        title: "Failed to join group",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.3, opacity: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Group Invitation</h2>
            <button
              onClick={() => toggleInvitePreview(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Invite Status */}
          {currentInvite.hasJoined && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                <CheckCircle size={20} />
                <span className="font-medium">Already joined this group</span>
              </div>
            </div>
          )}

          {isExpired && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                <AlertCircle size={20} />
                <span className="font-medium">This invitation has expired</span>
              </div>
            </div>
          )}

          {/* Group Details */}
          <div className="bg-gradient-to-r from-bitcoin/10 to-yellow-400/10 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-xl mb-3">{inviteData.groupName}</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <DollarSign size={18} className="text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contribution</p>
                  <p className="font-semibold">${inviteData.contributionAmount}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <RotateCcw size={18} className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Rounds</p>
                  <p className="font-semibold">{inviteData.totalRounds}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users size={18} className="text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
                  <p className="font-semibold">{inviteData.currentMembers}/{inviteData.totalRounds}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <User size={18} className="text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Invited by</p>
                  <p className="font-semibold">{inviteData.creatorName}</p>
                </div>
              </div>
            </div>

            {inviteData.expiresAt && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock size={16} className="text-gray-500" />
                <span className={`${isExpired ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
                  {formatExpiryDate(inviteData.expiresAt)}
                </span>
              </div>
            )}
          </div>

          {/* How ROSCA Works */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              How this ROSCA works:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Everyone contributes ${inviteData.contributionAmount} each round</li>
              <li>• One member receives the full pool each round</li>
              <li>• Total payout: ${inviteData.contributionAmount * inviteData.totalRounds}</li>
              <li>• {inviteData.totalRounds} rounds = {inviteData.totalRounds} weeks to complete</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={() => toggleInvitePreview(false)}
              variant="outline"
              className="flex-1"
            >
              Maybe Later
            </Button>
            
            <Button
              onClick={handleJoinGroup}
              disabled={!canJoin || isJoining || loading}
              className="flex-1 bg-bitcoin hover:bg-bitcoin/90 text-white"
            >
              {isJoining || loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Joining...
                </>
              ) : currentInvite.hasJoined ? (
                'Already Joined'
              ) : isExpired ? (
                'Expired'
              ) : (
                'Join Group'
              )}
            </Button>
          </div>

          {/* Trust Warning */}
          {canJoin && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>⚠️ Important:</strong> Only join ROSCA groups with people you trust. 
                All members must contribute on time for the group to succeed.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
toast.tsx 
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface ToastProps {
  id?: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ 
  title, 
  description, 
  variant = 'default', 
  duration = 3000, 
  onClose 
}: ToastProps) {
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
        return <CheckCircle size={20} />;
      case 'destructive':
        return <XCircle size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const getColors = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'destructive':
        return 'bg-red-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className={`fixed top-20 left-4 right-4 z-60 ${getColors()} p-4 rounded-xl flex items-start space-x-3 shadow-lg`}
        >
          {getIcon()}
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
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


claimrewards 
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Loader2, Bitcoin, Trophy } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function ClaimRewardsModal() {
  const { showClaimRewardsModal, toggleClaimRewardsModal, claimRewards, isLoading, user } = useAppStore();
  const { toast } = useToast();

  const rewards = {
    bitcoinEarned: 0.00125,
    reputationBonus: 0.1,
    completionBonus: 50,
  };

  const handleClaim = async () => {
    try {
      if (claimRewards) {
        await claimRewards();
      }
      
      toast({
        title: "🎉 Rewards Claimed!",
        description: `You've earned ${rewards.bitcoinEarned} BTC and +${rewards.reputationBonus} reputation!`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "Could not claim rewards. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!showClaimRewardsModal) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => toggleClaimRewardsModal(false)}
      >
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.3, opacity: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-bitcoin/10 rounded-full flex items-center justify-center">
                <Gift className="text-bitcoin" size={20} />
              </div>
              <h2 className="text-xl font-bitcoin text-bitcoin">Claim Rewards</h2>
            </div>
            <button
              onClick={() => toggleClaimRewardsModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-br from-bitcoin to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Trophy className="text-white" size={40} />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You've completed your round successfully
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-bitcoin/10 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Bitcoin className="text-bitcoin" size={24} />
                <div>
                  <p className="font-semibold">Bitcoin Reward</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">For participation</p>
                </div>
              </div>
              <span className="font-bold text-bitcoin">₿{rewards.bitcoinEarned}</span>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">★</span>
                </div>
                <div>
                  <p className="font-semibold">Reputation Boost</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Trust score increase</p>
                </div>
              </div>
              <span className="font-bold text-green-600">+{rewards.reputationBonus}</span>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">$</span>
                </div>
                <div>
                  <p className="font-semibold">Completion Bonus</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Platform points</p>
                </div>
              </div>
              <span className="font-bold text-blue-600">{rewards.completionBonus} pts</span>
            </motion.div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Current Reputation:</span>
              <span>{user?.reputation.toFixed(1)}/5.0</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-bitcoin to-yellow-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((user?.reputation || 0) / 5) * 100}%` }}
              />
            </div>
          </div>

          <Button
            onClick={handleClaim}
            disabled={isLoading}
            className="w-full mt-6 bg-bitcoin hover:bg-bitcoin/90 text-white py-3 font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Claiming Rewards...
              </>
            ) : (
              'Claim All Rewards'
            )}
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
