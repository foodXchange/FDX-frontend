import React from 'react';
import { useUIStore } from '@/store/useUIStore';

export const GlobalLoading: React.FC = () => {
  const loadingTasks = useUIStore((state) => state.loadingTasks);
  const taskCount = Object.keys(loadingTasks).length;
  const isLoading = taskCount > 0;

  if (!isLoading) return null;

  const loadingMessage = Object.values(loadingTasks)[0] || 'Loading...';

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-blue-600 text-white py-2 px-4">
        <div className="flex items-center justify-center space-x-3">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-medium">{loadingMessage}</span>
        </div>
      </div>
      <div className="h-1 bg-blue-200 overflow-hidden">
        <div className="h-full bg-blue-600 animate-progress" />
      </div>
    </div>
  );
};