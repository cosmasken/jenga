import { useAppStore } from "@/store/appStore";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Users, Send, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAppStore();

  // // Redirect to login if not authenticated
  // useEffect(() => {
  //   if (!user) {
  //     navigate('/');
  //   }
  // }, [user, navigate]);

  // if (!user) {
  //   return null; // Or a loading spinner
  // }

  return (
    <DashboardLayout active="stacking">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-yellow-900/30 to-gray-900/80 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-yellow-300">Personal Stacking</CardTitle>
              <Coins className="h-5 w-5 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-200">0 cBTC</div>
              <p className="text-xs text-gray-400">Stacked in personal wallet</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-900/30 to-gray-900/80 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-blue-300">Chama Circles</CardTitle>
              <Users className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-200">0 Circles</div>
              <p className="text-xs text-gray-400">Active savings groups</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-900/30 to-gray-900/80 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-green-300">P2P Sending</CardTitle>
              <Send className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-200">0 cBTC</div>
              <p className="text-xs text-gray-400">Sent this month</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-400/30 to-yellow-800/80 shadow-lg border-2 border-yellow-400">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-yellow-400">Giftcards</CardTitle>
              <Gift className="h-5 w-5 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">Red Envelopes</div>
              <p className="text-xs text-yellow-300">Send festive group gifts</p>
            </CardContent>
          </Card>
        </div>
        <div className="rounded-xl bg-gray-900/70 p-6 mb-8 shadow-xl border border-gray-800">
          <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-yellow-300">Welcome back, {user.name || 'User'}!</h2>
          <p className="text-gray-400 mb-6">
            Manage your Bitcoin-native assets, join savings circles, send P2P, and gift with style.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold shadow" size="lg">
              <Coins className="w-5 h-5 mr-2" /> Stack cBTC
            </Button>
            <Button className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold shadow" size="lg">
              <Users className="w-5 h-5 mr-2" /> Join a Circle
            </Button>
            <Button className="w-full bg-green-500 hover:bg-green-400 text-white font-bold shadow" size="lg">
              <Send className="w-5 h-5 mr-2" /> Send cBTC
            </Button>
            <Button className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold shadow border-2 border-yellow-500" size="lg">
              <Gift className="w-5 h-5 mr-2" /> Giftcard / Red Envelope
            </Button>
          </div>
        </div>
        {/* You can slot in your main feature components here, e.g. <PersonalStacking />, <ChamaCircles />, <P2PSending />, <RedEnvelopeForm /> */}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
