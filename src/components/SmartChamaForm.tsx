import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { InfoIcon, TrendingUp, Users, Calendar, Bitcoin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SmartChamaFormProps {
  onSubmit: (data: any) => void;
}

export const SmartChamaForm = ({ onSubmit }: SmartChamaFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    weeklyTarget: 5000, // in sats
    maxMembers: 10,
    duration: 12, // weeks
    purpose: ''
  });

  const [calculations, setCalculations] = useState({
    totalPool: 0,
    individualPayout: 0,
    weeklyUSD: 0,
    totalUSD: 0
  });

  // Mock BTC price - in real app, fetch from API
  const btcPrice = 45000;

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

  return (
    <TooltipProvider>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create Your Chama
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Chama Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Women Farmers Circle"
              />
            </div>

            {/* Weekly Target with Visual Helper */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Weekly Target</Label>
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
                  <span>{formatSats(formData.weeklyTarget)} sats</span>
                  <Badge variant="secondary">
                    ≈ {formatUSD(calculations.weeklyUSD)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Members Slider */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Maximum Members</Label>
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
              <div className="text-sm text-center mt-1">
                {formData.maxMembers} members
              </div>
            </div>

            {/* Duration */}
            <div>
              <Label>Duration (weeks)</Label>
              <Slider
                value={[formData.duration]}
                onValueChange={([value]) => setFormData({...formData, duration: value})}
                max={104}
                min={4}
                step={2}
                className="w-full"
              />
              <div className="text-sm text-center mt-1">
                {formData.duration} weeks ({Math.round(formData.duration / 4.33)} months)
              </div>
            </div>
          </div>

          {/* Calculations Preview */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Chama Projections
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Pool Size</p>
                  <p className="font-semibold">{formatSats(calculations.totalPool)} sats</p>
                  <p className="text-xs text-muted-foreground">{formatUSD(calculations.totalUSD)}</p>
                </div>
                
                <div>
                  <p className="text-muted-foreground">Your Total Contribution</p>
                  <p className="font-semibold">{formatSats(calculations.individualPayout)} sats</p>
                  <p className="text-xs text-muted-foreground">
                    {formatUSD((calculations.individualPayout / 100000000) * btcPrice)}
                  </p>
                </div>
                
                <div>
                  <p className="text-muted-foreground">Payout Frequency</p>
                  <p className="font-semibold">Every {formData.maxMembers} weeks</p>
                </div>
                
                <div>
                  <p className="text-muted-foreground">Your Turn</p>
                  <p className="font-semibold">Week 1-{formData.maxMembers}</p>
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

          {/* Submit */}
          <Button 
            onClick={() => onSubmit(formData)} 
            className="w-full"
            disabled={!formData.name}
          >
            Create Chama
          </Button>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
