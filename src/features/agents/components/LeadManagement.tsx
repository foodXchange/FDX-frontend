import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '@/store/useAgentStore';
import { Lead } from '../types';
import { LeadCard } from './LeadCard';
import { AgentRFQList } from './AgentRFQList';
import { 
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

type ViewMode = 'kanban' | 'list';
type LeadStatus = Lead['status'];

const statusColumns: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'claimed', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { status: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { status: 'negotiating', label: 'Negotiating', color: 'bg-purple-100 text-purple-800' },
  { status: 'won', label: 'Won', color: 'bg-green-100 text-green-800' },
  { status: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' }
];

export const LeadManagement: React.FC = () => {
  const { availableLeads, myLeads, updateLeadStatus } = useAgentStore();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  // Filter leads by status for Kanban columns
  const getLeadsByStatus = (status: LeadStatus) => {
    return myLeads.filter(lead => lead.status === status);
  };

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    if (draggedLead && draggedLead.status !== newStatus) {
      updateLeadStatus(draggedLead.id, newStatus);
    }
    setDraggedLead(null);
  };

  const handleQuickAction = (leadId: string, action: 'whatsapp' | 'call' | 'email') => {
    // Handle quick actions
    console.log(`${action} action for lead ${leadId}`);
    // In real implementation, this would open WhatsApp, initiate call, or compose email
  };

  const renderKanbanView = () => (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statusColumns.map(column => (
        <div 
          key={column.status}
          className="flex-shrink-0 w-80"
        >
          {/* Column Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{column.label}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${column.color}`}>
                {getLeadsByStatus(column.status).length}
              </span>
            </div>
          </div>

          {/* Column Content */}
          <div
            className="space-y-3 min-h-[400px] bg-gray-50 rounded-lg p-3"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <AnimatePresence>
              {getLeadsByStatus(column.status).map(lead => (
                <motion.div
                  key={lead.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div 
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead)}
                  >
                    <h4 className="font-medium text-gray-900 mb-1">{lead.rfqTitle}</h4>
                    <p className="text-sm text-gray-600 mb-2">{lead.buyerName}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">{lead.buyerLocation}</span>
                      <span className="text-sm font-semibold text-green-600">
                        ${lead.estimatedCommission}
                      </span>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleQuickAction(lead.id, 'whatsapp')}
                        className="flex-1 p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="WhatsApp"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => handleQuickAction(lead.id, 'call')}
                        className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Call"
                      >
                        <PhoneIcon className="h-4 w-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => handleQuickAction(lead.id, 'email')}
                        className="flex-1 p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        title="Email"
                      >
                        <EnvelopeIcon className="h-4 w-4 mx-auto" />
                      </button>
                    </div>

                    {/* Progress indicator */}
                    {column.status === 'negotiating' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>60%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    )}

                    {/* Notes preview */}
                    {lead.notes && (
                      <p className="mt-2 text-xs text-gray-500 italic line-clamp-2">
                        "{lead.notes}"
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty state */}
            {getLeadsByStatus(column.status).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No leads in {column.label.toLowerCase()}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {myLeads.map(lead => (
        <LeadCard
          key={lead.id}
          lead={lead}
          variant="claimed"
          onView={(id) => console.log('View lead:', id)}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'available' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Available Leads ({availableLeads.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'active' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Active Leads ({myLeads.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'available' ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-600">
              Browse and claim leads that match your expertise
            </p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Set Preferences →
            </button>
          </div>
          
          {/* Mock RFQ data for available leads */}
          <AgentRFQList
            rfqs={availableLeads.map(lead => ({
              id: lead.id,
              title: lead.rfqTitle,
              description: `Looking for suppliers of ${lead.category} products`,
              category: lead.category,
              buyerName: lead.buyerName,
              buyerLocation: lead.buyerLocation,
              estimatedValue: lead.estimatedValue,
              createdAt: new Date(),
              expiresAt: lead.expiresAt,
              status: 'open'
            }))}
          />
        </div>
      ) : (
        <div>
          {/* View Mode Toggle */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-600">
              Manage your active leads through the sales pipeline
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'kanban' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Kanban
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Active Leads View */}
          {viewMode === 'kanban' ? renderKanbanView() : renderListView()}
        </div>
      )}
    </div>
  );
};