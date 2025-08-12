import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Coins, Users, Shield, TrendingUp } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinSacco: () => void;
}

export default function WelcomeModal({ isOpen, onClose, onJoinSacco }: WelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-neutral-800 max-w-sm sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl text-center flex items-center justify-center gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-bitcoin rounded-full flex items-center justify-center text-black font-semibold text-xs sm:text-sm">
              ₿
            </div>
            <span className="text-base sm:text-xl">Welcome to Sacco!</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Introduction */}
          <div className="text-center">
            <p className="text-neutral-300 mb-3 text-sm sm:text-base">
              Join the Bitcoin-backed lending cooperative and unlock powerful DeFi features.
            </p>
            <Badge className="bg-bitcoin/20 border-bitcoin/30 text-bitcoin text-xs">
              Membership Required
            </Badge>
          </div>

          {/* Features Grid - Stack on mobile, grid on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-neutral-900/50 rounded-lg text-center">
              <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-bitcoin mx-auto mb-2" />
              <h4 className="font-semibold text-xs sm:text-sm mb-1">Deposit & Earn</h4>
              <p className="text-xs text-neutral-400">
                Deposit cBTC as collateral and earn governance tokens
              </p>
            </div>
            
            <div className="p-3 sm:p-4 bg-neutral-900/50 rounded-lg text-center">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-xs sm:text-sm mb-1">Borrow USDC</h4>
              <p className="text-xs text-neutral-400">
                Borrow USDC against your cBTC at competitive rates
              </p>
            </div>
            
            <div className="p-3 sm:p-4 bg-neutral-900/50 rounded-lg text-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-semibold text-xs sm:text-sm mb-1">Governance</h4>
              <p className="text-xs text-neutral-400">
                Vote on proposals and shape the platform's future
              </p>
            </div>
            
            <div className="p-3 sm:p-4 bg-neutral-900/50 rounded-lg text-center">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold text-xs sm:text-sm mb-1">Security</h4>
              <p className="text-xs text-neutral-400">
                Audited contracts with transparent risk management
              </p>
            </div>
          </div>

          {/* Membership Details */}
          <div className="p-3 sm:p-4 bg-bitcoin/10 border border-bitcoin/30 rounded-lg">
            <h4 className="font-semibold text-bitcoin mb-2 text-sm sm:text-base">Membership Benefits</h4>
            <ul className="text-xs sm:text-sm text-bitcoin/80 space-y-1">
              <li>• One-time membership fee: 0.0001 cBTC</li>
              <li>• Unlimited deposits and borrowing</li>
              <li>• Governance token rewards</li>
              <li>• Priority access to new features</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onJoinSacco}
              className="flex-1 bg-bitcoin text-black hover:bg-bitcoin/90 font-semibold text-sm sm:text-base py-2 sm:py-3"
              data-testid="button-join-sacco-modal"
            >
              Join Sacco
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 text-sm sm:text-base py-2 sm:py-3"
              data-testid="button-maybe-later"
            >
              Maybe Later
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-neutral-500 text-center">
            You can always join later from the dashboard alerts
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
