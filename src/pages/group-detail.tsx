import { useParams } from "wouter";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useRosca } from "@/hooks/useRosca";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRoscaToast } from "@/hooks/use-rosca-toast";
import { ArrowLeft, Users, Share2, History, AlertTriangle, Check, Clock, Bitcoin, Wallet, Copy } from "lucide-react";

export default function GroupDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { primaryWallet, user } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { contributionSuccess, error: showError, transactionPending, success } = useRoscaToast();
  const {
    isConnected,
    getGroupInfo,
    contribute,
    formatContribution,
    isLoading,
    error
  } = useRosca();

  const [group, setGroup] = useState<any>(null);
  const [isContributing, setIsContributing] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setLocation("/");
    }
  }, [isLoggedIn, setLocation]);

  // Load group data
  useEffect(() => {
    const loadGroup = async () => {
      if (!id || !isConnected) return;

      setLoadingGroup(true);
      try {
        const groupData = await getGroupInfo(parseInt(id));
        setGroup(groupData);
      } catch (error) {
        console.error("Error loading group:", error);
        toast({
          title: "Error",
          description: "Failed to load group details",
          variant: "destructive",
        });
      } finally {
        setLoadingGroup(false);
      }
    };

    loadGroup();
  }, [id, isConnected, getGroupInfo, toast]);

  const handleContribute = async () => {
    if (!group || !id) return;

    setIsContributing(true);
    
    // Show pending transaction toast
    const pendingToast = transactionPending("contribution");
    
    try {
      const hash = await contribute(parseInt(id));
      if (hash) {
        // Dismiss pending toast and show success
        pendingToast.dismiss();
        contributionSuccess(
          formatContribution(group.contribution), 
          group.name || `Group ${id}`
        );

        // Reload group data after contribution
        const updatedGroup = await getGroupInfo(parseInt(id));
        setGroup(updatedGroup);
      }
    } catch (error: any) {
      pendingToast.dismiss();
      showError(
        "Contribution Failed", 
        error.message || "Failed to submit contribution. Please try again."
      );
    } finally {
      setIsContributing(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/group/${id}`;
    navigator.clipboard.writeText(shareUrl);
    success("Link Copied! 🔗", "Group link copied to clipboard");
  };

  const handleInvite = () => {
    // TODO: Implement invite functionality
    success("Coming Soon! 🚀", "Invite functionality will be available soon");
  };

  if (!isConnected || !primaryWallet) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-bold mb-2">Wallet Not Connected</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please connect your wallet to view group details.
            </p>
            <Button onClick={() => setLocation("/")} className="w-full">
              Go to Landing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingGroup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(27,87%,54%)] mx-auto mb-4"></div>
            <h2 className="text-xl font-bold mb-2">Loading Group</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Fetching group details from the blockchain...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold mb-2">Group Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The group you're looking for doesn't exist or hasn't been created yet.
            </p>
            <Button onClick={() => setLocation("/dashboard")} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = group.totalRounds > 0 ? (group.currentRound / group.totalRounds) * 100 : 0;
  const isActive = group.currentRound < group.totalRounds;
  const nextDueDate = new Date(group.nextDue * 1000);
  const isEthGroup = group.token === "0x0000000000000000000000000000000000000000";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Group #{group.id}
              </h1>
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Active" : "Completed"}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Group Overview */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Group Details
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Group ID:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">#{group.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Contribution:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {isEthGroup ? "Ξ" : "₿"} {formatContribution(group.contribution)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Round Length:</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {Math.floor(group.roundLength / 86400)} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Token:</span>
                      <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                        {isEthGroup ? "ETH" : `${group.token.slice(0, 6)}...${group.token.slice(-4)}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Progress
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Round Progress</span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {group.currentRound}/{group.totalRounds || "∞"}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>

                    {isActive && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Next Due Date
                          </span>
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {nextDueDate.toLocaleDateString()} at {nextDueDate.toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Actions
              </h2>
              <div className="flex flex-wrap gap-4">
                {isActive && (
                  <Button
                    onClick={handleContribute}
                    disabled={isContributing || isLoading}
                    className="bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)]"
                  >
                    <Bitcoin className="h-4 w-4 mr-2" />
                    {isContributing ? "Contributing..." : "Contribute"}
                  </Button>
                )}

                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Group
                </Button>

                <Button variant="outline" onClick={handleInvite}>
                  <Users className="h-4 w-4 mr-2" />
                  Invite Members
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Group History */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Group History
                </h2>
              </div>

              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No History Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Group history and transaction details will appear here once available.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Technical Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Technical Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Token Address:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-900 dark:text-gray-100">
                        {group.token.slice(0, 6)}...{group.token.slice(-4)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(group.token);
                          toast({ title: "Address copied to clipboard" });
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Round Length:</span>
                    <span className="text-gray-900 dark:text-gray-100">{group.roundLength}s</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Next Due:</span>
                    <span className="text-gray-900 dark:text-gray-100">{group.nextDue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Change Activates:</span>
                    <span className="text-gray-900 dark:text-gray-100">{group.changeActivates}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <p className="text-red-600 dark:text-red-400">
                    Error: {error.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {/* End Error Display */}
      </div>
    </div>
  );
}
