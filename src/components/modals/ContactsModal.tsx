import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { useContacts, Contact } from '../../hooks/useContacts';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Star, 
  StarOff, 
  Copy, 
  ExternalLink,
  Download,
  Upload,
  UserPlus
} from 'lucide-react';
import { Address, isAddress } from 'viem';

interface ContactsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectContact?: (contact: Contact) => void;
  selectMode?: boolean;
  multiSelect?: boolean;
}

export const ContactsModal: React.FC<ContactsModalProps> = ({ 
  open, 
  onOpenChange, 
  onSelectContact,
  selectMode = false,
  multiSelect = false
}) => {
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [newContact, setNewContact] = useState({
    name: '',
    address: '',
    note: '',
    tags: ''
  });

  const { toast } = useToast();
  const {
    contacts,
    isLoading,
    addContact,
    updateContact,
    deleteContact,
    searchContacts,
    getFavoriteContacts,
    getRecentContacts,
    addToFavorites,
    removeFromFavorites,
    exportContacts,
    importContacts
  } = useContacts();

  const filteredContacts = searchContacts(searchQuery);
  const favoriteContacts = getFavoriteContacts();
  const recentContacts = getRecentContacts();

  const handleAddContact = () => {
    if (!newContact.name.trim() || !newContact.address.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both name and address.',
        variant: 'destructive',
      });
      return;
    }

    if (!isAddress(newContact.address)) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Ethereum address.',
        variant: 'destructive',
      });
      return;
    }

    try {
      addContact({
        name: newContact.name.trim(),
        address: newContact.address.trim() as Address,
        note: newContact.note.trim() || undefined,
        tags: newContact.tags.trim() ? newContact.tags.split(',').map(t => t.trim()) : undefined
      });

      toast({
        title: 'Contact Added',
        description: `${newContact.name} has been added to your contacts.`,
      });

      setNewContact({ name: '', address: '', note: '', tags: '' });
      setCurrentView('list');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add contact. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditContact = () => {
    if (!editingContact || !newContact.name.trim() || !newContact.address.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both name and address.',
        variant: 'destructive',
      });
      return;
    }

    if (!isAddress(newContact.address)) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Ethereum address.',
        variant: 'destructive',
      });
      return;
    }

    try {
      updateContact(editingContact.id, {
        name: newContact.name.trim(),
        address: newContact.address.trim() as Address,
        note: newContact.note.trim() || undefined,
        tags: newContact.tags.trim() ? newContact.tags.split(',').map(t => t.trim()) : undefined
      });

      toast({
        title: 'Contact Updated',
        description: `${newContact.name} has been updated.`,
      });

      setEditingContact(null);
      setNewContact({ name: '', address: '', note: '', tags: '' });
      setCurrentView('list');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update contact. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteContact = (contact: Contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      deleteContact(contact.id);
      toast({
        title: 'Contact Deleted',
        description: `${contact.name} has been removed from your contacts.`,
      });
    }
  };

  const handleSelectContact = (contact: Contact) => {
    if (selectMode && onSelectContact) {
      if (multiSelect) {
        const newSelected = new Set(selectedContacts);
        if (newSelected.has(contact.id)) {
          newSelected.delete(contact.id);
        } else {
          newSelected.add(contact.id);
        }
        setSelectedContacts(newSelected);
      } else {
        onSelectContact(contact);
        onOpenChange(false);
      }
    }
  };

  const handleConfirmSelection = () => {
    if (multiSelect && onSelectContact) {
      const selected = contacts.filter(c => selectedContacts.has(c.id));
      selected.forEach(contact => onSelectContact(contact));
      onOpenChange(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: 'Address Copied',
      description: 'Address has been copied to clipboard.',
    });
  };

  const startEdit = (contact: Contact) => {
    setEditingContact(contact);
    setNewContact({
      name: contact.name,
      address: contact.address,
      note: contact.note || '',
      tags: contact.tags?.join(', ') || ''
    });
    setCurrentView('edit');
  };

  const handleExport = () => {
    const data = exportContacts();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jenga-contacts.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Contacts Exported',
      description: 'Your contacts have been exported successfully.',
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (importContacts(content)) {
          toast({
            title: 'Contacts Imported',
            description: 'Your contacts have been imported successfully.',
          });
        } else {
          toast({
            title: 'Import Failed',
            description: 'Failed to import contacts. Please check the file format.',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Loading contacts...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            {selectMode ? 'Select Contacts' : 'Manage Contacts'}
            {contacts.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({contacts.length} contact{contacts.length !== 1 ? 's' : ''})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {currentView === 'list' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Search and Actions */}
            <div className="space-y-4 mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => setCurrentView('add')}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export
                </Button>
                <label className="cursor-pointer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    asChild
                  >
                    <span>
                      <Upload className="w-3 h-3" />
                      Import
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                {multiSelect && selectedContacts.size > 0 && (
                  <Button
                    onClick={handleConfirmSelection}
                    className="flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    Add Selected ({selectedContacts.size})
                  </Button>
                )}
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchQuery ? 'No contacts found' : 'No contacts yet'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Add your first contact to get started'
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setCurrentView('add')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Contact
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Favorites */}
                  {!searchQuery && favoriteContacts.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        Favorites
                      </h4>
                      <div className="space-y-1">
                        {favoriteContacts.map((contact) => (
                          <ContactItem
                            key={contact.id}
                            contact={contact}
                            onSelect={handleSelectContact}
                            onEdit={startEdit}
                            onDelete={handleDeleteContact}
                            onToggleFavorite={(id) => removeFromFavorites(id)}
                            onCopyAddress={copyAddress}
                            selectMode={selectMode}
                            isSelected={selectedContacts.has(contact.id)}
                            isFavorite={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent */}
                  {!searchQuery && recentContacts.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recent
                      </h4>
                      <div className="space-y-1">
                        {recentContacts.filter(c => !favoriteContacts.includes(c)).map((contact) => (
                          <ContactItem
                            key={contact.id}
                            contact={contact}
                            onSelect={handleSelectContact}
                            onEdit={startEdit}
                            onDelete={handleDeleteContact}
                            onToggleFavorite={(id) => addToFavorites(id)}
                            onCopyAddress={copyAddress}
                            selectMode={selectMode}
                            isSelected={selectedContacts.has(contact.id)}
                            isFavorite={false}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Contacts */}
                  <div>
                    {!searchQuery && (favoriteContacts.length > 0 || recentContacts.length > 0) && (
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        All Contacts
                      </h4>
                    )}
                    <div className="space-y-1">
                      {filteredContacts
                        .filter(c => searchQuery || (!favoriteContacts.includes(c) && !recentContacts.includes(c)))
                        .map((contact) => (
                          <ContactItem
                            key={contact.id}
                            contact={contact}
                            onSelect={handleSelectContact}
                            onEdit={startEdit}
                            onDelete={handleDeleteContact}
                            onToggleFavorite={(id) => 
                              contact.tags?.includes('favorite') 
                                ? removeFromFavorites(id)
                                : addToFavorites(id)
                            }
                            onCopyAddress={copyAddress}
                            selectMode={selectMode}
                            isSelected={selectedContacts.has(contact.id)}
                            isFavorite={contact.tags?.includes('favorite') || false}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {(currentView === 'add' || currentView === 'edit') && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentView('list');
                  setEditingContact(null);
                  setNewContact({ name: '', address: '', note: '', tags: '' });
                }}
              >
                ← Back
              </Button>
              <h3 className="font-medium">
                {currentView === 'add' ? 'Add New Contact' : 'Edit Contact'}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter contact name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={newContact.address}
                  onChange={(e) => setNewContact(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="0x..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={newContact.note}
                  onChange={(e) => setNewContact(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Optional note about this contact"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={newContact.tags}
                  onChange={(e) => setNewContact(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="friend, work, family (comma separated)"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={currentView === 'add' ? handleAddContact : handleEditContact}
                  className="flex-1"
                >
                  {currentView === 'add' ? 'Add Contact' : 'Update Contact'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentView('list');
                    setEditingContact(null);
                    setNewContact({ name: '', address: '', note: '', tags: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface ContactItemProps {
  contact: Contact;
  onSelect: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onToggleFavorite: (id: string) => void;
  onCopyAddress: (address: string) => void;
  selectMode: boolean;
  isSelected: boolean;
  isFavorite: boolean;
}

const ContactItem: React.FC<ContactItemProps> = ({
  contact,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopyAddress,
  selectMode,
  isSelected,
  isFavorite
}) => {
  return (
    <div 
      className={`p-3 rounded-lg border transition-colors ${
        selectMode 
          ? `cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
              isSelected ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : ''
            }`
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
      onClick={selectMode ? () => onSelect(contact) : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {contact.name}
            </h4>
            {isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
            {contact.tags?.filter(tag => tag !== 'favorite').map(tag => (
              <span 
                key={tag}
                className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono truncate">
            {contact.address}
          </p>
          {contact.note && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
              {contact.note}
            </p>
          )}
        </div>

        {!selectMode && (
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(contact.id)}
              className="p-1 h-auto"
            >
              {isFavorite ? (
                <StarOff className="w-3 h-3" />
              ) : (
                <Star className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopyAddress(contact.address)}
              className="p-1 h-auto"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(contact)}
              className="p-1 h-auto"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(contact)}
              className="p-1 h-auto text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
