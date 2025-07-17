import React from 'react';
import { motion } from 'framer-motion';

interface PerformanceBadgeProps {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({ 
  tier, 
  size = 'medium',
  showLabel = true 
}) => {
  const tierConfig = {
    bronze: {
      color: 'from-amber-600 to-amber-700',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800',
      icon: '🥉',
      label: 'Bronze'
    },
    silver: {
      color: 'from-gray-400 to-gray-500',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      icon: '🥈',
      label: 'Silver'
    },
    gold: {
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      icon: '🥇',
      label: 'Gold'
    },
    platinum: {
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      icon: '💎',
      label: 'Platinum'
    },
    diamond: {
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-100',
      textColor: 'text-cyan-800',
      icon: '💎',
      label: 'Diamond'
    }
  };

  const sizeConfig = {
    small: {
      badge: 'w-8 h-8 text-sm',
      label: 'text-xs px-2 py-1'
    },
    medium: {
      badge: 'w-12 h-12 text-lg',
      label: 'text-sm px-3 py-1'
    },
    large: {
      badge: 'w-16 h-16 text-2xl',
      label: 'text-base px-4 py-2'
    }
  };

  const config = tierConfig[tier];
  const sizeClass = sizeConfig[size];

  return (
    <div sx={{ display: "flex" }} sx={{ alignItems: "center" }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={`
          ${sizeClass.badge}
          bg-gradient-to-br ${config.color}
          rounded-full flex items-center justify-center
          shadow-lg text-white font-bold
        `}
      >
        <span>{config.icon}</span>
      </motion.div>
      
      {showLabel && (
        <div className={`
          ${sizeClass.label}
          ${config.bgColor} ${config.textColor}
          rounded-full font-semibold
        `}>
          {config.label}
        </div>
      )}
    </div>
  );
};