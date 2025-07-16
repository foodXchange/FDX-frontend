import { createContext, useContext, useState, useCallback, ReactNode, FC, useEffect } from 'react';
import { Collaboration, Message, Document, Deliverable, CollaborationStatus } from '../types';

interface CollaborationContextValue {
  // State
  collaborations: Collaboration[];
  activeCollaboration: Collaboration | null;
  messages: Message[];
  documents: Document[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadCollaborations: () => Promise<void>;
  getCollaboration: (collaborationId: string) => Promise<Collaboration | null>;
  createCollaboration: (data: Partial<Collaboration>) => Promise<Collaboration | null>;
  updateCollaboration: (id: string, updates: Partial<Collaboration>) => Promise<void>;
  setActiveCollaboration: (collaboration: Collaboration | null) => void;
  
  // Messaging
  sendMessage: (content: string, attachments?: Document[]) => Promise<void>;
  loadMessages: (collaborationId: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  
  // Documents
  uploadDocument: (file: File) => Promise<Document | null>;
  deleteDocument: (documentId: string) => Promise<void>;
  
  // Deliverables
  updateDeliverable: (deliverableId: string, updates: Partial<Deliverable>) => Promise<void>;
  submitDeliverable: (deliverableId: string, files: Document[]) => Promise<void>;
}

const CollaborationContext = createContext<CollaborationContextValue | undefined>(undefined);

export const useCollaborationContext = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaborationContext must be used within a CollaborationProvider');
  }
  return context;
};

interface CollaborationProviderProps {
  children: ReactNode;
}

export const CollaborationProvider: FC<CollaborationProviderProps> = ({ children }) => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [activeCollaboration, setActiveCollaboration] = useState<Collaboration | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCollaborations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      setCollaborations([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collaborations');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCollaboration = useCallback(async (collaborationId: string): Promise<Collaboration | null> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      const cached = collaborations.find(c => c.id === collaborationId);
      if (cached) return cached;
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collaboration');
      return null;
    } finally {
      setLoading(false);
    }
  }, [collaborations]);

  const createCollaboration = useCallback(async (data: Partial<Collaboration>): Promise<Collaboration | null> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      const newCollaboration: Collaboration = {
        id: Date.now().toString(),
        expertId: data.expertId || '',
        clientId: data.clientId || '',
        serviceId: data.serviceId || '',
        projectName: data.projectName || '',
        description: data.description || '',
        status: 'draft',
        startDate: new Date().toISOString(),
        deliverables: [],
        messages: [],
        documents: [],
        milestones: [],
        totalAmount: 0,
        paidAmount: 0,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      setCollaborations(prev => [...prev, newCollaboration]);
      return newCollaboration;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collaboration');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCollaboration = useCallback(async (id: string, updates: Partial<Collaboration>) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      setCollaborations(prev => 
        prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
      );
      if (activeCollaboration?.id === id) {
        setActiveCollaboration(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update collaboration');
    } finally {
      setLoading(false);
    }
  }, [activeCollaboration]);

  const sendMessage = useCallback(async (content: string, attachments?: Document[]) => {
    if (!activeCollaboration) return;
    
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: 'current-user', // TODO: Get from auth context
        content,
        attachments,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }, [activeCollaboration]);

  const loadMessages = useCallback(async (collaborationId: string) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      // TODO: Replace with actual API call
      setMessages(prev => 
        prev.map(m => m.id === messageId ? { ...m, isRead: true } : m)
      );
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  }, []);

  const uploadDocument = useCallback(async (file: File): Promise<Document | null> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual file upload
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
        uploadedBy: 'current-user',
        uploadedAt: new Date().toISOString(),
      };
      setDocuments(prev => [...prev, newDoc]);
      return newDoc;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (documentId: string) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      setDocuments(prev => prev.filter(d => d.id !== documentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDeliverable = useCallback(async (deliverableId: string, updates: Partial<Deliverable>) => {
    if (!activeCollaboration) return;
    
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      const updatedDeliverables = activeCollaboration.deliverables.map(d => 
        d.id === deliverableId ? { ...d, ...updates } : d
      );
      await updateCollaboration(activeCollaboration.id, { deliverables: updatedDeliverables });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deliverable');
    } finally {
      setLoading(false);
    }
  }, [activeCollaboration, updateCollaboration]);

  const submitDeliverable = useCallback(async (deliverableId: string, files: Document[]) => {
    await updateDeliverable(deliverableId, {
      status: 'submitted',
      submittedDate: new Date().toISOString(),
      files,
    });
  }, [updateDeliverable]);

  // Load messages when active collaboration changes
  useEffect(() => {
    if (activeCollaboration) {
      loadMessages(activeCollaboration.id);
    }
  }, [activeCollaboration, loadMessages]);

  const value: CollaborationContextValue = {
    collaborations,
    activeCollaboration,
    messages,
    documents,
    loading,
    error,
    loadCollaborations,
    getCollaboration,
    createCollaboration,
    updateCollaboration,
    setActiveCollaboration,
    sendMessage,
    loadMessages,
    markMessageAsRead,
    uploadDocument,
    deleteDocument,
    updateDeliverable,
    submitDeliverable,
  };

  return <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>;
};