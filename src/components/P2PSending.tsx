import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { P2PSendForm } from "@/components/P2PSendForm";
import { RedEnvelopeForm } from "@/components/RedEnvelopeForm";
import { useP2PHistory } from "@/hooks/useP2PSending";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { Clock, Send, Gift, Zap, ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, AlertCircle } from "lucide-react";

export const P2PSending = () => {
  const [showSendForm, setShowSendForm] = useState(false);
  const [showRedEnvelopeForm, setShowRedEnvelopeForm] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { transactions, isLoading: isLoadingHistory, loadHistory } = useP2PHistory();

  // Load transaction history when component mounts
  useEffect(() => {
    if (isConnected) {
      loadHistory();
    }
  }, [isConnected, loadHistory]);

  // Mock active envelopes (you can replace this with real data)
  const activeEnvelopes = [
    {
      id: 1,
      message: "Happy Stacking!",
      amount: 100000,
      total: 10,
      claimed: 7,
      createdAt: "2024-08-01"
    },
    {
      id: 2,
      message: "Bitcoin is Freedom",
      amount: 50000,
      total: 5,
      claimed: 2,
      createdAt: "2024-07-30"
    }
  ];

  const formatBalance = () => {
    if (!balance) return "0 cBTC";
    return `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(6)} ${balance.symbol}`;
  };

  const formatSats = (amount: bigint) => {
    // Convert from wei to sats (rough conversion for display)
    const btc = parseFloat(formatUnits(amount, 18));
    const sats = Math.round(btc * 100000000);
    return sats.toLocaleString();
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString();
  };

  const getTransactionStats = () => {
    const totalTransactions = transactions.length;
    const totalSent = transactions
      .filter(tx => tx.type === 'sent')
      .reduce((sum, tx) => sum + tx.amount, 0n);
    const totalReceived = transactions
      .filter(tx => tx.type === 'received')
      .reduce((sum, tx) => sum + tx.amount, 0n);

    return {
      totalTransactions,
      totalSent,
      totalReceived
    };
  };

  const stats = getTransactionStats();

  return (
    <div className="space-y-6">
      {/* Wallet Status */}
      {!isConnected ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to send Bitcoin and view transaction history.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 cyber-border neon-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-8 h-8" />
                <div>
                  <h3 className="font-bold text-lg font-mono">Your Balance</h3>
                  <p className="text-blue-100 font-mono">{address?.slice(0, 10)}...{address?.slice(-8)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-mono">{formatBalance()}</div>
                <p className="text-blue-100 text-sm font-mono">Available to send</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 cyber-border neon-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white font-mono">
              <Send className="w-5 h-5" />
              Quick Send
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-100 mb-4 font-mono">Send Bitcoin instantly on Citrea</p>
            <Button 
              onClick={() => setShowSendForm(true)}
              disabled={!isConnected}
              className="w-full bg-white text-green-600 hover:bg-green-50 cyber-button font-mono"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isConnected ? 'Send Now' : 'Connect Wallet'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-600 to-pink-600 text-white border-0 cyber-border neon-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white font-mono">
              <Gift className="w-5 h-5" />
              Red Envelope
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-100 mb-4 font-mono">Send lucky money with crypto tradition</p>
            <Button 
              onClick={() => setShowRedEnvelopeForm(true)}
              disabled={!isConnected}
              className="w-full bg-white text-red-600 hover:bg-red-50 cyber-button font-mono"
            >
              <Gift className="w-4 h-4 mr-2" />
              {isConnected ? 'Create Envelope' : 'Connect Wallet'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-mono">
            <Clock className="w-5 h-5 text-blue-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground font-mono">Connect your wallet to view transaction history</p>
            </div>
          ) : isLoadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground font-mono">Loading transaction history...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Send className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground font-mono">No transactions yet</p>
              <p className="text-sm text-muted-foreground font-mono">Send your first Bitcoin to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'sent' ? 'bg-red-500/20' : 'bg-green-500/20'
                    }`}>
                      {tx.type === 'sent' ? 
                        <ArrowUpRight className="w-4 h-4 text-red-400" /> :
                        <ArrowDownLeft className="w-4 h-4 text-green-400" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-foreground font-mono">
                        {tx.recipient.slice(0, 10)}...{tx.recipient.slice(-8)}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatTimestamp(tx.timestamp)}
                      </p>
                      {tx.note && (
                        <p className="text-xs text-muted-foreground italic">"{tx.note}"</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold font-mono ${
                      tx.type === 'sent' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {tx.type === 'sent' ? '-' : '+'}{formatSats(tx.amount)} sats
                    </p>
                    <Badge variant="outline" className={`text-xs ${
                      tx.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                      tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                      'bg-red-500/20 text-red-400 border-red-500/50'
                    }`}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {transactions.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm" className="font-mono">
                    View All Transactions
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Red Envelopes */}
      <Card className="bg-card cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-mono">
            <Gift className="w-5 h-5 text-red-400" />
            Active Red Envelopes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeEnvelopes.map((envelope) => (
              <div key={envelope.id} className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-lg border border-red-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-red-400 font-mono">{envelope.message}</h4>
                  <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50 font-mono">
                    {envelope.claimed}/{envelope.total} claimed
                  </Badge>
                </div>
                <p className="text-foreground font-mono text-sm mb-2">{envelope.amount.toLocaleString()} sats remaining</p>
                <p className="text-red-300 font-mono text-xs">Created {envelope.createdAt}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* P2P Statistics */}
      <Card className="bg-card cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-mono">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            P2P Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground font-mono">Connect wallet to view statistics</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground font-mono">{stats.totalTransactions}</div>
                <div className="text-sm text-muted-foreground font-mono">Total Transactions</div>
                <div className="text-xs text-blue-400 font-mono">All time</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground font-mono">{formatSats(stats.totalSent)}</div>
                <div className="text-sm text-muted-foreground font-mono">Sats Sent</div>
                <div className="text-xs text-red-400 font-mono">All time</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground font-mono">{formatSats(stats.totalReceived)}</div>
                <div className="text-sm text-muted-foreground font-mono">Sats Received</div>
                <div className="text-xs text-green-400 font-mono">All time</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground font-mono">{activeEnvelopes.length}</div>
                <div className="text-sm text-muted-foreground font-mono">Red Envelopes</div>
                <div className="text-xs text-orange-400 font-mono">Active</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forms */}
      <P2PSendForm isOpen={showSendForm} onClose={() => setShowSendForm(false)} />
      <RedEnvelopeForm isOpen={showRedEnvelopeForm} onClose={() => setShowRedEnvelopeForm(false)} />
    </div>
  );
};
