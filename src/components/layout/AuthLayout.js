// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\components\layout\AuthLayout.js

import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="flex min-h-full">
        {/* Left side - Modern Branding */}
        <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-12 xl:px-24 bg-gradient-to-br from-blue-600 to-teal-600">
          <div className="mx-auto max-w-md text-white">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-orange-300 text-2xl font-bold">FOOD</div>
                  <div className="text-white text-2xl font-bold">XCHANGE</div>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Transform Global Food Sourcing
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Unified platform for sourcing, compliance, labeling, and logistics
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm">
                    <svg className="h-6 w-6 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Streamlined RFQ Management</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Manage requests for quotations with real-time collaboration and automated workflows
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm">
                    <svg className="h-6 w-6 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Automated Compliance</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Ensure regulatory compliance across all markets with AI-powered checks
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm">
                    <svg className="h-6 w-6 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Real-time Logistics</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Track shipments and optimize delivery for perishable goods
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="flex items-center space-x-6 text-sm text-blue-100">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <span>Enterprise Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Modern Auth form */}
        <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="lg:hidden mb-8 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="text-orange-500 text-2xl font-bold">FOOD</div>
                <div className="text-teal-600 text-2xl font-bold">XCHANGE</div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Transform Food Sourcing</h1>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              {children}
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Trusted by 500+ food companies worldwide
              </p>
              <div className="flex items-center justify-center space-x-4 mt-4 opacity-60">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;