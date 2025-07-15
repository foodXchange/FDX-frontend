import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAgentStore } from '@/store/useAgentStore';
import { AgentRFQCard } from './AgentRFQCard';
import { 
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  buyerName: string;
  buyerLocation: string;
  estimatedValue: number;
  createdAt: Date;
  expiresAt: Date;
  status: string;
  // Agent-specific properties (optional for type extension)
  matchScore?: number;
  estimatedCommission?: number;
  claimDeadline?: Date;
}

interface AgentRFQListProps {
  rfqs: RFQ[];
  loading?: boolean;
}

export const AgentRFQList: React.FC<AgentRFQListProps> = ({ rfqs, loading }) => {
  const { user } = useAuth();
  const { claimLead } = useAgentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'value' | 'time'>('match');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const isAgent = user?.isAgent || user?.role === 'agent';

  // Map RFQs to Leads with match scores (mock implementation)
  const rfqsWithAgentData = React.useMemo(() => {
    if (!isAgent) return rfqs;

    return rfqs.map(rfq => {
      // Mock match score calculation
      const matchScore = Math.floor(Math.random() * 40) + 60; // 60-100
      const estimatedCommission = rfq.estimatedValue * 0.02; // 2% commission
      const claimDeadline = new Date(Date.now() + Math.random() * 4 * 60 * 60 * 1000); // 0-4 hours

      return {
        ...rfq,
        matchScore,
        estimatedCommission,
        claimDeadline
      };
    });
  }, [rfqs, isAgent]);

  // Filter and sort RFQs
  const filteredAndSortedRFQs = React.useMemo(() => {
    let filtered = rfqsWithAgentData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(rfq => 
        rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(rfq => rfq.category === filterCategory);
    }

    // Sort
    if (isAgent) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'match':
            return (b.matchScore || 0) - (a.matchScore || 0);
          case 'value':
            return b.estimatedValue - a.estimatedValue;
          case 'time':
            return new Date(a.claimDeadline || 0).getTime() - new Date(b.claimDeadline || 0).getTime();
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [rfqsWithAgentData, searchTerm, filterCategory, sortBy, isAgent]);

  const categories = React.useMemo(() => {
    const cats = new Set(rfqs.map(rfq => rfq.category));
    return ['all', ...Array.from(cats)];
  }, [rfqs]);

  const handleClaim = async (rfqId: string) => {
    try {
      await claimLead(rfqId);
      // Show success notification
    } catch (error) {
      // Show error notification
      console.error('Failed to claim lead:', error);
    }
  };

  return (
    <div>
      {/* Filters and Search */}
      {isAgent && (
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search RFQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="match">Best Match First</option>
              <option value="value">Highest Value First</option>
              <option value="time">Expiring Soon First</option>
            </select>
          </div>

          {/* Active filters indicator */}
          <div className="mt-3 flex items-center text-sm text-gray-600">
            <FunnelIcon className="h-4 w-4 mr-1" />
            Showing {filteredAndSortedRFQs.length} of {rfqs.length} RFQs
            {isAgent && (
              <span className="ml-2 text-green-600 font-medium">
                • {filteredAndSortedRFQs.filter(r => r.matchScore && r.matchScore >= 90).length} perfect matches
              </span>
            )}
          </div>
        </div>
      )}

      {/* RFQ List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))
        ) : filteredAndSortedRFQs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No RFQs found matching your criteria</p>
          </div>
        ) : (
          filteredAndSortedRFQs.map(rfq => (
            <AgentRFQCard
              key={rfq.id}
              rfq={rfq}
              matchScore={rfq.matchScore}
              estimatedCommission={rfq.estimatedCommission}
              claimDeadline={rfq.claimDeadline}
              onClaim={isAgent ? handleClaim : undefined}
            >
              {/* Non-agent view actions */}
              {!isAgent && (
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Submit Quote
                  </button>
                </div>
              )}
            </AgentRFQCard>
          ))
        )}
      </div>
    </div>
  );
};