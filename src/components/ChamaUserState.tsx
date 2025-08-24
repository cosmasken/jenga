import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, 
  Shield, 
  CheckCircle, 
  UserPlus, 
  Users,
  Wallet
} from 'lucide-react';

interface ChamaInfo {
  totalMembers: number;
  memberTarget: number;
  status: number; // 0: RECRUITING, 1: WAITING, 2: ACTIVE, 3: COMPLETED, 4: CANCELLED
}

interface UserMembershipStatus {
  isMember: boolean;
  isCreator: boolean;
  hasContributed: boolean;
}

interface UserStateProps {
  chamaInfo: ChamaInfo | null;
  userMembershipStatus: UserMembershipStatus;
  onConnect: () => void;
}

export function ChamaUserState({ chamaInfo, userMembershipStatus, onConnect }: UserStateProps) {
  const isLoggedIn = useIsLoggedIn();
  const { setShowAuthFlow } = useDynamicContext();

  // If user is not logged in, show connect wallet prompt
  if (!isLoggedIn) {
    return (
      <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet size={32} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-6">
            You need to connect your wallet to view chama details and participate in savings circles.
          </p>
          <Button
            onClick={() => setShowAuthFlow(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  // User is logged in - show appropriate status alerts
  return (
    <div className="space-y-4">
      {/* Creator Badge */}
      {userMembershipStatus.isCreator && (
        <Alert className="border-bitcoin bg-bitcoin/10">
          <Shield className="h-4 w-4 text-bitcoin" />
          <AlertDescription className="text-bitcoin">
            <strong>You are the creator</strong> of this chama. You can manage settings and invite members.
          </AlertDescription>
        </Alert>
      )}

      {/* Member Badge */}
      {userMembershipStatus.isMember && !userMembershipStatus.isCreator && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>You are a member</strong> of this chama. 
            {userMembershipStatus.hasContributed 
              ? ' You have contributed this round.' 
              : ' You can contribute to the current round.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Non-member Badge */}
      {!userMembershipStatus.isMember && !userMembershipStatus.isCreator && chamaInfo && (
        <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <UserPlus className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <strong>You are not a member</strong> of this chama. 
            {chamaInfo.status === 0 && chamaInfo.totalMembers < chamaInfo.memberTarget
              ? ' You can join if there are available spots.'
              : chamaInfo.totalMembers >= chamaInfo.memberTarget
              ? ' This chama is full.'
              : ' This chama is closed to new members.'
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export function getAccessLevel(isLoggedIn: boolean, userMembershipStatus: UserMembershipStatus, chamaInfo: ChamaInfo | null) {
  if (!isLoggedIn) {
    return 'GUEST'; // Can only see connect wallet button
  }

  if (userMembershipStatus.isCreator) {
    return 'CREATOR'; // Full access + management
  }

  if (userMembershipStatus.isMember) {
    return 'MEMBER'; // Can contribute, view details
  }

  // Check if user can join
  if (chamaInfo && chamaInfo.status === 0 && chamaInfo.totalMembers < chamaInfo.memberTarget) {
    return 'CAN_JOIN'; // Can see details and join
  }

  return 'VIEWER'; // Can see basic details but cannot join
}
