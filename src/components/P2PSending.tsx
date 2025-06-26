import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { P2PSendForm } from "@/components/P2PSendForm";
import { RedEnvelopeForm } from "@/components/RedEnvelopeForm";
import { Clock, Send, Gift, Zap, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react";

export const P2PSending = () => {
  const [showSendForm, setShowSendForm] = useState(false);
  const [showRedEnvelopeForm, setShowRedEnvelopeForm] = useState(false);

  const recentTransactions = [
    {
      id: 1,
      type: "sent",
      recipient: "bc1qxy...",
      amount: 15000,
      timestamp: "2024-08-01 14:30",
      status: "confirmed"
    },
    {
      id: 2,
      type: "received",
      recipient: "bc1pzq...",
      amount: 22000,
      timestamp: "2024-07-28 09:15",
      status: "confirmed"
    },
    {
      id: 3,
      type: "redenvelope",
      recipient: "Lucky Draw",
      amount: 5000,
      timestamp: "2024-07-25 18:00",
      status: "pending"
    }
  ];

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

  return (
    <div className="space-y-6">
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
            <p className="text-green-100 mb-4 font-mono">Send Bitcoin instantly to anyone</p>
            <Button 
              onClick={() => setShowSendForm(true)}
              className="w-full bg-white text-green-600 hover:bg-green-50 cyber-button font-mono"
            >
              <Zap className="w-4 h-4 mr-2" />
              Send Now
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
              className="w-full bg-white text-red-600 hover:bg-red-50 cyber-button font-mono"
            >
              <Gift className="w-4 h-4 mr-2" />
              Create Envelope
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
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'sent' ? 'bg-red-500/20' : 
                    tx.type === 'received' ? 'bg-green-500/20' : 'bg-orange-500/20'
                  }`}>
                    {tx.type === 'sent' ? <ArrowUpRight className="w-4 h-4 text-red-400" /> :
                     tx.type === 'received' ? <ArrowDownLeft className="w-4 h-4 text-green-400" /> :
                     <Gift className="w-4 h-4 text-orange-400" />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground font-mono">{tx.recipient}</p>
                    <p className="text-xs text-muted-foreground font-mono">{tx.timestamp}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold font-mono ${
                    tx.type === 'sent' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {tx.type === 'sent' ? '-' : '+'}{tx.amount.toLocaleString()} sats
                  </p>
                  <Badge variant="outline" className={`text-xs ${
                    tx.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                  }`}>
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground font-mono">127</div>
              <div className="text-sm text-muted-foreground font-mono">Total Transactions</div>
              <div className="text-xs text-green-400 font-mono">This month</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground font-mono">84,523</div>
              <div className="text-sm text-muted-foreground font-mono">Sats Sent</div>
              <div className="text-xs text-red-400 font-mono">All time</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground font-mono">15</div>
              <div className="text-sm text-muted-foreground font-mono">Red Envelopes</div>
              <div className="text-xs text-orange-400 font-mono">Created</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground font-mono">32</div>
              <div className="text-sm text-muted-foreground font-mono">Contacts</div>
              <div className="text-xs text-blue-400 font-mono">In network</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forms */}
      <P2PSendForm isOpen={showSendForm} onClose={() => setShowSendForm(false)} />
      <RedEnvelopeForm isOpen={showRedEnvelopeForm} onClose={() => setShowRedEnvelopeForm(false)} />
    </div>
  );
};
