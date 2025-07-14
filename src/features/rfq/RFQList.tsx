import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { rfqService } from '../../services/rfqService';
import { RFQ, RFQFilters } from '../../shared/types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { formatDistanceToNow, format } from 'date-fns';

interface RFQListProps {
  userRole?: 'buyer' | 'supplier';
  showActions?: boolean;
}

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'closed', label: 'Closed' },
  { value: 'awarded', label: 'Awarded' },
  { value: 'expired', label: 'Expired' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'Fruits & Vegetables', label: 'Fruits & Vegetables' },
  { value: 'Grains & Cereals', label: 'Grains & Cereals' },
  { value: 'Dairy Products', label: 'Dairy Products' },
  { value: 'Meat & Poultry', label: 'Meat & Poultry' },
  { value: 'Seafood', label: 'Seafood' },
  { value: 'Processed Foods', label: 'Processed Foods' },
  { value: 'Beverages', label: 'Beverages' },
  { value: 'Spices & Seasonings', label: 'Spices & Seasonings' },
  { value: 'Oils & Fats', label: 'Oils & Fats' },
  { value: 'Bakery Products', label: 'Bakery Products' },
];

const sortOptions = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'createdAt_asc', label: 'Oldest First' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' },
  { value: 'deliveryDate_asc', label: 'Delivery Date (Early)' },
  { value: 'deliveryDate_desc', label: 'Delivery Date (Late)' },
  { value: 'submissionDeadline_asc', label: 'Deadline (Soon)' },
  { value: 'submissionDeadline_desc', label: 'Deadline (Later)' },
];

export const RFQList: React.FC<RFQListProps> = ({ 
  userRole = 'buyer', 
  showActions = true 
}) => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState<RFQFilters>({
    status: '',
    category: '',
    sortBy: 'createdAt_desc',
    page: 1,
    limit: itemsPerPage,
  });

  useEffect(() => {
    fetchRFQs();
  }, [filters]);

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const filterParams = {
        ...filters,
        search: searchTerm,
        page: currentPage,
      };
      
      const response = await rfqService.getRFQs(filterParams);
      setRfqs(response.data);
      setTotalPages(Math.ceil(response.total / itemsPerPage));
    } catch (err) {
      setError('Failed to load RFQs');
      console.error('RFQ fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRFQs();
  };

  const handleFilterChange = (key: keyof RFQFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleDeleteRFQ = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this RFQ?')) {
      try {
        await rfqService.deleteRFQ(id);
        setRfqs(prev => prev.filter(rfq => rfq.id !== id));
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const getUrgencyLevel = (rfq: RFQ) => {
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
        return { text: 'Expired', color: 'text-red-500', bg: 'bg-red-50' };
      case 'urgent':
        return { text: 'Urgent', color: 'text-red-500', bg: 'bg-red-50' };
      case 'warning':
        return { text: 'Soon', color: 'text-yellow-500', bg: 'bg-yellow-50' };
      default:
        return null;
    }
  };

  const filteredRFQs = useMemo(() => {
    return rfqs.filter(rfq => {
      const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rfq.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rfq.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [rfqs, searchTerm]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <SkeletonLoader width="200px" height="32px" />
          <SkeletonLoader width="120px" height="40px" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonLoader key={i} width="100%" height="120px" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RFQ Management</h1>
          <p className="text-gray-600 mt-1">
            {userRole === 'buyer' ? 'Manage your requests for quotations' : 'Browse available RFQs'}
          </p>
        </div>
        {userRole === 'buyer' && (
          <Link
            to="/rfq/create"
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create RFQ
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search RFQs by title, description, or category..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </form>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RFQ List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              RFQs ({filteredRFQs.length})
            </h2>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredRFQs.length === 0 ? (
            <div className="p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No RFQs found' : 'No RFQs available'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters'
                  : userRole === 'buyer' 
                    ? 'Start by creating your first RFQ' 
                    : 'No RFQs are currently available'
                }
              </p>
              {userRole === 'buyer' && !searchTerm && (
                <Link
                  to="/rfq/create"
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create First RFQ
                </Link>
              )}
            </div>
          ) : (
            filteredRFQs.map((rfq) => {
              const urgency = getUrgencyLevel(rfq);
              const urgencyDisplay = getUrgencyDisplay(urgency);
              
              return (
                <motion.div
                  key={rfq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <Link
                          to={`/rfq/${rfq.id}`}
                          className="text-lg font-medium text-gray-900 hover:text-orange-600 truncate"
                        >
                          {rfq.title}
                        </Link>
                        <StatusBadge status={rfq.status} type="rfq" />
                        {urgencyDisplay && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${urgencyDisplay.color} ${urgencyDisplay.bg}`}>
                            {urgencyDisplay.text}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {rfq.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          <span>{rfq.category}</span>
                        </div>
                        <div className="flex items-center">
                          <span>{rfq.quantity} {rfq.unit}</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          <span>Delivery: {format(new Date(rfq.deliveryDate), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center">
                          <span>Deadline: {format(new Date(rfq.submissionDeadline), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                        <div className="flex items-center">
                          <span>Created {formatDistanceToNow(new Date(rfq.createdAt))} ago</span>
                        </div>
                      </div>
                      
                      {rfq.proposalCount > 0 && (
                        <div className="mt-3 flex items-center text-sm text-green-600">
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          <span>{rfq.proposalCount} proposal{rfq.proposalCount !== 1 ? 's' : ''} received</span>
                        </div>
                      )}
                    </div>
                    
                    {showActions && (
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          to={`/rfq/${rfq.id}`}
                          className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View RFQ"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        {userRole === 'buyer' && rfq.status === 'draft' && (
                          <Link
                            to={`/rfq/${rfq.id}/edit`}
                            className="p-2 text-gray-400 hover:text-green-500 rounded-lg hover:bg-green-50 transition-colors"
                            title="Edit RFQ"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                        )}
                        {userRole === 'buyer' && (
                          <button
                            onClick={() => handleDeleteRFQ(rfq.id)}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete RFQ"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRFQs.length)} of {filteredRFQs.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === i + 1
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};