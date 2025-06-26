
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Modal } from "@/components/ui/modal";
import { Trophy, Sparkles } from "lucide-react";

interface AchievementMintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementMintModal = ({ isOpen, onClose }: AchievementMintModalProps) => {
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const achievements = [
    { id: "streak", name: "12-Day Streak", emoji: "🔥", unlocked: true, minted: false },
    { id: "bronze", name: "Bronze Stacker", emoji: "🏆", unlocked: true, minted: false },
    { id: "lightning", name: "Lightning Fast", emoji: "⚡", unlocked: true, minted: false },
    { id: "goal", name: "Goal Master", emoji: "🎯", unlocked: false, minted: false }
  ];

  const handleMint = async (achievementId: string) => {
    setSelectedAchievement(achievementId);
    setIsMinting(true);
    
    // Mock NFT minting process
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    setIsMinting(false);
    onClose();
    setShowSuccessModal(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card cyber-border neon-glow max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-mono glitch-text">
              <Trophy className="w-5 h-5 text-purple-400" />
              Mint Achievement NFT
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground font-mono text-sm">
              Select an unlocked achievement to mint as an NFT badge
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 hover:border-purple-400 cursor-pointer'
                      : 'bg-gray-500/10 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                  onClick={() => achievement.unlocked && handleMint(achievement.id)}
                >
                  <div className="text-3xl mb-2">{achievement.emoji}</div>
                  <div className="text-xs font-semibold font-mono text-foreground">
                    {achievement.name}
                  </div>
                  {achievement.unlocked && (
                    <div className="mt-2">
                      <Button size="sm" className="cyber-button bg-purple-500 hover:bg-purple-600 text-white text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        MINT
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <p className="text-purple-400 text-xs font-mono">
                💡 NFT minting requires a small gas fee on Citrea L2. Minted achievements become tradeable assets.
              </p>
            </div>
            
            <Button variant="outline" onClick={onClose} className="w-full cyber-button">
              CLOSE
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LoadingModal
        isOpen={isMinting}
        title="Minting Achievement NFT..."
        description="Creating your unique digital badge on Citrea L2"
      />

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="Achievement NFT Minted! 🎉"
        description="Your digital badge is now available in your wallet"
      />
    </>
  );
};
