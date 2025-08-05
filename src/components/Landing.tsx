// import React from 'react';
// import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
// import { useRosca } from '../hooks/useRosca';

// /**
//  * Enhanced Landing component for non-logged-in users
//  * Bitcoin-themed with animations and comprehensive feature showcase
//  */
// export function Landing() {
//   const { primaryWallet } = useDynamicContext();
//   const { groupCount } = useRosca();

//   const features = [
//     {
//       icon: "₿",
//       title: "Bitcoin-Powered Savings",
//       description: "Save in cBTC on Citrea, Bitcoin's most secure Layer 2",
//       color: "text-bitcoin-orange"
//     },
//     {
//       icon: "👥",
//       title: "Community-Driven",
//       description: "Join trusted savings circles with family and friends",
//       color: "text-blue-600"
//     },
//     {
//       icon: "🔒",
//       title: "Smart Contract Security",
//       description: "Transparent, automated, and trustless group management",
//       color: "text-green-600"
//     },
//     {
//       icon: "📈",
//       title: "Guaranteed Returns",
//       description: "Receive your full payout when it's your turn",
//       color: "text-purple-600"
//     }
//   ];

//   const stats = [
//     { number: `${groupCount || 0}+`, label: "Active Chamas" },
//     { number: "₿2.5+", label: "Total Saved" },
//     { number: "500+", label: "Groups Created" },
//     { number: "99.8%", label: "Success Rate" }
//   ];

//   const testimonials = [
//     {
//       name: "Maria Rodriguez",
//       role: "Family Group Organizer",
//       content: "Jenga helped our family save ₿0.5 for our new home. The Bitcoin backing gives us confidence in our savings.",
//       avatar: "👩‍💼"
//     },
//     {
//       name: "James Chen",
//       role: "Community Leader",
//       content: "Managing our neighborhood savings circle is so much easier with smart contracts. Everyone trusts the process.",
//       avatar: "👨‍💻"
//     },
//     {
//       name: "Sarah Johnson",
//       role: "Small Business Owner",
//       content: "Our workplace chama helped 20 employees build emergency funds. The transparency is incredible.",
//       avatar: "👩‍🚀"
//     }
//   ];

//   const scrollToSection = (sectionId: string) => {
//     document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-bitcoin-orange/5 via-background to-bitcoin-yellow/5">
//       {/* Hero Section */}
//       <section className="py-20 px-4">
//         <div className="max-w-7xl mx-auto text-center">
//           <div className="animate-fade-in">
//             <div className="w-20 h-20 bg-bitcoin-orange/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-bitcoin">
//               <span className="text-bitcoin-orange text-4xl">₿</span>
//             </div>
//             <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
//               Save Together,<br />Grow Together
//             </h1>
//             <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
//               Join the future of community savings with Bitcoin-powered Chama circles. 
//               Transparent, secure, and built for families, friends, and communities.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <button 
//                 className="btn btn-primary px-8 py-4 text-lg"
//                 onClick={() => scrollToSection('how-it-works')}
//               >
//                 <span className="mr-2">🚀</span>
//                 Learn How It Works
//                 <span className="ml-2">→</span>
//               </button>
//               <button 
//                 className="btn btn-secondary px-8 py-4 text-lg"
//                 onClick={() => scrollToSection('features')}
//               >
//                 Explore Features
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="py-16 bg-white/50 dark:bg-gray-900/50">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//             {stats.map((stat, index) => (
//               <div
//                 key={index}
//                 className="text-center animate-slide-up"
//                 style={{ animationDelay: `${index * 0.1}s` }}
//               >
//                 <div className="text-3xl md:text-4xl font-bold text-bitcoin-orange mb-2 font-mono">
//                   {stat.number}
//                 </div>
//                 <div className="text-gray-600 dark:text-gray-400">
//                   {stat.label}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-20 px-4">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold mb-4">Why Choose Jenga?</h2>
//             <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
//               Built on Bitcoin's security with modern smart contract technology
//             </p>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {features.map((feature, index) => (
//               <div
//                 key={index}
//                 className="feature-item animate-slide-up"
//                 style={{ animationDelay: `${index * 0.1}s` }}
//               >
//                 <div className={`w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 ${feature.color}`}>
//                   <span className="text-2xl">{feature.icon}</span>
//                 </div>
//                 <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
//                 <p className="text-gray-600 dark:text-gray-400 text-sm">
//                   {feature.description}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* How It Works Section */}
//       <section id="how-it-works" className="py-20 bg-white/50 dark:bg-gray-900/50 px-4">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold mb-4">How Jenga Works</h2>
//             <p className="text-xl text-gray-600 dark:text-gray-400">
//               Simple, transparent, and automated savings circles
//             </p>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="text-center animate-slide-left">
//               <div className="w-16 h-16 bg-bitcoin-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <span className="text-2xl font-bold text-bitcoin-orange">1</span>
//               </div>
//               <h3 className="text-xl font-semibold mb-2">Create or Join</h3>
//               <p className="text-gray-600 dark:text-gray-400">
//                 Start a savings circle with friends and family, or join an existing group
//               </p>
//             </div>
//             <div className="text-center animate-slide-up">
//               <div className="w-16 h-16 bg-bitcoin-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <span className="text-2xl font-bold text-bitcoin-orange">2</span>
//               </div>
//               <h3 className="text-xl font-semibold mb-2">Contribute Regularly</h3>
//               <p className="text-gray-600 dark:text-gray-400">
//                 Everyone contributes the same amount each round in cBTC
//               </p>
//             </div>
//             <div className="text-center animate-slide-right">
//               <div className="w-16 h-16 bg-bitcoin-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <span className="text-2xl font-bold text-bitcoin-orange">3</span>
//               </div>
//               <h3 className="text-xl font-semibold mb-2">Receive Payout</h3>
//               <p className="text-gray-600 dark:text-gray-400">
//                 Take turns receiving the full pool amount when it's your turn
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section className="py-20 px-4">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
//             <p className="text-xl text-gray-600 dark:text-gray-400">
//               Real stories from real savers
//             </p>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial, index) => (
//               <div
//                 key={index}
//                 className="card animate-slide-up"
//                 style={{ animationDelay: `${index * 0.1}s` }}
//               >
//                 <div className="flex items-center mb-4">
//                   <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mr-3">
//                     <span className="text-xl">{testimonial.avatar}</span>
//                   </div>
//                   <div>
//                     <div className="font-semibold">{testimonial.name}</div>
//                     <div className="text-sm text-gray-600 dark:text-gray-400">
//                       {testimonial.role}
//                     </div>
//                   </div>
//                 </div>
//                 <p className="text-gray-700 dark:text-gray-300 italic">
//                   "{testimonial.content}"
//                 </p>
//                 <div className="flex mt-4">
//                   {[...Array(5)].map((_, i) => (
//                     <span key={i} className="text-bitcoin-yellow text-sm">★</span>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20 bg-gradient-to-r from-bitcoin-orange to-bitcoin-yellow px-4">
//         <div className="max-w-4xl mx-auto text-center text-white">
//           <div className="animate-fade-in">
//             <h2 className="text-4xl font-bold mb-4">
//               Ready to Start Your Savings Journey?
//             </h2>
//             <p className="text-xl mb-8 opacity-90">
//               Join thousands of families building wealth together with Bitcoin-powered Chama circles
//             </p>
//             <p className="text-lg opacity-80 mb-6">
//               Connect your wallet above to get started
//             </p>
//             <div className="flex items-center justify-center gap-2 text-sm opacity-75">
//               <span>🔒</span>
//               <span>Secure</span>
//               <span>•</span>
//               <span>🌍</span>
//               <span>Decentralized</span>
//               <span>•</span>
//               <span>⚡</span>
//               <span>Fast</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-gray-900 text-white py-12 px-4">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//             <div>
//               <div className="flex items-center space-x-2 mb-4">
//                 <span className="text-bitcoin-orange text-2xl">₿</span>
//                 <span className="text-xl font-bold">Jenga</span>
//               </div>
//               <p className="text-gray-400 text-sm">
//                 Bitcoin-powered savings circles for families, friends, and communities.
//               </p>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-4">Product</h4>
//               <ul className="space-y-2 text-sm text-gray-400">
//                 <li>How It Works</li>
//                 <li>Security</li>
//                 <li>Smart Contracts</li>
//                 <li>FAQ</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-4">Community</h4>
//               <ul className="space-y-2 text-sm text-gray-400">
//                 <li>Discord</li>
//                 <li>Twitter</li>
//                 <li>Telegram</li>
//                 <li>Blog</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-4">Support</h4>
//               <ul className="space-y-2 text-sm text-gray-400">
//                 <li>Help Center</li>
//                 <li>Contact Us</li>
//                 <li>Bug Reports</li>
//                 <li>Feature Requests</li>
//               </ul>
//             </div>
//           </div>
//           <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
//             <p>&copy; 2024 Jenga. Built on Citrea, Bitcoin's Layer 2. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }


