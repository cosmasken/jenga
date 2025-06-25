
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Send, Users, Gift, QrCode, Clock, CheckCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const P2PSending = () => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [redEnvelopeAmount, setRedEnvelopeAmount] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRedEnvelopeModal, setShowRedEnvelopeModal] = useState(false);
  const [modalData, setModalData] = useState({ type: "success", title: "", description: "", amount: "", recipient: "" });
  const { toast } = useToast();

  const handleSend = () => {
    if (!recipient || !amount) {
      toast({
        title: "Missing Information",
        description: "Please enter both recipient and amount",
      });
      return;
    }

    setModalData({
      type: "success",
      title: "Payment Sent Successfully!",
      description: "Your Bitcoin has been sent instantly via Citrea L2",
      amount: `${amount} sats`,
      recipient: recipient
    });
    setShowSuccessModal(true);
    setRecipient("");
    setAmount("");
  };

  const handleRedEnvelope = () => {
    if (!redEnvelopeAmount) {
      toast({
        title: "Missing Amount",
        description: "Please enter the red envelope amount",
      });
      return;
    }

    setModalData({
      type: "redenvelope",
      title: "Red Envelope Created! 🧧",
      description: "Share this link with friends to claim their sats",
      amount: `${redEnvelopeAmount} sats`,
      recipient: ""
    });
    setShowRedEnvelopeModal(true);
    setRedEnvelopeAmount("");
  };

  const recentTransactions = [
    { id: 1, recipient: "Alice", amount: "5,000", status: "completed", time: "2 min ago" },
    { id: 2, recipient: "Bob", amount: "2,500", status: "pending", time: "5 min ago" },
    { id: 3, recipient: "Carol", amount: "10,000", status: "completed", time: "1 hour ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Send */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-green-600" />
            Quick Send
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Recipient Address or Username
              </label>
              <Input
                placeholder="bc1q... or @username"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Amount (sats)
              </label>
              <Input
                type="number"
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSend}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Instantly
            </Button>
            <Button variant="outline">
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Red Envelopes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-red-600" />
              Bitcoin Red Envelopes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">
              Create shareable red envelopes for celebrations and gifting
            </p>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Total Amount (sats)
              </label>
              <Input
                type="number"
                placeholder="10000"
                value={redEnvelopeAmount}
                onChange={(e) => setRedEnvelopeAmount(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleRedEnvelope}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Gift className="w-4 h-4 mr-2" />
              Create Red Envelope
            </Button>
            
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Active Red Envelopes</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm">New Year 2024</span>
                  <Badge variant="outline" className="bg-red-100 text-red-700">2/5 claimed</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm">Birthday Gift</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700">Completed</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Gifting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Social Gifting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">
              Send sats for milestones and celebrations
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-auto p-3">
                <div className="text-center">
                  <div className="text-lg mb-1">🎂</div>
                  <div className="text-xs">Birthday</div>
                </div>
              </Button>
              
              <Button variant="outline" size="sm" className="h-auto p-3">
                <div className="text-center">
                  <div className="text-lg mb-1">🎓</div>
                  <div className="text-xs">Graduation</div>
                </div>
              </Button>
              
              <Button variant="outline" size="sm" className="h-auto p-3">
                <div className="text-center">
                  <div className="text-lg mb-1">💼</div>
                  <div className="text-xs">New Job</div>
                </div>
              </Button>
              
              <Button variant="outline" size="sm" className="h-auto p-3">
                <div className="text-center">
                  <div className="text-lg mb-1">🏆</div>
                  <div className="text-xs">Achievement</div>
                </div>
              </Button>
            </div>
            
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Browse Templates
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{tx.recipient}</p>
                    <p className="text-sm text-gray-600">{tx.time}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold">-{tx.amount} sats</p>
                  <div className="flex items-center gap-1">
                    {tx.status === "completed" ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <Clock className="w-3 h-3 text-yellow-600" />
                    )}
                    <span className={`text-xs capitalize ${
                      tx.status === "completed" ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type={modalData.type as any}
        title={modalData.title}
        description={modalData.description}
        amount={modalData.amount}
        recipient={modalData.recipient}
      />

      {/* Red Envelope Modal */}
      <Modal
        isOpen={showRedEnvelopeModal}
        onClose={() => setShowRedEnvelopeModal(false)}
        type="redenvelope"
        title={modalData.title}
        description={modalData.description}
        amount={modalData.amount}
        onConfirm={() => {
          toast({
            title: "🔗 Link Copied!",
            description: "Red envelope link copied to clipboard",
          });
          setShowRedEnvelopeModal(false);
        }}
        confirmText="Copy Link"
      />
    </div>
  );
};
