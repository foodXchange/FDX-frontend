import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CalendarDaysIcon,
  MapPinIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ChatBubbleLeftEllipsisIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { rfqService } from '../../services/rfqService';
import { RFQ, Proposal } from '../../shared/types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { formatDistanceToNow, format } from 'date-fns';

interface RFQDetailProps {
  userRole?: 'buyer' | 'supplier';
}

const proposalStatuses = {
  draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
  submitted: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
  under_review: { color: 'bg-yellow-100 text-yellow-800', label: 'Under Review' },
  accepted: { color: 'bg-green-100 text-green-800', label: 'Accepted' },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  withdrawn: { color: 'bg-gray-100 text-gray-800', label: 'Withdrawn' },
};

// const timelineSteps = [
//   { id: 1, title: 'RFQ Published', description: 'Available for suppliers' },
//   { id: 2, title: 'Proposals Received', description: 'Suppliers submit proposals' },
//   { id: 3, title: 'Evaluation', description: 'Reviewing submissions' },
//   { id: 4, title: 'Award', description: 'Select winning proposal' },
//   { id: 5, title: 'Contract', description: 'Finalize agreement' },
// ];

export const RFQDetail: React.FC<RFQDetailProps> = ({ userRole = 'buyer' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'messages'>('overview');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [, setShowProposalForm] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchRFQDetails();
    }
  }, [id]);

  const fetchRFQDetails = async () => {
    try {
      setLoading(true);
      const [rfqData, proposalsData, messagesData] = await Promise.all([
        rfqService.getRFQById(id!),
        rfqService.getProposals(id!),
        rfqService.getMessages(id!)
      ]);
      
      setRfq(rfqData);
      setProposals(proposalsData);
      setMessages(messagesData);
    } catch (err) {
      setError('Failed to load RFQ details');
      console.error('RFQ detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRFQ = async () => {
    if (window.confirm('Are you sure you want to delete this RFQ?')) {
      try {
        await rfqService.deleteRFQ(id!);
        navigate('/rfq');
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const handleProposalAction = async (proposalId: string, action: string) => {
    try {
      await rfqService.updateProposalStatus(proposalId, action);
      fetchRFQDetails(); // Refresh data
    } catch (err) {
      console.error('Proposal action error:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await rfqService.sendMessage(id!, {
        message: newMessage,
        recipient: typeof selectedProposal?.supplier === 'string' ? selectedProposal.supplier : selectedProposal?.supplier?.id || '',
      });
      setNewMessage('');
      fetchRFQDetails(); // Refresh messages
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  // const getTimelineCurrentStep = () => {
  //   if (!rfq) return 1;
  //   
  //   switch (rfq.status) {
  //     case 'active': return proposals.length > 0 ? 2 : 1;
  //     case 'closed': return 3;
  //     case 'awarded': return 4;
  //     default: return 1;
  //   }
  // };

  const getUrgencyLevel = () => {
    if (!rfq) return 'normal';
    
    const now = new Date();
    const deadline = new Date(rfq.submissionDeadline);
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursLeft < 0) return 'expired';
    if (hoursLeft < 24) return 'urgent';
    if (hoursLeft < 72) return 'warning';
    return 'normal';
  };

  const getUrgencyDisplay = (urgency: string) => {
    switch (urgency) {
      case 'expired':
        return { text: 'Expired', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
      case 'urgent':
        return { text: 'Urgent', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
      case 'warning':
        return { text: 'Soon', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <SkeletonLoader width="100%" height="400px" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonLoader width="100%" height="300px" />
          </div>
          <div>
            <SkeletonLoader width="100%" height="300px" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
            <span className="text-red-700">{error || 'RFQ not found'}</span>
          </div>
        </div>
      </div>
    );
  }

  const urgency = getUrgencyLevel();
  const urgencyDisplay = getUrgencyDisplay(urgency);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/rfq')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{rfq.title}</h1>
            <div className="flex items-center space-x-3 mt-2">
              <StatusBadge status={rfq.status} type="rfq" />
              {urgencyDisplay && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${urgencyDisplay.color} ${urgencyDisplay.bg} ${urgencyDisplay.border} border`}>
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {urgencyDisplay.text}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {userRole === 'buyer' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(`/rfq/${id}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDeleteRFQ}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">RFQ Progress</h2>
        {/* <ProgressTracker 
          steps={timelineSteps} 
          currentStep={getTimelineCurrentStep()} 
        /> */}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: DocumentTextIcon },
            { id: 'proposals', label: `Proposals (${proposals.length})`, icon: UserGroupIcon },
            { id: 'messages', label: `Messages (${messages.length})`, icon: ChatBubbleLeftEllipsisIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">RFQ Details</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                      <p className="text-gray-600">{rfq.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Quantity & Unit</h4>
                        <p className="text-gray-600">{rfq.quantity} {rfq.unit}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Category</h4>
                        <p className="text-gray-600">{rfq.category}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Delivery Date</h4>
                        <div className="flex items-center text-gray-600">
                          <CalendarDaysIcon className="h-4 w-4 mr-2" />
                          {format(new Date(rfq.deliveryDate), 'PPP')}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Submission Deadline</h4>
                        <div className="flex items-center text-gray-600">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {format(new Date(rfq.submissionDeadline), 'PPP p')}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Delivery Location</h4>
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span>
                          {typeof rfq.deliveryLocation === 'string' 
                            ? rfq.deliveryLocation 
                            : `${rfq.deliveryLocation.street}, ${rfq.deliveryLocation.city}, ${rfq.deliveryLocation.country}`
                          }
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Product Specifications</h4>
                      <div className="space-y-3">
                        {rfq.lineItems.map((item, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-gray-900 mb-2">{item.productName}</div>
                            <div className="text-sm text-gray-600">
                              Quantity: {item.quantity} {item.unit}
                            </div>
                            {item.description && (
                              <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {rfq.requirements?.certifications && rfq.requirements.certifications.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Required Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {rfq.requirements.certifications?.map((cert) => (
                            <span key={cert} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}


                    {rfq.requirements?.additionalRequirements && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Additional Requirements</h4>
                        <p className="text-gray-600">{rfq.requirements.additionalRequirements}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'proposals' && (
                <div className="space-y-4">
                  {userRole === 'supplier' && rfq.status === 'active' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-orange-800">Submit Your Proposal</h3>
                          <p className="text-sm text-orange-700">
                            Deadline: {format(new Date(rfq.submissionDeadline), 'PPP p')}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowProposalForm(true)}
                          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Submit Proposal
                        </button>
                      </div>
                    </div>
                  )}

                  {proposals.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                      <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Yet</h3>
                      <p className="text-gray-500">
                        {userRole === 'buyer' 
                          ? 'Suppliers will submit their proposals here'
                          : 'Be the first to submit a proposal for this RFQ'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {proposals.map((proposal) => (
                        <motion.div
                          key={proposal.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    {typeof proposal.supplier === 'string' ? proposal.supplier.charAt(0) : proposal.supplier.name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {typeof proposal.supplier === 'string' ? proposal.supplier : proposal.supplier.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  Submitted {formatDistanceToNow(new Date(proposal.createdAt))} ago
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${proposalStatuses[proposal.status].color}`}>
                                {proposalStatuses[proposal.status].label}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-sm text-gray-500 mb-1">Price</div>
                              <div className="text-lg font-semibold text-green-600">${proposal.totalPrice}</div>
                              <div className="text-xs text-gray-500">{proposal.currency}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-sm text-gray-500 mb-1">Delivery</div>
                              <div className="text-sm font-medium text-gray-900">
                                {proposal.deliveryTerms}
                              </div>
                              <div className="text-xs text-gray-500">
                                Valid until {format(new Date(proposal.validUntil), 'MMM dd')}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-sm text-gray-500 mb-1">Terms</div>
                              <div className="text-sm font-medium text-gray-900">
                                {proposal.paymentTerms}
                              </div>
                            </div>
                          </div>

                          {proposal.notes && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-700 mb-2">Notes</h5>
                              <p className="text-sm text-gray-600">{proposal.notes}</p>
                            </div>
                          )}

                          {proposal.attachments && proposal.attachments.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-700 mb-2">Attachments</h5>
                              <div className="flex flex-wrap gap-2">
                                {proposal.attachments.map((attachment, index) => (
                                  <button
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                                  >
                                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                                    {attachment}
                                    <ArrowDownTrayIcon className="h-4 w-4 ml-2" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {userRole === 'buyer' && (
                            <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => setSelectedProposal(proposal)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                              >
                                <EyeIcon className="h-4 w-4 mr-1" />
                                View Details
                              </button>
                              <button
                                onClick={() => setSelectedProposal(proposal)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                              >
                                <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-1" />
                                Message
                              </button>
                              {proposal.status === 'submitted' && (
                                <>
                                  <button
                                    onClick={() => handleProposalAction(proposal.id, 'shortlist')}
                                    className="inline-flex items-center px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                                  >
                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                    Shortlist
                                  </button>
                                  <button
                                    onClick={() => handleProposalAction(proposal.id, 'reject')}
                                    className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                                  >
                                    <XMarkIcon className="h-4 w-4 mr-1" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {proposal.status === 'accepted' && (
                                <button
                                  onClick={() => handleProposalAction(proposal.id, 'award')}
                                  className="inline-flex items-center px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                                >
                                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                                  Award
                                </button>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Communicate with {userRole === 'buyer' ? 'suppliers' : 'the buyer'}
                    </p>
                  </div>

                  <div className="h-96 overflow-y-auto p-6">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <ChatBubbleLeftEllipsisIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No messages yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.isFromCurrentUser
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              {!message.isFromCurrentUser && (
                                <div className="font-medium text-sm mb-1">
                                  {message.senderName}
                                </div>
                              )}
                              <div className="text-sm">{message.content}</div>
                              <div className={`text-xs mt-1 ${
                                message.isFromCurrentUser ? 'text-orange-200' : 'text-gray-500'
                              }`}>
                                {format(new Date(message.createdAt), 'MMM dd, HH:mm')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PaperAirplaneIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Proposals</span>
                <span className="font-semibold text-gray-900">{proposals.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Shortlisted</span>
                <span className="font-semibold text-green-600">
                  {proposals.filter(p => p.status === 'accepted').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Price</span>
                <span className="font-semibold text-gray-900">
                  ${proposals.length > 0 ? 
                    (proposals.reduce((sum, p) => sum + p.totalPrice, 0) / proposals.length).toFixed(2) : 
                    '0.00'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Time Left</span>
                <span className={`font-semibold ${urgency === 'expired' ? 'text-red-600' : 'text-gray-900'}`}>
                  {urgency === 'expired' ? 'Expired' : 
                   formatDistanceToNow(new Date(rfq.submissionDeadline))}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {messages.slice(0, 3).map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {message.senderName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{message.senderName}</p>
                    <p className="text-xs text-gray-500 truncate">{message.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(message.createdAt))} ago
                    </p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};