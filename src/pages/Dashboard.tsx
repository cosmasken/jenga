import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Users, Send } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAppStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 container py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personal Stacking</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 cBTC</div>
              <p className="text-xs text-muted-foreground">Stacked in personal wallet</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chama Circles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 Circles</div>
              <p className="text-xs text-muted-foreground">Active savings groups</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">P2P Sending</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 cBTC</div>
              <p className="text-xs text-muted-foreground">Sent this month</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Welcome back, {user.name || 'User'}!</h2>
          <p className="text-muted-foreground mb-6">
            Manage your assets and start stacking today.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button className="w-full">Stack cBTC</Button>
            <Button className="w-full" variant="outline">Join a Circle</Button>
            <Button className="w-full" variant="outline">Send cBTC</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
