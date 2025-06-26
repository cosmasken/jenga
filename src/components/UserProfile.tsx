
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.profile?.name || "Bitcoin Stacker",
    location: user?.profile?.location || "Global",
    email: "stacker@bitcoin.com",
    joinDate: "January 2024"
  });

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "✅ Profile Updated",
      description: "Your profile information has been saved",
    });
  };

  return (
    <Card className="bg-card cyber-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground font-mono">
          Profile Information
          <Button
            size="sm"
            variant="outline"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="cyber-button"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-muted-foreground font-mono">NAME</Label>
            {isEditing ? (
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="bg-background/50 border-orange-500/30 text-foreground font-mono cyber-border"
              />
            ) : (
              <p className="text-foreground font-mono text-lg">{profile.name}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="location" className="text-muted-foreground font-mono">LOCATION</Label>
            {isEditing ? (
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
                className="bg-background/50 border-orange-500/30 text-foreground font-mono cyber-border"
              />
            ) : (
              <p className="text-foreground font-mono text-lg">{profile.location}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="email" className="text-muted-foreground font-mono">EMAIL</Label>
            {isEditing ? (
              <Input
                id="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="bg-background/50 border-orange-500/30 text-foreground font-mono cyber-border"
              />
            ) : (
              <p className="text-foreground font-mono text-lg">{profile.email}</p>
            )}
          </div>
          
          <div>
            <Label className="text-muted-foreground font-mono">MEMBER SINCE</Label>
            <p className="text-foreground font-mono text-lg">{profile.joinDate}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Label className="text-muted-foreground font-mono">WALLET ADDRESS</Label>
          <p className="text-foreground font-mono text-sm break-all bg-background/30 p-2 rounded">
            {user?.address}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
