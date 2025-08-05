import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bitcoin, Wallet } from "lucide-react";

interface DynamicTestProps {
  onConnect: () => void;
}

export function DynamicTest({ onConnect }: DynamicTestProps) {
  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 border-2 border-[hsl(27,87%,54%)] dark:border-[hsl(27,87%,54%)]">
      <CardContent className="pt-6 text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[hsl(27,87%,54%)]/10 rounded-full mb-4">
            <Wallet className="h-8 w-8 text-[hsl(27,87%,54%)]" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Connect Your Wallet
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          DynamicTest component ready for wallet integration
        </p>
        
        <Button 
          onClick={onConnect}
          className="w-full bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          data-testid="button-connect-wallet"
        >
          <Bitcoin className="mr-2 h-5 w-5" />
          Connect Bitcoin Wallet
        </Button>
        
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Powered by Dynamic SDK (Integration Ready)
        </div>
      </CardContent>
    </Card>
  );
}
