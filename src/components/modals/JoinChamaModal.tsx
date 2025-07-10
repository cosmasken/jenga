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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Join a Chama
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {availableChamas.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Chamas</h3>
              <p className="text-gray-600 mb-4">All Chamas are currently full. Create your own to get started!</p>
              <Button onClick={() => onOpenChange(false)} variant="outline">
                Close
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Choose a Chama to join. You'll need to make regular contributions according to the schedule.
              </p>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {availableChamas.map((chama) => (
                  <div key={chama.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{chama.name}</h3>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {chama.members.length}/{chama.maxMembers} members
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Bitcoin className="w-4 h-4 text-orange-500" />
                        <span>{(chama.contributionAmount / 1e18).toFixed(3)} BTC/month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{chama.cycleDuration} months</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>{(chama.totalContributions / 1e18).toFixed(3)} BTC total</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span>{chama.maxMembers - chama.members.length} spots left</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleJoin(chama.id, chama.name)}
                      disabled={isLoading}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      {isLoading && selectedChamaId === chama.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        'Join This Chama'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};