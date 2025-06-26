
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Plus, Send, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  name: string;
  address: string;
  notes?: string;
}

export const ContactsSection = () => {
  const { toast } = useToast();
  const [showAddContact, setShowAddContact] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Alice",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      notes: "Trading partner"
    },
    {
      id: "2", 
      name: "Bob's Chama",
      address: "bc1q9k8f2h5g3j4l6m7n8p9r0s1t2u3v4w5x6y7z8a9",
      notes: "Savings circle"
    }
  ]);
  const [newContact, setNewContact] = useState({
    name: "",
    address: "",
    notes: ""
  });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.address) return;
    
    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact
    };
    
    setContacts([...contacts, contact]);
    setNewContact({ name: "", address: "", notes: "" });
    setShowAddContact(false);
    
    toast({
      title: "✅ Contact Added",
      description: `${newContact.name} has been added to your contacts`,
    });
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
    toast({
      title: "🗑️ Contact Deleted",
      description: "Contact has been removed from your list",
    });
  };

  return (
    <>
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
              {contacts.map((contact) => (
                <div key={contact.id} className="p-4 rounded-lg border border-border bg-background/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground font-mono">{contact.name}</h3>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="cyber-button">
                        <Send className="w-3 h-3 mr-1" />
                        SEND
                      </Button>
                      <Button size="sm" variant="outline" className="cyber-button">
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="bg-card cyber-border neon-glow max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-mono glitch-text">
              <Plus className="w-5 h-5 text-blue-400" />
              Add New Contact
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
              <Label htmlFor="contactAddress" className="text-muted-foreground font-mono">BITCOIN ADDRESS</Label>
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
              <Button variant="outline" onClick={() => setShowAddContact(false)} className="flex-1 cyber-button">
                CANCEL
              </Button>
              <Button 
                onClick={handleAddContact}
                disabled={!newContact.name || !newContact.address}
                className="flex-1 cyber-button bg-blue-500 hover:bg-blue-600 text-white"
              >
                ADD CONTACT
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
