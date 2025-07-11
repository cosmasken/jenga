import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Bitcoin, Clock, TrendingUp } from 'lucide-react';
import { MOCK_CHAMAS } from '@/data/mockData';

interface JoinChamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinChamaModal: React.FC<JoinChamaModalProps> = ({ open, onOpenChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChamaId, setSelectedChamaId] = useState<number | null>(null);
  const { toast } = useToast();

  const availableChamas = MOCK_CHAMAS.filter(chama => 
    chama.active && chama.members.length < chama.maxMembers
  );

  const handleJoin = async (chamaId: number, chamaName: string) => {
    setIsLoading(true);
    setSelectedChamaId(chamaId);

    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      toast({
        title: "Successfully Joined Chama! 🎉",
        description: `Welcome to "${chamaName}". You can now start contributing.`,
      });
      onOpenChange(false);
    } else {
      toast({
        title: "Failed to Join Chama",
        description: "Transaction failed. Please check your wallet and try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
    setSelectedChamaId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] modal-content">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            Join a Chama
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            Choose from available chamas below. You can join any chama that has open spots.
          </p>

          {availableChamas.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-foreground mb-2">No Available Chamas</h3>
              <p className="text-gray-600 dark:text-muted-foreground">
                All chamas are currently full. Check back later or create your own!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {availableChamas.map((chama) => (
                <div
                  key={chama.id}
                  className="card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-foreground">{chama.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">
                        Created by {chama.creator}
                      </p>
                    </div>
                    <span className="status-dot status-dot-green"></span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Bitcoin className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">
                        <span className="font-medium btc-display">{chama.contributionAmount} BTC</span>
                        <span className="text-gray-500 dark:text-muted-foreground">/month</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">
                        <span className="font-medium">{chama.members.length}/{chama.maxMembers}</span>
                        <span className="text-gray-500 dark:text-muted-foreground"> members</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">
                        <span className="font-medium">{chama.cycleDuration}</span>
                        <span className="text-gray-500 dark:text-muted-foreground"> months</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm">
                        <span className="font-medium">{chama.currentCycle}/{chama.cycleDuration}</span>
                        <span className="text-gray-500 dark:text-muted-foreground"> cycles</span>
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleJoin(chama.id, chama.name)}
                    disabled={isLoading}
                    className="btn-primary w-full"
                  >
                    {isLoading && selectedChamaId === chama.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join Chama'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-border">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="btn-outline"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
