import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { DynamicTest } from "@/components/dynamic-test";
import { Bitcoin, TrendingUp, Users, Shield } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleConnectWallet = () => {
    setLocation("/onboarding");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(27,87%,54%)] via-[hsl(27,87%,49%)] to-[hsl(27,87%,44%)] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Bitcoin pattern background */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute top-20 left-10 text-6xl text-white transform rotate-12"
          animate={{
            rotate: [12, 15, 12],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ₿
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-4xl text-white transform -rotate-12"
          animate={{
            rotate: [-12, -15, -12],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          ₿
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-20 text-5xl text-white transform rotate-45"
          animate={{
            rotate: [45, 50, 45],
            scale: [1, 1.08, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          ₿
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-3xl text-white transform -rotate-45"
          animate={{
            rotate: [-45, -50, -45],
            scale: [1, 1.06, 1]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          ₿
        </motion.div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Bitcoin logo animation */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 1,
              ease: "easeOut",
              type: "spring",
              stiffness: 100
            }}
          >
            <motion.div
              className="inline-block p-6 bg-white dark:bg-gray-800 rounded-full shadow-2xl"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  "0 25px 50px -12px rgba(247, 147, 26, 0.4)",
                  "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Bitcoin className="h-16 w-16 text-[hsl(27,87%,54%)]" />
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Bitcoin ROSCA
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-orange-100 mb-4 font-medium"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Decentralized Savings Groups
          </motion.p>

          <motion.p
            className="text-lg text-orange-200 mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Join rotating savings and credit associations powered by Bitcoin. Save together, earn together, build wealth together.
          </motion.p>

          {/* DynamicTest Component */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <DynamicTest onConnect={handleConnectWallet} />
          </motion.div>

          {/* Social Proof */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl font-black text-white mb-2" data-testid="stat-total-saved">₿2.5M</div>
              <div className="text-orange-200">Total Saved</div>
            </motion.div>
            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl font-black text-white mb-2" data-testid="stat-active-members">15K+</div>
              <div className="text-orange-200">Active Members</div>
            </motion.div>
            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl font-black text-white mb-2" data-testid="stat-success-rate">99.8%</div>
              <div className="text-orange-200">Success Rate</div>
            </motion.div>
          </motion.div>

          {/* Features */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <motion.div
              className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.15)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TrendingUp className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Smart Savings</h3>
              <p className="text-orange-200">Automated Bitcoin savings with guaranteed returns through community-driven ROSCAs.</p>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.15)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Users className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Community Trust</h3>
              <p className="text-orange-200">Build reputation and trust through transparent blockchain transactions and peer reviews.</p>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.15)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Shield className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Decentralized</h3>
              <p className="text-orange-200">No central authority. Smart contracts ensure fair play and automatic dispute resolution.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
