import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ClockIcon,
  ChartBarIcon,
  MapPinIcon,
  TagIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/format';

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
}

interface AgentRFQCardProps {
  rfq: RFQ;
  matchScore?: number;
  estimatedCommission?: number;
  claimDeadline?: Date;
  onClaim?: (rfqId: string) => void;
  children?: React.ReactNode;
}

export const AgentRFQCard: React.FC<AgentRFQCardProps> = ({
  rfq,
  matchScore,
  estimatedCommission,
  claimDeadline,
  onClaim,
  children
}) => {
  const { user } = useAuth();
  
  const isAgent = user?.isAgent || user?.role === 'agent';
  const showAgentFeatures = isAgent && matchScore !== undefined;
  
  const [claiming, setClaiming] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState('');

  // Calculate time left for claiming
  React.useEffect(() => {
    if (!claimDeadline) return;

    const updateTimer = () => {
      const now = Date.now();
      const deadline = new Date(claimDeadline).getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      if (minutes > 60) {
        const hours = Math.floor(minutes / 60);
        setTimeLeft(`${hours}h ${minutes % 60}m`);
      } else {
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [claimDeadline]);

  const handleClaim = async () => {
    if (!onClaim) return;
    
    setClaiming(true);
    try {
      await onClaim(rfq.id);
    } catch (error) {
      console.error('Failed to claim lead:', error);
    } finally {
      setClaiming(false);
    }
  };

  // Determine border color based on match score
  const getBorderColor = () => {
    if (!matchScore) return 'border-gray-200';
    if (matchScore >= 90) return 'border-green-500';
    if (matchScore >= 70) return 'border-orange-500';
    return 'border-gray-300';
  };

  const getMatchBadgeColor = () => {
    if (!matchScore) return '';
    if (matchScore >= 90) return 'bg-green-100 text-green-800';
    if (matchScore >= 70) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 ${getBorderColor()}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {rfq.title}
              {timeLeft === 'Expired' && (
                <FireIcon className="h-5 w-5 text-red-500" />
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{rfq.buyerName}</p>
          </div>
          
          {/* Match Score Badge */}
          {showAgentFeatures && (
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchBadgeColor()}`}>
              {matchScore}% Match
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-2">{rfq.description}</p>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400" />
            {rfq.buyerLocation}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <TagIcon className="h-4 w-4 mr-1.5 text-gray-400" />
            {rfq.category}
          </div>
        </div>

        {/* Value and Commission */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Estimated Value</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(rfq.estimatedValue)}
            </p>
          </div>
          
          {showAgentFeatures && estimatedCommission && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Your Commission</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(estimatedCommission)}
              </p>
            </div>
          )}
        </div>

        {/* Agent Action Bar */}
        {showAgentFeatures && onClaim && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                {timeLeft !== 'Expired' ? (
                  <>
                    <ClockIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span className="text-gray-600">Claim in</span>
                    <span className="ml-1 font-semibold text-orange-600">
                      {timeLeft}
                    </span>
                  </>
                ) : (
                  <span className="text-red-600 font-medium">
                    Claiming period expired
                  </span>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClaim}
                disabled={claiming || timeLeft === 'Expired'}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors
                  flex items-center gap-2
                  ${timeLeft === 'Expired' 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                  }
                `}
              >
                <ChartBarIcon className="h-4 w-4" />
                {claiming ? 'Claiming...' : 'Claim Lead'}
              </motion.button>
            </div>
          </div>
        )}

        {/* Custom children (for non-agent view) */}
        {children}
      </div>
    </motion.div>
  );
};