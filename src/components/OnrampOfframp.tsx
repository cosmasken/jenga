
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Modal } from "@/components/ui/modal";
import { ArrowDownToLine, ArrowUpFromLine, CreditCard, Smartphone, Building, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  fees: string;
  time: string;
  limits: string;
  available: boolean;
}

const onrampMethods: PaymentMethod[] = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: <CreditCard className="w-6 h-6" />,
    fees: "3.5%",
    time: "Instant",
    limits: "$50 - $10,000",
    available: true
  },
  {
    id: "mpesa",
    name: "M-Pesa",
    icon: <Smartphone className="w-6 h-6" />,
    fees: "2.5%",
    time: "1-5 minutes",
    limits: "KES 100 - KES 500,000",
    available: true
  },
  {
    id: "bank",
    name: "Bank Transfer",
    icon: <Building className="w-6 h-6" />,
    fees: "1.0%",
    time: "1-3 business days",
    limits: "$100 - $50,000",
    available: true
  },
  {
    id: "p2p",
    name: "P2P Trading",
    icon: <Globe className="w-6 h-6" />,
    fees: "0.5%",
    time: "5-30 minutes",
    limits: "Variable",
    available: false
  }
];

export const OnrampOfframp = () => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [activeTab, setActiveTab] = useState("onramp");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    paymentDetails: ""
  });

  const handleTransaction = async () => {
    if (!selectedMethod || !formData.amount) return;
    
    setIsLoading(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsLoading(false);
    setSelectedMethod(null);
    setShowSuccess(true);
    setFormData({ amount: "", currency: "USD", paymentDetails: "" });
  };

  const getMethodIcon = (methodId: string) => {
    const method = onrampMethods.find(m => m.id === methodId);
    return method?.icon || <CreditCard className="w-6 h-6" />;
  };

  return (
    <>
      <Card className="bg-card cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-mono">
            <ArrowDownToLine className="w-5 h-5 text-green-400" />
            Buy/Sell Bitcoin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-background/50 border border-border">
              <TabsTrigger 
                value="onramp" 
                className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-mono"
              >
                <ArrowDownToLine className="w-4 h-4 mr-2" />
                BUY
              </TabsTrigger>
              <TabsTrigger 
                value="offramp" 
                className="data-[state=active]:bg-red-500 data-[state=active]:text-black font-mono"
              >
                <ArrowUpFromLine className="w-4 h-4 mr-2" />
                SELL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="onramp" className="mt-6">
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-green-400 font-mono mb-2">BUY BITCOIN</h3>
                  <p className="text-muted-foreground text-sm font-mono">Choose your preferred payment method</p>
                </div>
                
                <div className="grid gap-4">
                  {onrampMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        method.available
                          ? 'bg-background/30 border-border hover:border-green-500/50'
                          : 'bg-gray-500/10 border-gray-500/30 opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => method.available && setSelectedMethod(method)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-green-400">{method.icon}</div>
                          <div>
                            <h4 className="font-semibold text-foreground font-mono">{method.name}</h4>
                            <p className="text-xs text-muted-foreground font-mono">{method.limits}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50 font-mono text-xs mb-1">
                            {method.fees}
                          </Badge>
                          <p className="text-xs text-muted-foreground font-mono">{method.time}</p>
                        </div>
                      </div>
                      {!method.available && (
                        <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/50 font-mono text-xs mt-2">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="offramp" className="mt-6">
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-red-400 font-mono mb-2">SELL BITCOIN</h3>
                  <p className="text-muted-foreground text-sm font-mono">Convert your Bitcoin to fiat currency</p>
                </div>
                
                <div className="space-y-4">
                  {onrampMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        method.available
                          ? 'bg-background/30 border-border hover:border-red-500/50'
                          : 'bg-gray-500/10 border-gray-500/30 opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => method.available && setSelectedMethod(method)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-red-400">{method.icon}</div>
                          <div>
                            <h4 className="font-semibold text-foreground font-mono">{method.name}</h4>
                            <p className="text-xs text-muted-foreground font-mono">{method.limits}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50 font-mono text-xs mb-1">
                            {method.fees}
                          </Badge>
                          <p className="text-xs text-muted-foreground font-mono">{method.time}</p>
                        </div>
                      </div>
                      {!method.available && (
                        <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/50 font-mono text-xs mt-2">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <Dialog open={!!selectedMethod} onOpenChange={() => setSelectedMethod(null)}>
        <DialogContent className="bg-card cyber-border neon-glow max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-mono glitch-text">
              {activeTab === "onramp" ? (
                <ArrowDownToLine className="w-5 h-5 text-green-400" />
              ) : (
                <ArrowUpFromLine className="w-5 h-5 text-red-400" />
              )}
              {activeTab === "onramp" ? "Buy" : "Sell"} Bitcoin
            </DialogTitle>
          </DialogHeader>
          
          {selectedMethod && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-background/30 border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className={activeTab === "onramp" ? "text-green-400" : "text-red-400"}>
                    {selectedMethod.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground font-mono">{selectedMethod.name}</h4>
                    <p className="text-xs text-muted-foreground font-mono">Fee: {selectedMethod.fees} • {selectedMethod.time}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="amount" className="text-muted-foreground font-mono">AMOUNT</Label>
                <div className="flex gap-2">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="100"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="bg-background/50 border-orange-500/30 text-foreground font-mono cyber-border flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setFormData({...formData, currency: formData.currency === "USD" ? "KES" : "USD"})}
                    className="cyber-button min-w-[60px]"
                  >
                    {formData.currency}
                  </Button>
                </div>
              </div>

              {selectedMethod.id === "mpesa" && (
                <div>
                  <Label htmlFor="mpesa" className="text-muted-foreground font-mono">M-PESA NUMBER</Label>
                  <Input
                    id="mpesa"
                    placeholder="254712345678"
                    value={formData.paymentDetails}
                    onChange={(e) => setFormData({...formData, paymentDetails: e.target.value})}
                    className="bg-background/50 border-orange-500/30 text-foreground font-mono cyber-border"
                  />
                </div>
              )}

              {selectedMethod.id === "bank" && (
                <div>
                  <Label htmlFor="account" className="text-muted-foreground font-mono">ACCOUNT NUMBER</Label>
                  <Input
                    id="account"
                    placeholder="1234567890"
                    value={formData.paymentDetails}
                    onChange={(e) => setFormData({...formData, paymentDetails: e.target.value})}
                    className="bg-background/50 border-orange-500/30 text-foreground font-mono cyber-border"
                  />
                </div>
              )}

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <p className="text-orange-400 font-mono text-sm">
                  You will {activeTab === "onramp" ? "receive" : "send"}: <span className="font-bold">
                    {formData.amount ? (parseFloat(formData.amount) * 0.000025).toFixed(8) : "0.00000000"} BTC
                  </span>
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Rate: 1 BTC = ${(1 / 0.000025).toLocaleString()}
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedMethod(null)} className="flex-1 cyber-button">
                  CANCEL
                </Button>
                <Button 
                  onClick={handleTransaction}
                  disabled={!formData.amount}
                  className={`flex-1 cyber-button ${
                    activeTab === "onramp" 
                      ? "bg-green-500 hover:bg-green-600" 
                      : "bg-red-500 hover:bg-red-600"
                  } text-white`}
                >
                  {activeTab === "onramp" ? "BUY" : "SELL"} BITCOIN
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <LoadingModal
        isOpen={isLoading}
        title={`Processing ${activeTab === "onramp" ? "Purchase" : "Sale"}...`}
        description={`Processing your ${activeTab === "onramp" ? "Bitcoin purchase" : "Bitcoin sale"} via ${selectedMethod?.name}`}
      />

      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        type="success"
        title={`${activeTab === "onramp" ? "Purchase" : "Sale"} Successful! 🎉`}
        description={`Your ${activeTab === "onramp" ? "Bitcoin purchase" : "Bitcoin sale"} has been completed`}
        amount={`${formData.amount} ${formData.currency}`}
      />
    </>
  );
};
