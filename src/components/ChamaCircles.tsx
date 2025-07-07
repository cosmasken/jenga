import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Plus, Vote, Shield, TrendingUp, UserPlus, Loader2, AlertCircle, Wallet } from "lucide-react";
import { ChamaCreationForm } from "@/components/ChamaCreationForm";
import { ContributionForm } from "@/components/ContributionForm";
import { VotingForm } from "@/components/VotingForm";
import { JoinChamaForm } from "@/components/JoinChamaForm";
import { useSaccoFactory } from "@/hooks/useSaccoFactory";

export const ChamaCircles = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showContributeForm, setShowContributeForm] = useState(false);
  const [showVotingForm, setShowVotingForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedChama, setSelectedChama] = useState<any>(null);

  // Use the real SaccoFactory hook
  const { 
    pools: chamas, 
    poolCount,
    isLoadingPools, 
    isCreating,
    isJoining,
    isContributing,
    refreshPools,
    isConnected 
  } = useSaccoFactory();

  const handleContribute = (chama: any) => {
    setSelectedChama(chama);
    setShowContributeForm(true);
  };

  const handleJoinChama = (chama: any) => {
    setSelectedChama(chama);
    setShowJoinForm(true);
  };

  const handleVote = (chama: any) => {
    setSelectedChama(chama);
    setShowVotingForm(true);
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Creator': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Member': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 cyber-border neon-glow">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <div className="text-2xl font-bold font-mono">{poolCount}</div>
            <div className="text-sm text-blue-100 font-mono">Total Chamas</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 cyber-border neon-glow">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2" />
            <div className="text-2xl font-bold font-mono">{chamas.filter(c => c.state === 'Active').length}</div>
            <div className="text-sm text-green-100 font-mono">Active Circles</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0 cyber-border neon-glow">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <div className="text-2xl font-bold font-mono">{chamas.filter(c => c.role !== 'Non-member').length}</div>
            <div className="text-sm text-orange-100 font-mono">My Chamas</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 cyber-border neon-glow">
          <CardContent className="p-4 text-center">
            <Plus className="w-8 h-8 mx-auto mb-2" />
            <Button 
              onClick={() => setShowCreateForm(true)}
              disabled={!isConnected || isCreating}
              className="w-full bg-white text-purple-600 hover:bg-purple-50 cyber-button font-mono"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Chama'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to view and interact with chamas.
          </AlertDescription>
        </Alert>
      )}

      {/* Chamas Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground font-mono">Community Savings Circles</h2>
          <Button
            variant="outline"
            onClick={refreshPools}
            disabled={isLoadingPools}
            className="cyber-button font-mono"
          >
            {isLoadingPools ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        </div>

        {!isConnected ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground">Connect your wallet to view and join savings circles</p>
            </CardContent>
          </Card>
        ) : isLoadingPools ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card cyber-border animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : chamas.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Chamas Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create a savings circle in your community!
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="cyber-button bg-orange-500 hover:bg-orange-600 text-black font-mono"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Chama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chamas.map((chama) => (
              <Card key={chama.id} className="bg-card cyber-border hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-mono text-foreground">{chama.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getStateColor(chama.state)}>
                        {chama.state}
                      </Badge>
                      <Badge className={getRoleColor(chama.role)}>
                        {chama.role}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Pool Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground font-mono">Members</p>
                      <p className="font-semibold text-foreground font-mono">{chama.members}/{chama.maxMembers}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-mono">Weekly Target</p>
                      <p className="font-semibold text-orange-400 font-mono">{chama.weeklyTarget.toLocaleString()} sats</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-mono">Current Pool</p>
                      <p className="font-semibold text-green-400 font-mono">{chama.currentPool.toLocaleString()} sats</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-mono">Next Payout</p>
                      <p className="font-semibold text-blue-400 font-mono">{chama.nextPayout}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground font-mono">Cycle Progress</span>
                      <span className="font-semibold font-mono">{chama.currentCycle}/{chama.totalCycles}</span>
                    </div>
                    <Progress value={chama.progress} className="h-2" />
                  </div>

                  {/* My Contribution */}
                  {chama.role !== 'Non-member' && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground font-mono">My Total Contribution</p>
                      <p className="font-semibold text-foreground font-mono">{chama.myContribution.toLocaleString()} sats</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {chama.canJoin && (
                      <Button
                        onClick={() => handleJoinChama(chama)}
                        disabled={isJoining}
                        className="flex-1 cyber-button bg-blue-500 hover:bg-blue-600 text-white font-mono"
                      >
                        {isJoining ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Join
                          </>
                        )}
                      </Button>
                    )}
                    
                    {chama.canContribute && (
                      <Button
                        onClick={() => handleContribute(chama)}
                        disabled={isContributing}
                        className="flex-1 cyber-button bg-green-500 hover:bg-green-600 text-white font-mono"
                      >
                        {isContributing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Contribute
                          </>
                        )}
                      </Button>
                    )}
                    
                    {chama.role !== 'Non-member' && (
                      <Button
                        onClick={() => handleVote(chama)}
                        variant="outline"
                        className="cyber-button font-mono"
                      >
                        <Vote className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Creator Info */}
                  <div className="text-xs text-muted-foreground font-mono">
                    Created by: {chama.creator.slice(0, 6)}...{chama.creator.slice(-4)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Forms */}
      <ChamaCreationForm isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} />
      <ContributionForm 
        isOpen={showContributeForm} 
        onClose={() => setShowContributeForm(false)}
        chama={selectedChama}
      />
      <VotingForm 
        isOpen={showVotingForm} 
        onClose={() => setShowVotingForm(false)}
        chama={selectedChama}
      />
      <JoinChamaForm 
        isOpen={showJoinForm} 
        onClose={() => setShowJoinForm(false)}
        chama={selectedChama}
      />
    </div>
  );
};
