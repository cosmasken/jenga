import { useState, useEffect } from 'react';
import { Address } from 'viem';

export interface Contact {
  id: string;
  name: string;
  address: Address;
  avatar?: string;
  note?: string;
  addedAt: number;
  lastInteraction?: number;
  tags?: string[];
}

const CONTACTS_STORAGE_KEY = 'jenga_contacts';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load contacts from localStorage on mount
  useEffect(() => {
    try {
      const storedContacts = localStorage.getItem(CONTACTS_STORAGE_KEY);
      if (storedContacts) {
        const parsedContacts = JSON.parse(storedContacts);
        setContacts(parsedContacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save contacts to localStorage whenever contacts change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
      } catch (error) {
        console.error('Error saving contacts:', error);
      }
    }
  }, [contacts, isLoading]);

  const addContact = (contactData: Omit<Contact, 'id' | 'addedAt'>) => {
    const newContact: Contact = {
      ...contactData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      addedAt: Date.now(),
    };

    setContacts(prev => [...prev, newContact]);
    return newContact;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.id === id 
          ? { ...contact, ...updates }
          : contact
      )
    );
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const getContactByAddress = (address: Address): Contact | undefined => {
    return contacts.find(contact => 
      contact.address.toLowerCase() === address.toLowerCase()
    );
  };

  const searchContacts = (query: string): Contact[] => {
    if (!query.trim()) return contacts;
    
    const lowercaseQuery = query.toLowerCase();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(lowercaseQuery) ||
      contact.address.toLowerCase().includes(lowercaseQuery) ||
      contact.note?.toLowerCase().includes(lowercaseQuery) ||
      contact.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const updateLastInteraction = (address: Address) => {
    const contact = getContactByAddress(address);
    if (contact) {
      updateContact(contact.id, { lastInteraction: Date.now() });
    }
  };

  const getRecentContacts = (limit: number = 5): Contact[] => {
    return contacts
      .filter(contact => contact.lastInteraction)
      .sort((a, b) => (b.lastInteraction || 0) - (a.lastInteraction || 0))
      .slice(0, limit);
  };

  const getFavoriteContacts = (): Contact[] => {
    return contacts.filter(contact => 
      contact.tags?.includes('favorite')
    );
  };

  const addToFavorites = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
      const currentTags = contact.tags || [];
      if (!currentTags.includes('favorite')) {
        updateContact(id, { 
          tags: [...currentTags, 'favorite'] 
        });
      }
    }
  };

  const removeFromFavorites = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    if (contact && contact.tags) {
      updateContact(id, { 
        tags: contact.tags.filter(tag => tag !== 'favorite') 
      });
    }
  };

  const importFromTransaction = (address: Address, name?: string) => {
    const existingContact = getContactByAddress(address);
    if (!existingContact) {
      addContact({
        name: name || `User ${address.slice(0, 6)}...${address.slice(-4)}`,
        address,
        note: 'Added from transaction',
        tags: ['auto-imported']
      });
    } else {
      updateLastInteraction(address);
    }
  };

  const exportContacts = (): string => {
    return JSON.stringify(contacts, null, 2);
  };

  const importContacts = (jsonData: string): boolean => {
    try {
      const importedContacts = JSON.parse(jsonData);
      if (Array.isArray(importedContacts)) {
        // Validate structure
        const validContacts = importedContacts.filter(contact => 
          contact.name && contact.address && contact.id
        );
        
        // Merge with existing contacts (avoid duplicates)
        const existingAddresses = new Set(contacts.map(c => c.address.toLowerCase()));
        const newContacts = validContacts.filter(contact => 
          !existingAddresses.has(contact.address.toLowerCase())
        );
        
        setContacts(prev => [...prev, ...newContacts]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing contacts:', error);
      return false;
    }
  };

  return {
    contacts,
    isLoading,
    addContact,
    updateContact,
    deleteContact,
    getContactByAddress,
    searchContacts,
    updateLastInteraction,
    getRecentContacts,
    getFavoriteContacts,
    addToFavorites,
    removeFromFavorites,
    importFromTransaction,
    exportContacts,
    importContacts,
  };
}
