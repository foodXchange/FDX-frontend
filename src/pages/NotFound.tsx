import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Illustration */}
          <div className="mx-auto w-40 h-40 flex items-center justify-center">
            <svg
              className="w-full h-full text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="mt-6 text-6xl font-extrabold text-gray-900">404</h1>
          <p className="mt-2 text-lg font-medium text-gray-900">Page not found</p>
          <p className="mt-2 text-sm text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <Link to="/dashboard">
              <Button variant="primary" className="w-full">
                <HomeIcon className="h-5 w-5 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Help Text */}
          <p className="mt-6 text-sm text-gray-500">
            If you believe this is an error, please{' '}
            <Link to="/support" className="text-blue-600 hover:text-blue-500">
              contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;