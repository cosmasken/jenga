
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Modal } from "@/components/ui/modal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useZeroDevCreatePool, useGasSponsorshipInfo } from "@/hooks/useZeroDevContracts";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { InfoIcon, TrendingUp, Users, Calendar, Bitcoin, Loader2, Zap } from "lucide-react";

interface ChamaCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChamaCreationForm = ({ isOpen, onClose }: ChamaCreationFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    weeklyTarget: 5000, // in sats
    maxMembers: 10,
    duration: 12, // weeks
    purpose: ""
  });

  const [calculations, setCalculations] = useState({
    totalPool: 0,
    individualPayout: 0,
    weeklyUSD: 0,
    totalUSD: 0
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const { primaryWallet } = useDynamicContext();
  
  // Get gas sponsorship info
  const { userLevel, eligibleOperations } = useGasSponsorshipInfo();
  
  // Use ZeroDev hook with gas sponsorship
  const { createPool, isLoading, txHash, error } = useZeroDevCreatePool({
    sponsorGas: true,
    userLevel: userLevel
  });

  // Mock BTC price - in real app, fetch from API
  const btcPrice = 45000;

  // Check if this operation qualifies for gas sponsorship
  const isGasSponsored = eligibleOperations.includes('Profile Creation') || userLevel === 'new';

  useEffect(() => {
    const totalPool = formData.weeklyTarget * formData.maxMembers * formData.duration;
    const individualPayout = formData.weeklyTarget * formData.duration;
    const weeklyUSD = (formData.weeklyTarget / 100000000) * btcPrice;
    const totalUSD = (totalPool / 100000000) * btcPrice;

    setCalculations({
      totalPool,
      individualPayout,
      weeklyUSD,
      totalUSD
    });
  }, [formData, btcPrice]);

  // Handle successful transaction
  useEffect(() => {
    if (txHash) {
      toast({
        title: isGasSponsored ? "🎉 Chama Created (Gas Sponsored!)" : "Chama Created Successfully!",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });
      
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        weeklyTarget: 5000,
        maxMembers: 10,
        duration: 12,
        purpose: ""
      });
    }
  }, [txHash, toast, isGasSponsored]);

  const formatSats = (sats: number) => {
    return new Intl.NumberFormat().format(sats);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getSuggestions = () => {
    const suggestions = [];
    
    if (formData.weeklyTarget < 1000) {
      suggestions.push({
        type: 'warning',
        message: 'Consider a higher weekly target for meaningful savings growth'
      });
    }
    
    if (formData.maxMembers < 5) {
      suggestions.push({
        type: 'info',
        message: 'Smaller groups build stronger trust but limit total pool size'
      });
    }
    
    if (formData.duration > 52) {
      suggestions.push({
        type: 'warning',
        message: 'Long durations may reduce member commitment'
      });
    }

    return suggestions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.weeklyTarget || !formData.maxMembers) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
      });
      return;
    }

    if (!primaryWallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    try {
      // Convert weekly target to BTC (assuming input is in sats)
      const weeklyBtc = (formData.weeklyTarget / 100000000).toString();
      
      // Convert duration from weeks to seconds (assuming duration is in weeks)
      const cycleDurationSeconds = formData.duration * 7 * 24 * 60 * 60;
      
      // Calculate total cycles (assuming we want weekly cycles for the duration)
      const totalCycles = formData.duration;
      
      // Create the pool on-chain using Wagmi
      await createPool(
        weeklyBtc,
        cycleDurationSeconds,
        totalCycles,
        [] // No initial members, they can join later
      );
      
    } catch (error) {
      console.error('Error creating chama:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create chama. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSuccess = () => {
    setShowSuccess(false);
    onClose();
    toast({
      title: "🎉 CHAMA CREATED!",
      description: "Your savings circle is ready. Share the invite link with members.",
    });
  };

  return (
    <TooltipProvider>
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="bg-card cyber-border neon-glow max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground font-mono glitch-text flex items-center gap-2">
                <Users className="w-5 h-5" />
                CREATE NEW CHAMA
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Gas Sponsorship Info */}
              {isGasSponsored && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <Zap className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    🎉 <strong>Gas Sponsored!</strong> This transaction is free for {userLevel} users.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-foreground font-mono">Chama Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Women Farmers Circle"
                    className="bg-background/50 border-orange-500/50 text-foreground font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-foreground font-mono">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of your chama"
                    className="bg-background/50 border-orange-500/50 text-foreground font-mono"
                  />
                </div>

                {/* Weekly Target with Visual Helper */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-foreground font-mono">Weekly Target *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Amount each member contributes weekly</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <div className="space-y-3">
                    <Slider
                      value={[formData.weeklyTarget]}
                      onValueChange={([value]) => setFormData({...formData, weeklyTarget: value})}
                      max={50000}
                      min={1000}
                      step={1000}
                      className="w-full"
                    />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono">{formatSats(formData.weeklyTarget)} sats</span>
                      <Badge variant="secondary">
                        ≈ {formatUSD(calculations.weeklyUSD)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Members Slider */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-foreground font-mono">Maximum Members *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>More members = larger pool but requires more coordination</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <Slider
                    value={[formData.maxMembers]}
                    onValueChange={([value]) => setFormData({...formData, maxMembers: value})}
                    max={50}
                    min={3}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-sm text-center mt-1 font-mono">
                    {formData.maxMembers} members
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <Label className="text-foreground font-mono">Duration (weeks)</Label>
                  <Slider
                    value={[formData.duration]}
                    onValueChange={([value]) => setFormData({...formData, duration: value})}
                    max={104}
                    min={4}
                    step={2}
                    className="w-full"
                  />
                  <div className="text-sm text-center mt-1 font-mono">
                    {formData.duration} weeks ({Math.round(formData.duration / 4.33)} months)
                  </div>
                </div>

                <div>
                  <Label htmlFor="purpose" className="text-foreground font-mono">Purpose</Label>
                  <Select onValueChange={(value) => setFormData({...formData, purpose: value})}>
                    <SelectTrigger className="bg-background/50 border-orange-500/50 text-foreground font-mono">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent className="bg-card cyber-border">
                      <SelectItem value="savings">General Savings</SelectItem>
                      <SelectItem value="emergency">Emergency Fund</SelectItem>
                      <SelectItem value="investment">Investment Pool</SelectItem>
                      <SelectItem value="business">Business Funding</SelectItem>
                      <SelectItem value="education">Education Fund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Calculations Preview */}
              <Card className="bg-muted/50 cyber-border">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 font-mono">
                    <TrendingUp className="w-4 h-4" />
                    Chama Projections
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Pool Size</p>
                      <p className="font-semibold font-mono">{formatSats(calculations.totalPool)} sats</p>
                      <p className="text-xs text-muted-foreground">{formatUSD(calculations.totalUSD)}</p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Your Total Contribution</p>
                      <p className="font-semibold font-mono">{formatSats(calculations.individualPayout)} sats</p>
                      <p className="text-xs text-muted-foreground">
                        {formatUSD((calculations.individualPayout / 100000000) * btcPrice)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Payout Frequency</p>
                      <p className="font-semibold font-mono">Every {formData.maxMembers} weeks</p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Your Turn</p>
                      <p className="font-semibold font-mono">Week 1-{formData.maxMembers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Smart Suggestions */}
              {getSuggestions().map((suggestion, index) => (
                <Alert key={index} variant={suggestion.type === 'warning' ? 'destructive' : 'default'}>
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>{suggestion.message}</AlertDescription>
                </Alert>
              ))}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 cyber-button">
                  CANCEL
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 cyber-button bg-orange-500 hover:bg-orange-600 text-black"
                  disabled={!formData.name || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      CREATING...
                    </>
                  ) : (
                    'CREATE CHAMA'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <LoadingModal 
          isOpen={isLoading} 
          title="Creating Chama..." 
          description="Setting up your savings circle on Citrea"
        />

        <Modal
          isOpen={showSuccess}
          onClose={handleSuccess}
          type="create-chama"
          title="Chama Created Successfully!"
          description="Your savings circle is ready. Share the invite code with members to get started."
          chamaName={formData.name}
          onConfirm={handleSuccess}
          confirmText="COPY INVITE CODE"
        />
      </>
    </TooltipProvider>
  );
};
