import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Bitcoin,
  Users,
  Shield,
  TrendingUp,
  Wallet,
  ArrowRight,
  Star,
  ChevronDown,
  ChevronRight,
  Lock,
  Zap,
  Globe,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DynamicConnectButton } from '@/components/ui/dynamic-connect-button';
import { WalletDropdown, CompactWalletButton } from '@/components/WalletDropdown';
import { ThemeToggle } from '@/components/theme-toggle';
import { DevDatabaseSetup } from '@/components/DevDatabaseSetup';
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";

export default function LandingPage() {
  const isLoggedIn = useIsLoggedIn();
  const [, setLocation] = useLocation();

  // Redirect authenticated users away from landing page
  // Note: Onboarding status is now handled by App.tsx through database checks
  useEffect(() => {
    if (isLoggedIn) {
      console.log('🔄 User connected wallet on landing page');
      // Let App.tsx handle onboarding logic through database checks
      // If user has completed onboarding, they will be redirected by App.tsx
      console.log('🔄 App component will handle onboarding status through database checks');
    }
  }, [isLoggedIn]);

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
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-bitcoin rounded-full flex items-center justify-center">
                <Bitcoin className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">ROSCA</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">Bitcoin Savings Circles</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-3">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              {isLoggedIn ? (
                <CompactWalletButton />
              ) : (
                <DynamicConnectButton
                  connectText="Connect"
                  className="bg-bitcoin hover:bg-bitcoin/90 text-white text-sm px-3 py-2 sm:px-4 sm:py-2"
                  showIcon={false}
                  showConnectedState={false}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-bitcoin/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Bitcoin className="text-bitcoin" size={32} />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-bitcoin to-yellow-500 bg-clip-text text-transparent px-2">
              Save Together,<br />Grow Together
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Join the future of community savings with Bitcoin-powered ROSCA circles.
              Transparent, secure, and built for families, friends, and communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <DynamicConnectButton
                connectText="Start Saving Now"
                size="lg"
                className="bg-bitcoin hover:bg-bitcoin/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                showIcon={true}
                showConnectedState={false}
              />
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  How It Works
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg hover:bg-bitcoin/10 hover:text-bitcoin"
                  onClick={() => document.getElementById('learn-more')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DEV: Database Setup Section (remove in production) */}
      {import.meta.env.DEV && (
        <section className="py-8 bg-red-50 dark:bg-red-900/20 border-y border-red-200 dark:border-red-800">
          <div className="max-w-7xl mx-auto">
            <DevDatabaseSetup />
          </div>
        </section>
      )}

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

      {/* Learn More Section */}
      <section id="learn-more" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-4">Everything You Need to Know</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Deep dive into the technology, benefits, and security behind ROSCA
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Technical Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-bitcoin/10 rounded-full flex items-center justify-center mr-4">
                  <Zap className="text-bitcoin" size={24} />
                </div>
                <h3 className="text-2xl font-bold">Technical Foundation</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="font-semibold mb-1">Built on Citrea</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Bitcoin's most secure Layer 2 solution with full EVM compatibility
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="font-semibold mb-1">Smart Contract Security</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Audited contracts ensure transparent and trustless operations
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="font-semibold mb-1">cBTC Integration</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Native Bitcoin savings with enhanced programmability
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="font-semibold mb-1">Decentralized & Open Source</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      No central authority, fully verifiable and community-driven
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Benefits & Features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-4">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <h3 className="text-2xl font-bold">Key Benefits</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <DollarSign className="text-bitcoin mt-1 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="font-semibold mb-1">No Interest or Fees</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Traditional ROSCA model with no lending costs or platform fees
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="text-blue-600 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="font-semibold mb-1">Flexible Scheduling</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Monthly, quarterly, or custom contribution schedules
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lock className="text-purple-600 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="font-semibold mb-1">Guaranteed Security</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Smart contracts eliminate counterparty risk
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="text-indigo-600 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="font-semibold mb-1">Global Accessibility</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Available worldwide with just a wallet connection
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Frequently Asked Questions</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Get answers to the most common questions about ROSCA
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="text-bitcoin mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-semibold mb-2">What is a ROSCA?</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        A Rotating Savings and Credit Association where members contribute regularly and take turns receiving the collective pool.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="text-bitcoin mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-semibold mb-2">How secure is my money?</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Funds are held in audited smart contracts on Citrea, with transparent and immutable transaction records.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="text-bitcoin mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-semibold mb-2">What if someone defaults?</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Smart contracts require collateral and implement penalties to minimize default risk and protect members.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="text-bitcoin mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-semibold mb-2">Can I join multiple groups?</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Yes! You can participate in multiple ROSCA circles simultaneously to diversify your savings strategy.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="text-bitcoin mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-semibold mb-2">What are the transaction fees?</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Only minimal Citrea network fees apply. No platform fees or hidden charges.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="text-bitcoin mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-semibold mb-2">How do I get started?</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Simply connect your wallet, complete onboarding, and either create a new group or join an existing one.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security & Trust Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-16 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Shield className="text-green-600" size={32} />
                <h3 className="text-3xl font-bold">Security & Trust</h3>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Built with the highest security standards and complete transparency
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="text-green-600" size={24} />
                </div>
                <h4 className="text-lg font-semibold mb-2">Audited Smart Contracts</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  All contracts undergo rigorous security audits by leading blockchain security firms
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="text-blue-600" size={24} />
                </div>
                <h4 className="text-lg font-semibold mb-2">Transparent Operations</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  All transactions and group activities are publicly verifiable on the blockchain
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-bitcoin/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bitcoin className="text-bitcoin" size={24} />
                </div>
                <h4 className="text-lg font-semibold mb-2">Bitcoin Security</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Inherits Bitcoin's unmatched security through Citrea's Layer 2 infrastructure
                </p>
              </div>
            </div>
          </motion.div>
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
            <DynamicConnectButton
              connectText="Connect Wallet & Start Saving"
              size="lg"
              className="bg-white text-bitcoin hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              showIcon={true}
              showConnectedState={false}
            />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Brand Section */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1 mb-6 sm:mb-0">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <Bitcoin className="text-bitcoin" size={20} sm:size={24} />
                <span className="text-lg sm:text-xl font-bold">ROSCA</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Bitcoin-powered savings circles for families, friends, and communities.
              </p>
            </div>
            
            {/* Product Links */}
            <div className="mb-6 sm:mb-0">
              <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm sm:text-base">Product</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">How It Works</li>
                <li className="hover:text-white transition-colors cursor-pointer">Security</li>
                <li className="hover:text-white transition-colors cursor-pointer">Pricing</li>
                <li className="hover:text-white transition-colors cursor-pointer">FAQ</li>
              </ul>
            </div>
            
            {/* Community Links */}
            <div className="mb-6 sm:mb-0">
              <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm sm:text-base">Community</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Discord</li>
                <li className="hover:text-white transition-colors cursor-pointer">Twitter</li>
                <li className="hover:text-white transition-colors cursor-pointer">Telegram</li>
                <li className="hover:text-white transition-colors cursor-pointer">Blog</li>
              </ul>
            </div>
            
            {/* Support Links */}
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm sm:text-base">Support</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Help Center</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact Us</li>
                <li className="hover:text-white transition-colors cursor-pointer">Bug Reports</li>
                <li className="hover:text-white transition-colors cursor-pointer">Feature Requests</li>
              </ul>
            </div>
          </div>
          
          {/* Copyright Section */}
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8">
            <div className="text-center text-xs sm:text-sm text-gray-400">
              <p>&copy; 2024 ROSCA. Built on Citrea, Bitcoin's Layer 2.</p>
              <p className="mt-1 sm:hidden">All rights reserved.</p>
              <p className="hidden sm:inline">All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}