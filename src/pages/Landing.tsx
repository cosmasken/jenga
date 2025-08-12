import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSacco } from "../hooks/useSacco";
import { useUserStore } from "../stores/userStore";
import WelcomeGuide from "../components/guides/WelcomeGuide";
import { DynamicConnectButton } from "@/components/ui/dynamic-connect-button";
import { useLocation } from 'wouter';
import { useIsLoggedIn, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Card, CardContent } from '@/components/ui/card';
import {
  Bitcoin,
  Users,
  Shield,
  TrendingUp,
  ArrowRight,
  Wallet
} from 'lucide-react';


export default function Landing() {
  // const { isConnected, connect } = useSacco();
  const isLoggedIn = useIsLoggedIn();
  const { showAuthFlow } = useDynamicContext();
  const [, setLocation] = useLocation();
  const { hasSeenWelcomeGuide } = useUserStore();
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // const handleConnect = () => {
  //   connect();

  //   // Show welcome guide for first-time users
  // if (!hasSeenWelcomeGuide) {
  //   setShowWelcomeGuide(true);
  // } else {
  //     // Redirect existing users to dashboard
  //     setTimeout(() => {
  //       window.location.href = "/dashboard";
  //     }, 1000);
  //   }
  // };

  // Redirect logged in users to dashboard
  useEffect(() => {
    if (isLoggedIn && !showAuthFlow && !isRedirecting) {
      setIsRedirecting(true);

      // Add a small delay to ensure Dynamic's modal is fully closed
      setTimeout(() => {
        if (!hasSeenWelcomeGuide) {
          setShowWelcomeGuide(true);
        } else {
          setLocation('/dashboard');
        }
      }, 500); // 500ms delay to avoid modal overlap
    }
  }, [isLoggedIn, showAuthFlow, setLocation, hasSeenWelcomeGuide, isRedirecting]);

  const handleGuideClose = () => {
    setShowWelcomeGuide(false);
    // Redirect to dashboard after guide
    setTimeout(() => {
      setLocation('/dashboard');
    }, 300);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              {/* Logo/Brand */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Bitcoin className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Sacco & Chama</h1>
                </div>
              </div>

              {/* Hero Title */}
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Bitcoin Finance
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                  Reimagined
                </span>
              </h2>

              {/* Hero Subtitle */}
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto">
                Experience both DeFi lending with Sacco and community savings with Chamas. 
                Deposit Bitcoin, borrow USDC, or join savings circles - all in one platform.
              </p>

              {/* Key Features Preview */}
              <div className="grid md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <Wallet className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sacco Lending</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Deposit cBTC as collateral and borrow USDC
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Chama Circles</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Join rotating savings groups with Bitcoin
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Grow Wealth</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Build Bitcoin wealth through lending or saving
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <Shield className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Secure & Transparent</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Smart contracts ensure safety and transparency
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                {isLoggedIn && !isRedirecting ? (
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
                      data-testid="button-dashboard"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <DynamicConnectButton />
                )}

                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
                >
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure & Decentralized</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bitcoin className="w-4 h-4" />
                  <span>Bitcoin Native</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>DeFi + Community Savings</span>
                </div>
              </div>

              {/* Powered by footer */}
              <div className="mt-16 text-neutral-500 text-sm">
                Powered by Citrea
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Two Powerful Ways to Build Bitcoin Wealth
              </h3>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Choose between DeFi lending with Sacco or community savings with Chamas - or use both to maximize your Bitcoin growth
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mb-16">
              {/* Sacco Features */}
              <div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  🏦 Sacco DeFi Lending
                </h4>
                <div className="space-y-6">
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Bitcoin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Bitcoin Collateral
                          </h5>
                          <p className="text-gray-600 dark:text-gray-300">
                            Deposit cBTC as collateral to unlock liquidity while maintaining Bitcoin exposure
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Borrow USDC
                          </h5>
                          <p className="text-gray-600 dark:text-gray-300">
                            Access stable liquidity by borrowing USDC against your Bitcoin collateral
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Cooperative Governance
                          </h5>
                          <p className="text-gray-600 dark:text-gray-300">
                            Participate in decentralized governance and help shape platform decisions
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Chama Features */}
              <div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  👥 Chama Savings Circles
                </h4>
                <div className="space-y-6">
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Community Savings
                          </h5>
                          <p className="text-gray-600 dark:text-gray-300">
                            Join rotating savings groups with friends and community members
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Regular Contributions
                          </h5>
                          <p className="text-gray-600 dark:text-gray-300">
                            Build disciplined saving habits with regular Bitcoin contributions
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Rotating Payouts
                          </h5>
                          <p className="text-gray-600 dark:text-gray-300">
                            Receive collective savings when it's your turn in the rotation
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                How It Works
              </h3>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Simple steps to start your Bitcoin savings journey
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Connect Wallet
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect your Bitcoin wallet to get started
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Join or Create
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Join an existing chama or create your own savings circle
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Save Regularly
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Make regular Bitcoin contributions to your chama
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Receive Payouts
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Get your turn to receive the collective savings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-orange-500 mb-2">₿25.8</div>
                <div className="text-gray-600 dark:text-gray-300">Total Collateral</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-500 mb-2">150+</div>
                <div className="text-gray-600 dark:text-gray-300">Active Chamas</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-500 mb-2">$2.1M</div>
                <div className="text-gray-600 dark:text-gray-300">USDC Borrowed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-500 mb-2">2,500+</div>
                <div className="text-gray-600 dark:text-gray-300">Active Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Build Bitcoin Wealth?
            </h3>
            <p className="text-xl text-orange-100 mb-8">
              Join thousands building wealth through DeFi lending and community savings - all powered by Bitcoin
            </p>
            <DynamicConnectButton />
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Bitcoin className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold">Sacco & Chama</h4>
                </div>
                <p className="text-gray-400">
                  Building the future of Bitcoin finance through DeFi lending and community-powered savings circles.
                </p>
              </div>

              <div>
                <h5 className="font-semibold mb-4">Product</h5>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold mb-4">Resources</h5>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold mb-4">Company</h5>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Sacco & Chama. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Welcome Guide Modal - only show when not redirecting and auth flow is closed */}
      <WelcomeGuide
        isOpen={showWelcomeGuide && !showAuthFlow}
        onClose={handleGuideClose}
      />
    </>
  );
}
