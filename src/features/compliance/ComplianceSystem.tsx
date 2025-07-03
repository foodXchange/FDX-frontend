import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, FileText, Clock, Globe, Award } from 'lucide-react';

interface ComplianceRequirement {
  id: string;
  name: string;
  type: 'certification' | 'regulation' | 'standard';
  region: string[];
  mandatory: boolean;
  status: 'compliant' | 'pending' | 'non_compliant' | 'expired';
  expiryDate?: string;
  documentUrl?: string;
  description: string;
}

interface AllergenInfo {
  name: string;
  present: boolean;
  mayContain: boolean;
  severity: 'high' | 'medium' | 'low';
  regions: string[];
}

interface RegulatoryCheck {
  id: string;
  productType: string;
  targetMarkets: string[];
  requirements: ComplianceRequirement[];
  allergens: AllergenInfo[];
  status: 'checking' | 'compliant' | 'issues_found';
  lastChecked: string;
  score: number;
}

const ComplianceSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'regulatory' | 'certifications' | 'allergens'>('overview');
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [complianceData, setComplianceData] = useState<RegulatoryCheck | null>(null);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(['US', 'EU', 'UK']);

  useEffect(() => {
    // Initialize with sample compliance data
    const sampleCompliance: RegulatoryCheck = {
      id: 'check_001',
      productType: 'cornflakes',
      targetMarkets: ['US', 'EU', 'UK'],
      requirements: [
        {
          id: 'req_001',
          name: 'FDA Food Safety Modernization Act',
          type: 'regulation',
          region: ['US'],
          mandatory: true,
          status: 'compliant',
          description: 'Mandatory food safety regulations for US market'
        },
        {
          id: 'req_002',
          name: 'EU Organic Certification',
          type: 'certification',
          region: ['EU'],
          mandatory: false,
          status: 'pending',
          expiryDate: '2025-12-31',
          description: 'Organic certification for European markets'
        },
        {
          id: 'req_003',
          name: 'ISO 22000',
          type: 'standard',
          region: ['US', 'EU', 'UK'],
          mandatory: true,
          status: 'compliant',
          expiryDate: '2026-06-15',
          description: 'Food safety management system standard'
        },
        {
          id: 'req_004',
          name: 'HACCP Compliance',
          type: 'standard',
          region: ['US', 'EU', 'UK'],
          mandatory: true,
          status: 'compliant',
          description: 'Hazard Analysis Critical Control Points system'
        },
        {
          id: 'req_005',
          name: 'UK Food Standards',
          type: 'regulation',
          region: ['UK'],
          mandatory: true,
          status: 'non_compliant',
          description: 'Post-Brexit UK specific food standards'
        }
      ],
      allergens: [
        { name: 'Gluten', present: true, mayContain: false, severity: 'high', regions: ['US', 'EU', 'UK'] },
        { name: 'Nuts', present: false, mayContain: true, severity: 'high', regions: ['US', 'EU', 'UK'] },
        { name: 'Dairy', present: false, mayContain: false, severity: 'medium', regions: ['US', 'EU'] },
        { name: 'Soy', present: false, mayContain: true, severity: 'medium', regions: ['US'] }
      ],
      status: 'issues_found',
      lastChecked: '2025-01-03T10:30:00Z',
      score: 85
    };

    setComplianceData(sampleCompliance);
  }, []);

  const runComplianceCheck = async () => {
    setIsRunningCheck(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update compliance data
    if (complianceData) {
      const updatedData = {
        ...complianceData,
        lastChecked: new Date().toISOString(),
        status: 'compliant' as const,
        score: Math.floor(Math.random() * 20) + 80 // Random score 80-100
      };
      setComplianceData(updatedData);
    }
    
    setIsRunningCheck(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'non_compliant': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'non_compliant': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAllergenSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const ComplianceOverview = () => (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Compliance Status</h3>
          <button
            onClick={runComplianceCheck}
            disabled={isRunningCheck}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isRunningCheck ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running Check...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Run Compliance Check
              </>
            )}
          </button>
        </div>
        
        {complianceData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{complianceData.score}%</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {complianceData.requirements.filter(r => r.status === 'compliant').length}
              </div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {complianceData.requirements.filter(r => r.status === 'non_compliant').length}
              </div>
              <div className="text-sm text-gray-600">Issues</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('regulatory')}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left"
        >
          <Globe className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-medium text-gray-900">Regulatory Checks</h3>
          <p className="text-sm text-gray-600">Verify market requirements</p>
        </button>

        <button
          onClick={() => setActiveTab('certifications')}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left"
        >
          <Award className="h-8 w-8 text-purple-600 mb-2" />
          <h3 className="font-medium text-gray-900">Certifications</h3>
          <p className="text-sm text-gray-600">Manage certificates</p>
        </button>

        <button
          onClick={() => setActiveTab('allergens')}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left"
        >
          <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
          <h3 className="font-medium text-gray-900">Allergen Labeling</h3>
          <p className="text-sm text-gray-600">Safety compliance</p>
        </button>

        <div className="bg-white rounded-lg shadow p-4 text-left">
          <FileText className="h-8 w-8 text-green-600 mb-2" />
          <h3 className="font-medium text-gray-900">Documentation</h3>
          <p className="text-sm text-gray-600">Audit trail & reports</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Compliance Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-900">FDA compliance verified for cornflakes</span>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-gray-900">ISO 22000 certificate expires in 6 months</span>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-gray-900">UK Food Standards non-compliance detected</span>
              <span className="text-xs text-gray-500">2 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const RegulatoryTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Regulatory Requirements</h3>
          <p className="text-sm text-gray-600">Market-specific regulations and standards</p>
        </div>
        <div className="p-6">
          {complianceData?.requirements.map(req => (
            <div key={req.id} className="flex items-center justify-between py-4 border-b last:border-b-0">
              <div className="flex items-center space-x-3">
                {getStatusIcon(req.status)}
                <div>
                  <h4 className="font-medium text-gray-900">{req.name}</h4>
                  <p className="text-sm text-gray-600">{req.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">Regions:</span>
                    {req.region.map(region => (
                      <span key={region} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(req.status)}`}>
                  {req.status.replace('_', ' ')}
                </span>
                {req.expiryDate && (
                  <p className="text-xs text-gray-500 mt-1">Expires: {req.expiryDate}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CertificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Certifications</h3>
            <p className="text-sm text-gray-600">Manage and track certification status</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
            Upload Certificate
          </button>
        </div>
        <div className="p-6">
          {complianceData?.requirements
            .filter(req => req.type === 'certification')
            .map(cert => (
              <div key={cert.id} className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Award className="h-8 w-8 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <p className="text-sm text-gray-600">{cert.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusIcon(cert.status)}
                    {cert.expiryDate && (
                      <p className="text-xs text-gray-500 mt-1">Expires: {cert.expiryDate}</p>
                    )}
                  </div>
                </div>
                {cert.documentUrl && (
                  <button className="mt-3 text-blue-600 text-sm hover:text-blue-800">
                    View Certificate →
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const AllergensTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Allergen Information</h3>
          <p className="text-sm text-gray-600">Manage allergen declarations for different markets</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceData?.allergens.map(allergen => (
              <div key={allergen.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{allergen.name}</h4>
                  <span className={`text-sm font-medium ${getAllergenSeverityColor(allergen.severity)}`}>
                    {allergen.severity} risk
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Present:</span>
                    <span className={allergen.present ? 'text-red-600 font-medium' : 'text-green-600'}>
                      {allergen.present ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>May Contain:</span>
                    <span className={allergen.mayContain ? 'text-yellow-600 font-medium' : 'text-green-600'}>
                      {allergen.mayContain ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Required in:</span>
                    <div className="flex space-x-1">
                      {allergen.regions.map(region => (
                        <span key={region} className="px-1 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Allergen Labeling Requirements</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Ensure all allergen information is accurate and complies with target market regulations. 
                  Incorrect labeling can result in product recalls and regulatory penalties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🛡️ Compliance Management</h1>
        <p className="text-gray-600">Automated regulatory checks and compliance tracking</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'regulatory', label: 'Regulatory', icon: Globe },
            { id: 'certifications', label: 'Certifications', icon: Award },
            { id: 'allergens', label: 'Allergens', icon: AlertTriangle }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <ComplianceOverview />}
        {activeTab === 'regulatory' && <RegulatoryTab />}
        {activeTab === 'certifications' && <CertificationsTab />}
        {activeTab === 'allergens' && <AllergensTab />}
      </div>
    </div>
  );
};

export default ComplianceSystem;