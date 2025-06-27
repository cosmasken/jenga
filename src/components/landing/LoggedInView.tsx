import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap } from "lucide-react";
import { PersonalStacking } from "@/components/PersonalStacking";
import { ChamaCircles } from "@/components/ChamaCircles";
import { P2PSending } from "@/components/P2PSending";

export const LoggedInView = () => {
  return (
    <Tabs defaultValue="stacking" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="stacking">
          <Zap className="w-4 h-4 mr-2" />
          STACKING
        </TabsTrigger>
        <TabsTrigger value="chamas">
          <Zap className="w-4 h-4 mr-2" />
          CHAMAS 2
        </TabsTrigger>
        <TabsTrigger value="sending">
          <Zap className="w-4 h-4 mr-2" />
          SEND
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stacking" className="mt-6">
        <PersonalStacking />
      </TabsContent>

      <TabsContent value="chamas" className="mt-6">
        <ChamaCircles />
      </TabsContent>

      <TabsContent value="sending" className="mt-6">
        <P2PSending />
      </TabsContent>
    </Tabs>
  );
};
