import { Users, AlertCircle, Trophy, Bitcoin } from "lucide-react";

export function EmptyGroupsState() {
  return (
    <div className="text-center py-12">
      <div className="inline-block p-6 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
        <Users className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No Groups Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        Start saving with Bitcoin by creating your first ROSCA group or joining an existing one with an invite code.
      </p>
    </div>
  );
}

export function EmptyDisputesState() {
  return (
    <div className="text-center py-12">
      <div className="inline-block p-6 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
        <Trophy className="h-12 w-12 text-green-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No Active Disputes
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
        Great news! All your groups are running smoothly with no disputes to resolve.
      </p>
    </div>
  );
}

export function EmptyReputationState() {
  return (
    <div className="text-center py-12">
      <div className="inline-block p-6 bg-[hsl(27,87%,54%)]/10 rounded-full mb-4">
        <Bitcoin className="h-12 w-12 text-[hsl(27,87%,54%)]" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Build Your Reputation
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
        Start participating in ROSCA groups to build your reputation and unlock rewards.
      </p>
    </div>
  );
}
