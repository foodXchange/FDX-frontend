import React from 'react';
import { motion } from 'framer-motion';
import { Lead } from '../types';
import { 
  ClockIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  FireIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/format';

interface LeadCardProps {
  lead: Lead;
  onClaim?: (leadId: string) => void;
  onView?: (leadId: string) => void;
  showActions?: boolean;
  variant?: 'available' | 'claimed';
}

export const LeadCard: React.FC<LeadCardProps> = ({ 
  lead, 
  onClaim, 
  onView,
  showActions = true,
  variant = 'available'
}) => {
  const isUrgent = lead.priority === 'urgent';
  const hoursUntilExpiry = Math.max(0, (new Date(lead.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60));
  const isExpiringSoon = hoursUntilExpiry < 2;

  const matchScoreColor = lead.matchScore >= 90 ? 'text-green-600' : 
                          lead.matchScore >= 70 ? 'text-orange-600' : 
                          'text-gray-600';

  const borderColor = lead.matchScore >= 90 ? 'border-green-500' : 
                     lead.matchScore >= 70 ? 'border-orange-500' : 
                     'border-gray-300';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`
        bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200
        border-l-4 ${borderColor} overflow-hidden
      `}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {lead.rfqTitle}
              {isUrgent && (
                <FireIcon className="h-5 w-5 text-red-500 animate-pulse" />
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {lead.buyerName}
            </p>
          </div>
          
          {/* Match Score */}
          <div className="text-right">
            <div className={`text-2xl font-bold ${matchScoreColor}`}>
              {lead.matchScore}%
            </div>
            <p className="text-xs text-gray-500">Match</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400" />
            {lead.buyerLocation}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CurrencyDollarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
            Est. {formatCurrency(lead.estimatedValue)}
          </div>
        </div>

        {/* Category & Commission */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {lead.category}
          </span>
          <span className="text-sm font-semibold text-green-600">
            Commission: {formatCurrency(lead.estimatedCommission)}
          </span>
        </div>

        {/* Timer */}
        {variant === 'available' && (
          <div className={`
            flex items-center text-sm mb-4
            ${isExpiringSoon ? 'text-red-600 font-medium' : 'text-gray-500'}
          `}>
            <ClockIcon className="h-4 w-4 mr-1.5" />
            {isExpiringSoon ? (
              <span className="animate-pulse">
                Expires in {Math.floor(hoursUntilExpiry)}h {Math.floor((hoursUntilExpiry % 1) * 60)}m
              </span>
            ) : (
              <span>
                Claim within {Math.floor(hoursUntilExpiry)} hours
              </span>
            )}
          </div>
        )}

        {/* Status for claimed leads */}
        {variant === 'claimed' && lead.status && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`
                px-2.5 py-1 text-xs font-medium rounded-full
                ${lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' : ''}
                ${lead.status === 'negotiating' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${lead.status === 'won' ? 'bg-green-100 text-green-800' : ''}
                ${lead.status === 'lost' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            {variant === 'available' && onClaim && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onClaim(lead.id)}
                className="flex-1 bg-orange-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <ChartBarIcon className="h-4 w-4" />
                Claim Lead
              </motion.button>
            )}
            
            {onView && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onView(lead.id)}
                className={`
                  ${variant === 'available' ? 'flex-0' : 'flex-1'}
                  border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors
                `}
              >
                View Details
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};