import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Mail } from 'lucide-react';
import { useInviteHandler } from '@/hooks/useInviteHandler';

interface InviteModalProps {
  chamaId?: string;
  chamaAddress?: string; // Alternative prop name for compatibility
  chamaName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ chamaId, chamaAddress, chamaName, isOpen, onClose }: InviteModalProps) {
  const [emails, setEmails] = useState<string[]>(['']);
  const actualChamaId = chamaId || chamaAddress || '';
  const { sendInvites, isSendingInvites } = useInviteHandler(actualChamaId);

  if (!isOpen) return null;

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const removeEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    const validEmails = emails.filter(email => email.trim() && email.includes('@'));
    if (validEmails.length === 0) return;
    
    sendInvites(validEmails);
    setEmails(['']);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {chamaName ? `Invite to ${chamaName}` : 'Send Invites'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {emails.map((email, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => updateEmail(index, e.target.value)}
              />
              {emails.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeEmail(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button variant="outline" onClick={addEmailField} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Email
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={isSendingInvites}
              className="flex-1"
            >
              {isSendingInvites ? 'Sending...' : 'Send Invites'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