import { motion } from 'framer-motion';
// import { useEffect } from 'react';
// import { useLocation } from 'wouter';
import {
  Bitcoin,
  Users,
  Shield,
  TrendingUp,
  Star,
} from 'lucide-react';
// import {
//   Bitcoin,
//   Users,
//   Shield,
//   TrendingUp,
//   Wallet,
//   ArrowRight,
//   CheckCircle,
//   Star,
//   Globe,
//   Zap
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { useAppStore } from '@/store/useAppStore';
// import { getWeb3Auth } from '@/lib/web3auth-config';
// import ThemeToggle from '@/components/ThemeToggle';

export default function LandingPage() {
  // const { isFullyAuthenticated } = useAppStore();
  // const [, setLocation] = useLocation();

  // const handleConnect = async () => {
  //   const web3auth = getWeb3Auth();
  //   if (web3auth) {
  //     await web3auth.connect();
  //   }
  // };

  // // Redirect authenticated users away from landing page
  // useEffect(() => {
  //   if (isFullyAuthenticated()) {
  //     console.log('🔄 Authenticated user on landing page, redirecting to dashboard');
  //     setLocation('/');
  //   }
  // }, [isFullyAuthenticated, setLocation]);

  // // Don't render landing page content if user is authenticated
  // if (isFullyAuthenticated()) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-16 h-16 bg-bitcoin/10 rounded-full flex items-center justify-center mx-auto mb-4">
  //           <Bitcoin className="text-bitcoin" size={32} />
  //         </div>
  //         <h2 className="text-2xl font-bold mb-2">Redirecting...</h2>
  //         <p className="text-gray-600 dark:text-gray-400">
  //           You're already logged in. Taking you to your dashboard.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

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
              {/* <ThemeToggle />
              <Button
                onClick={handleConnect}
                className="bg-bitcoin hover:bg-bitcoin/90 text-white text-sm sm:text-base"
              >
                <Wallet size={16} className="mr-2" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="inline sm:hidden">Connect</span>
              </Button> */}
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
              {/* <Button
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
              </Button> */}
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
            {/* <Button
              onClick={handleConnect}
              size="lg"
              className="bg-white text-bitcoin hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              <Wallet size={20} className="mr-2" />
              Connect Wallet & Start Saving
              <ArrowRight size={20} className="ml-2" />
            </Button> */}
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
