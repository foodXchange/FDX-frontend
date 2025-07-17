import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Collaboration, Message, Document, Deliverable } from '../types';
import { expertApi } from '../services/api';

export const useCollaboration = (collaborationId?: string) => {
  const [collaboration, setCollaboration] = useState<Collaboration | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesPage = useRef(1);

  const loadCollaboration = useCallback(async () => {
    if (!collaborationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await expertApi.getCollaborationById(collaborationId);
      setCollaboration(data);
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collaboration');
    } finally {
      setLoading(false);
    }
  }, [collaborationId]);

  const loadMessages = useCallback(async (reset = false) => {
    if (!collaborationId || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const page = reset ? 1 : messagesPage.current;
      const result = await expertApi.getMessages(collaborationId, page);
      
      if (reset) {
        setMessages(result.messages);
        messagesPage.current = 1;
      } else {
        setMessages(prev => [...prev, ...result.messages]);
      }
      
      setHasMoreMessages(result.hasMore);
      messagesPage.current = page + 1;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [collaborationId, loading]);

  const sendMessage = useCallback(async (content: string, attachments?: string[]) => {
    if (!collaborationId) return;
    
    try {
      const newMessage = await expertApi.sendMessage(collaborationId, content, attachments);
      setMessages(prev => [newMessage, ...prev]);
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  }, [collaborationId]);

  const uploadDocument = useCallback(async (file: File): Promise<Document | null> => {
    if (!collaborationId) return null;
    
    try {
      const document = await expertApi.uploadDocument(collaborationId, file);
      setDocuments(prev => [...prev, document]);
      return document;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
      return null;
    }
  }, [collaborationId]);

  const deleteDocument = useCallback(async (documentId: string) => {
    if (!collaborationId) return;
    
    try {
      await expertApi.deleteDocument(collaborationId, documentId);
      setDocuments(prev => prev.filter(d => d.id !== documentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      throw err;
    }
  }, [collaborationId]);

  const updateDeliverable = useCallback(async (
    deliverableId: string, 
    updates: Partial<Deliverable>
  ) => {
    if (!collaboration) return;
    
    try {
      const updatedDeliverables = collaboration.deliverables.map(d =>
        d.id === deliverableId ? { ...d, ...updates } : d
      );
      
      const updated = await expertApi.updateCollaboration(collaboration.id, {
        deliverables: updatedDeliverables,
      });
      
      setCollaboration(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deliverable');
      throw err;
    }
  }, [collaboration]);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    if (!collaborationId) return;
    
    try {
      await expertApi.markMessageAsRead(collaborationId, messageId);
      setMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, isRead: true } : m)
      );
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  }, [collaborationId]);

  useEffect(() => {
    if (collaborationId) {
      loadCollaboration();
      loadMessages(true);
    }
  }, [collaborationId, loadCollaboration, loadMessages]);

  return {
    collaboration,
    messages,
    documents,
    loading,
    error,
    hasMoreMessages,
    loadCollaboration,
    loadMessages,
    sendMessage,
    uploadDocument,
    deleteDocument,
    updateDeliverable,
    markMessageAsRead,
    refresh: () => {
      loadCollaboration();
      loadMessages(true);
    },
  };
};