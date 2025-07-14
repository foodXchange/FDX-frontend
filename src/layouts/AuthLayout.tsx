import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12 items-center justify-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6">FoodXchange</h1>
            <p className="text-xl mb-8">
              The B2B marketplace revolutionizing food supply chain management
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold mb-1">Streamlined RFQ Process</h3>
                  <p className="text-blue-100">Create and manage RFQs with ease</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold mb-1">Real-time Compliance</h3>
                  <p className="text-blue-100">Ensure regulatory compliance automatically</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold mb-1">Smart Analytics</h3>
                  <p className="text-blue-100">Data-driven insights for better decisions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 right-0 p-4 text-sm text-gray-600">
        <p>&copy; 2024 FoodXchange. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthLayout;