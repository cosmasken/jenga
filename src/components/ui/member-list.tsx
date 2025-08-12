import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Circle, Crown } from "lucide-react";
import { type ChamaMember } from "@/types/chama";

interface MemberListProps extends React.HTMLAttributes<HTMLDivElement> {
  members: ChamaMember[];
  currentRound?: number;
  showContributionStatus?: boolean;
}

const MemberList = React.forwardRef<HTMLDivElement, MemberListProps>(
  ({ className, members, currentRound, showContributionStatus = true, ...props }, ref) => {
    const getStatusIcon = (member: ChamaMember) => {
      if (member.status === 'winner') {
        return <Crown className="w-4 h-4 text-yellow-400" />;
      }
      
      if (showContributionStatus && member.contributedCurrentRound) {
        return <Check className="w-4 h-4 text-green-400" />;
      }
      
      return <Circle className="w-4 h-4 text-gray-400" />;
    };

    const getStatusColor = (member: ChamaMember) => {
      if (member.status === 'winner') {
        return 'border-emerald-500 bg-emerald-500/10';
      }
      
      if (showContributionStatus && member.contributedCurrentRound) {
        return 'border-green-500/30 bg-green-500/5';
      }
      
      return 'border-gray-600 bg-gray-800/50';
    };

    const getMemberGradient = (index: number) => {
      const gradients = [
        'from-bitcoin to-orange-600',
        'from-electric to-blue-600', 
        'from-neon-green to-green-600',
        'from-purple-500 to-pink-600',
        'from-cyan-500 to-teal-600',
      ];
      return gradients[index % gradients.length];
    };

    return (
      <div
        ref={ref}
        className={cn("space-y-3", className)}
        {...props}
      >
        {members.map((member, index) => (
          <div
            key={member.address}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border transition-all duration-200",
              getStatusColor(member)
            )}
          >
            <div className="flex items-center space-x-4">
              <div className={cn(
                "w-10 h-10 bg-gradient-to-br rounded-full flex items-center justify-center text-white font-bold text-sm",
                getMemberGradient(index)
              )}>
                {member.name[0].toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-white flex items-center gap-2">
                  {member.name}
                  {member.status === 'winner' && (
                    <Crown className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <div className="text-sm text-gray-400 font-mono">
                  {member.address.slice(0, 6)}...{member.address.slice(-4)}
                </div>
              </div>
            </div>
            
            <div className="text-right flex items-center gap-3">
              {member.roundReceived && (
                <div className="text-xs text-gray-400">
                  Round {member.roundReceived}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {getStatusIcon(member)}
                <div className="text-sm">
                  {member.status === 'winner' && currentRound ? (
                    <span className="text-yellow-400 font-medium">Current Winner</span>
                  ) : member.status === 'winner' ? (
                    <span className="text-green-400 font-medium">Received</span>
                  ) : showContributionStatus && member.contributedCurrentRound ? (
                    <span className="text-green-400 font-medium">✓ Contributed</span>
                  ) : showContributionStatus ? (
                    <span className="text-gray-400 font-medium">⭘ Pending</span>
                  ) : (
                    <span className="text-gray-400 font-medium">Member</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);
MemberList.displayName = "MemberList";

export { MemberList };
