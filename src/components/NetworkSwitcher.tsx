
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Globe, ChevronDown } from "lucide-react";

export const NetworkSwitcher = () => {
  const [selectedNetwork, setSelectedNetwork] = useState("citrea-testnet");
  const { toast } = useToast();

  const networks = [
    {
      id: "citrea-testnet",
      name: "Citrea Testnet",
      status: "active",
      color: "bg-orange-500/20 text-orange-400 border-orange-500/50"
    },
    {
      id: "citrea-mainnet",
      name: "Citrea Mainnet",
      status: "coming-soon",
      color: "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  ];

  const handleNetworkSwitch = (networkId: string) => {
    if (networkId === "citrea-mainnet") {
      toast({
        title: "🚧 NETWORK UNAVAILABLE",
        description: "Citrea Mainnet is coming soon. Stay on Testnet for now.",
      });
      return;
    }

    setSelectedNetwork(networkId);
    toast({
      title: "🔄 NETWORK SWITCHED",
      description: `Connected to ${networks.find(n => n.id === networkId)?.name}`,
    });
  };

  const currentNetwork = networks.find(n => n.id === selectedNetwork);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="cyber-button">
          <Globe className="w-4 h-4 mr-2" />
          <Badge variant="outline" className={currentNetwork?.color}>
            {currentNetwork?.name}
          </Badge>
          <ChevronDown className="w-3 h-3 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card cyber-border neon-glow">
        {networks.map((network) => (
          <DropdownMenuItem
            key={network.id}
            onClick={() => handleNetworkSwitch(network.id)}
            className="font-mono text-foreground hover:bg-orange-500/20"
            disabled={network.status === "coming-soon"}
          >
            <div className="flex items-center justify-between w-full">
              <span>{network.name}</span>
              {network.status === "coming-soon" && (
                <Badge variant="outline" className="text-xs">
                  SOON
                </Badge>
              )}
              {network.id === selectedNetwork && (
                <div className="w-2 h-2 bg-orange-400 rounded-full neon-glow"></div>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
