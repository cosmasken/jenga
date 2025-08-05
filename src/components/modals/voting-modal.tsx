import { useState } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Gavel, ThumbsUp, ThumbsDown, Clock } from "lucide-react";

export function VotingModal() {
  const { showVotingModal, setShowVotingModal, selectedDispute } = useStore();
  const { toast } = useToast();
  const [vote, setVote] = useState<'support' | 'dispute' | null>(null);
  const [comment, setComment] = useState("");

  const handleSubmitVote = () => {
    if (!vote || !selectedDispute) return;
    
    // Mock vote submission
    toast({
      title: "Vote Submitted!",
      description: `Your ${vote} vote has been recorded for this dispute.`,
      className: "bg-green-500 text-white border-green-600",
    });
    
    setShowVotingModal(false);
    setVote(null);
    setComment("");
  };

  const formatTimeRemaining = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return "Voting ended";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (!selectedDispute) return null;

  return (
    <Dialog open={showVotingModal} onOpenChange={(open) => setShowVotingModal(open)}>
      <DialogContent className="max-w-2xl">
        <div>
          <div className="flex items-center mb-4">
            <div className="inline-block p-3 bg-[hsl(27,87%,54%)]/10 rounded-full mr-4">
              <Gavel className="h-6 w-6 text-[hsl(27,87%,54%)]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Vote on Dispute
              </h3>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 mr-1" />
                {formatTimeRemaining(selectedDispute.votingEndsAt)}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {selectedDispute.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {selectedDispute.groupName} • Reported by {selectedDispute.reportedBy}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              {selectedDispute.description}
            </p>
            
            {selectedDispute.evidence && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Evidence Provided:
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 font-mono">
                  {selectedDispute.evidence}
                </p>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Current Votes
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {selectedDispute.votesSupport}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Support</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {selectedDispute.votesDispute}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Dispute</div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Cast Your Vote
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                variant={vote === 'support' ? 'default' : 'outline'}
                onClick={() => setVote('support')}
                className={`${
                  vote === 'support' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                }`}
                data-testid="button-vote-support"
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Support Claim
              </Button>
              <Button
                variant={vote === 'dispute' ? 'default' : 'outline'}
                onClick={() => setVote('dispute')}
                className={`${
                  vote === 'dispute' 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
                data-testid="button-vote-dispute"
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                Dispute Claim
              </Button>
            </div>
            
            <Textarea
              placeholder="Optional comment (will be visible to all members)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mb-4"
              data-testid="textarea-vote-comment"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowVotingModal(false)}
              className="flex-1"
              data-testid="button-cancel-vote"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitVote}
              disabled={!vote}
              className="flex-1 bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white disabled:opacity-50"
              data-testid="button-submit-vote"
            >
              Submit Vote
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
