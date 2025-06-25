
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, QrCode, Gift, Clock, CheckCircle, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const P2PSending = () => {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const { toast } = useToast();

  const recentTransactions = [
    { id: 1, type: "sent", to: "Alice M.", amount: 5000, status: "confirmed", time: "2 min ago", message: "Lunch split 🍕" },
    { id: 2, type: "received", from: "Bob K.", amount: 10000, status: "confirmed", time: "1 hour ago", message: "Birthday gift! 🎉" },
    { id: 3, type: "sent", to: "Women Farmers Circle", amount: 5000, status: "confirmed", time: "2 hours ago", message: "Weekly contribution" },
    { id: 4, type: "sent", to: "Charlie R.", amount: 2500, status: "pending", time: "3 hours ago", message: "Coffee ☕" }
  ];

  const quickSendContacts = [
    { name: "Alice M.", avatar: "👩‍💼", lastSent: "5k sats" },
    { name: "Bob K.", avatar: "👨‍💻", lastSent: "10k sats" },
    { name: "Charlie R.", avatar: "👨‍🎨", lastSent: "2.5k sats" },
    { name: "Diana L.", avatar: "👩‍🔬", lastSent: "Never" }
  ];

  const handleSendSats = () => {
    if (!sendAmount || !recipient) {
      toast({
        title: "Missing Information",
        description: "Please enter both amount and recipient.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "⚡ Sats Sent!",
      description: `${sendAmount} sats sent to ${recipient} instantly via L2.`,
    });
    
    setSendAmount("");
    setRecipient("");
  };

  const handleQuickSend = (contactName: string) => {
    toast({
      title: "💸 Quick Send",
      description: `1,000 sats sent to ${contactName}`,
    });
  };

  const handleGiftEnvelope = () => {
    toast({
      title: "🧧 Red Envelope Created!",
      description: "Share the link to let friends claim their Bitcoin gift.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Send */}
      <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Lightning Fast P2P
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-green-100 text-sm mb-2 block">Amount (sats)</label>
              <Input
                type="number"
                placeholder="1000"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="text-green-100 text-sm mb-2 block">To</label>
              <Input
                placeholder="Username or address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="bg-white text-gray-900"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSendSats}
              variant="secondary" 
              className="bg-white text-green-600 hover:bg-green-50"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Now
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Send Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Quick Send Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickSendContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{contact.avatar}</div>
                    <div>
                      <div className="font-semibold">{contact.name}</div>
                      <div className="text-xs text-gray-500">Last: {contact.lastSent}</div>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleQuickSend(contact.name)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Send 1k
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Gifting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-600" />
              Social Gifting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-pink-800 mb-2">🧧 Bitcoin Red Envelopes</h3>
              <p className="text-pink-600 text-sm mb-3">Create shareable Bitcoin gifts for special occasions</p>
              <Button 
                size="sm" 
                onClick={handleGiftEnvelope}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                Create Envelope
              </Button>
            </div>

            <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">🎉 Milestone Celebrations</h3>
              <p className="text-yellow-600 text-sm mb-3">Celebrate achievements with Bitcoin rewards</p>
              <Button 
                size="sm" 
                variant="outline"
                className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
              >
                Send Celebration
              </Button>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">⚡ Split Bills</h3>
              <p className="text-blue-600 text-sm mb-3">Easily split expenses with friends</p>
              <Button 
                size="sm" 
                variant="outline"
                className="border-blue-500 text-blue-700 hover:bg-blue-50"
              >
                Create Split
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${tx.type === 'sent' ? 'bg-red-100' : 'bg-green-100'}`}>
                    <Send className={`w-4 h-4 ${tx.type === 'sent' ? 'text-red-600' : 'text-green-600 rotate-180'}`} />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {tx.type === 'sent' ? `To ${tx.to}` : `From ${tx.from}`}
                    </div>
                    <div className="text-sm text-gray-600">{tx.message}</div>
                    <div className="text-xs text-gray-500">{tx.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${tx.type === 'sent' ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.type === 'sent' ? '-' : '+'}{tx.amount.toLocaleString()} sats
                  </div>
                  <Badge 
                    variant={tx.status === 'confirmed' ? 'default' : 'secondary'}
                    className={`text-xs ${tx.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}`}
                  >
                    {tx.status === 'confirmed' ? (
                      <><CheckCircle className="w-3 h-3 mr-1" />Confirmed</>
                    ) : (
                      <><Clock className="w-3 h-3 mr-1" />Pending</>
                    )}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* P2P Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Sending Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">47</div>
              <div className="text-sm text-gray-600">Transactions</div>
              <div className="text-xs text-gray-500">This month</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">234,567</div>
              <div className="text-sm text-gray-600">Sats Sent</div>
              <div className="text-xs text-gray-500">Total volume</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">15</div>
              <div className="text-sm text-gray-600">Active Contacts</div>
              <div className="text-xs text-gray-500">Regular recipients</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2.1s</div>
              <div className="text-sm text-gray-600">Avg Speed</div>
              <div className="text-xs text-gray-500">L2 transactions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
