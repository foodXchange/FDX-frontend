import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
          <ShieldExclamationIcon className="h-12 w-12 text-red-600" />
        </div>
        
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Access Denied
        </h2>
        
        <p className="mt-2 text-sm text-gray-600">
          You don't have permission to access this page.
        </p>
        
        <p className="mt-4 text-sm text-gray-500">
          If you believe this is an error, please contact your administrator or try logging in with a different account.
        </p>
        
        <div className="mt-8 space-y-3">
          <Button
            variant="default"
            className="w-full"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          
          <Link to="/dashboard">
            <Button variant="outline" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};