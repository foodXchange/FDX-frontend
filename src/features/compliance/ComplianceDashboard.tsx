// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\features\compliance\ComplianceDashboard.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface ComplianceDashboardProps {
  onNavigate?: (view: string) => void;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🛡️ Compliance Center
        </h2>
        <p className="text-gray-600 mt-1">
          Professional compliance validation system - Prevent costly errors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800">✅ System Ready</h3>
              <p className="text-green-700 text-sm">
                Compliance validation system is ready to prevent costly errors like the cornflake color issue.
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Full compliance dashboard with validation, history, and analytics coming soon...
              </p>
              <Button 
                onClick={() => {
                  alert('Compliance features will be available once all components are installed!');
                  // Use onNavigate if provided
                  if (onNavigate) {
                    console.log('Navigation handler available for future use');
                  }
                }}
              >
                Activate Full Compliance System
              </Button>
              
              {/* Demo navigation */}
              {onNavigate && (
                <div className="mt-4 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onNavigate('dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onNavigate('rfq')}
                  >
                    Go to RFQ
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview of compliance features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🧪 Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              Test product specifications against regulatory requirements
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">📊 History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              Track all validation attempts and results
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">📈 Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              Compliance statistics and risk assessment
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};