
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Send, Edit, Trash2, Zap, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingModal } from "@/components/ui/loading-modal";

interface Contact {
  id: string;
  name: string;
  address: string;
  notes?: string;
  network?: string;
}

const quickSendNetworks = [
  { id: "bitcoin", name: "Bitcoin", icon: "₿", color: "bg-orange-500" },
  { id: "lightning", name: "Lightning", icon: "⚡", color: "bg-yellow-500" },
  { id: "liquid", name: "Liquid", icon: "🌊", color: "bg-blue-500" },
  { id: "stacks", name: "Stacks", icon: "📚", color: "bg-purple-500" }
];

export const ContactsSection = () => {
  const { toast } = useToast();
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Alice",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      notes: "Trading partner",
      network: "bitcoin"
    },
    {
      id: "2", 
      name: "Bob's Chama",
      address: "bc1q9k8f2h5g3j4l6m7n8p9r0s1t2u3v4w5x6y7z8a9",
      notes: "Savings circle",
      network: "lightning"
    }
  ]);
  const [newContact, setNewContact] = useState({
    name: "",
    address: "",
    notes: "",
    network: "bitcoin"
  });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.address) return;
    
    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact
    };
    
    setContacts([...contacts, contact]);
    setNewContact({ name: "", address: "", notes: "", network: "bitcoin" });
    setShowAddContact(false);
    
    toast({
      title: "✅ Contact Added",
      description: `${newContact.name} has been added to your contacts`,
    });
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setNewContact({
      name: contact.name,
      address: contact.address,
      notes: contact.notes || "",
      network: contact.network || "bitcoin"
    });
  };

  const handleUpdateContact = () => {
    if (!editingContact || !newContact.name || !newContact.address) return;
    
    setContacts(contacts.map(c => 
      c.id === editingContact.id 
        ? { ...c, ...newContact }
        : c
    ));
    
    setEditingContact(null);
    setNewContact({ name: "", address: "", notes: "", network: "bitcoin" });
    
    toast({
      title: "✅ Contact Updated",
      description: `${newContact.name} has been updated`,
    });
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
    toast({
      title: "🗑️ Contact Deleted",
      description: "Contact has been removed from your list",
    });
  };

  const handleQuickSend = async (contact: Contact) => {
    setIsLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    
    toast({
      title: "⚡ Quick Send Complete",
      description: `Sent to ${contact.name} via ${contact.network}`,
    });
  };

  const getNetworkInfo = (networkId: string) => {
    return quickSendNetworks.find(n => n.id === networkId) || quickSendNetworks[0];
  };

  return (
    <>
      <div className="space-y-6">
        {/* Quick Send Networks */}
        <Card className="bg-card cyber-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground font-mono">
              <Zap className="w-5 h-5 text-yellow-400" />
              Quick Send Networks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickSendNetworks.map((network) => (
                <div
                  key={network.id}
                  className="p-4 rounded-lg border border-border bg-background/30 text-center hover:bg-background/50 transition-colors cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-full ${network.color} flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-2xl">{network.icon}</span>
                  </div>
                  <p className="text-sm font-mono text-foreground">{network.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <Card className="bg-card cyber-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-foreground font-mono">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                My Contacts
              </div>
              <Button
                size="sm"
                onClick={() => setShowAddContact(true)}
                className="cyber-button bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                ADD CONTACT
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-mono">No contacts added yet</p>
                <Button
                  onClick={() => setShowAddContact(true)}
                  className="mt-4 cyber-button"
                >
                  ADD YOUR FIRST CONTACT
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact) => {
                  const networkInfo = getNetworkInfo(contact.network || "bitcoin");
                  return (
                    <div key={contact.id} className="p-4 rounded-lg border border-border bg-background/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground font-mono">{contact.name}</h3>
                          <Badge variant="outline" className={`${networkInfo.color}/20 text-white border-${networkInfo.color}/50 font-mono text-xs`}>
                            {networkInfo.icon} {networkInfo.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleQuickSend(contact)}
                            className="cyber-button bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            QUICK SEND
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditContact(contact)}
                            className="cyber-button"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteContact(contact.id)}
                            className="cyber-button text-red-400 border-red-500/30 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-mono">
                          {contact.address.slice(0, 16)}...{contact.address.slice(-16)}
                        </p>
                        {contact.notes && (
                          <p className="text-xs text-blue-400 font-mono">{contact.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={showAddContact || !!editingContact} onOpenChange={() => {
        setShowAddContact(false);
        setEditingContact(null);
        setNewContact({ name: "", address: "", notes: "", network: "bitcoin" });
      }}>
        <DialogContent className="bg-card cyber-border neon-glow max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-mono glitch-text">
              <Plus className="w-5 h-5 text-blue-400" />
              {editingContact ? "Edit Contact" : "Add New Contact"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="contactName" className="text-muted-foreground font-mono">NAME</Label>
              <Input
                id="contactName"
                placeholder="Contact name"
                value={newContact.name}
                onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                className="bg-background/50 border-blue-500/30 text-foreground font-mono cyber-border"
              />
            </div>

            <div>
              <Label htmlFor="network" className="text-muted-foreground font-mono">NETWORK</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {quickSendNetworks.map((network) => (
                  <Button
                    key={network.id}
                    size="sm"
                    variant={newContact.network === network.id ? "default" : "outline"}
                    onClick={() => setNewContact({...newContact, network: network.id})}
                    className={`cyber-button ${
                      newContact.network === network.id ? `${network.color} text-white` : ''
                    }`}
                  >
                    {network.icon} {network.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="contactAddress" className="text-muted-foreground font-mono">ADDRESS</Label>
              <Input
                id="contactAddress"
                placeholder="bc1q..."
                value={newContact.address}
                onChange={(e) => setNewContact({...newContact, address: e.target.value})}
                className="bg-background/50 border-blue-500/30 text-foreground font-mono cyber-border"
              />
            </div>
            
            <div>
              <Label htmlFor="contactNotes" className="text-muted-foreground font-mono">NOTES (OPTIONAL)</Label>
              <Input
                id="contactNotes"
                placeholder="Add a note..."
                value={newContact.notes}
                onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                className="bg-background/50 border-blue-500/30 text-foreground font-mono cyber-border"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => {
                setShowAddContact(false);
                setEditingContact(null);
                setNewContact({ name: "", address: "", notes: "", network: "bitcoin" });
              }} className="flex-1 cyber-button">
                CANCEL
              </Button>
              <Button 
                onClick={editingContact ? handleUpdateContact : handleAddContact}
                disabled={!newContact.name || !newContact.address}
                className="flex-1 cyber-button bg-blue-500 hover:bg-blue-600 text-white"
              >
                {editingContact ? "UPDATE" : "ADD"} CONTACT
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LoadingModal
        isOpen={isLoading}
        title="Processing Transaction..."
        description="Sending via quick network"
      />
    </>
  );
};
