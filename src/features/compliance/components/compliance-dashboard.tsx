// File: /src/features/compliance/components/ComplianceDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  AlertCircle,
  TrendingUp,
  Users,
  RefreshCw
} from 'lucide-react';
import { useComplianceUpdates, useWebSocket } from '../../../shared/hooks/use-websocket';

interface ComplianceItem {
  id: string;
  rfqId: string;
  rfqTitle: string;
  status: 'compliant' | 'non_compliant' | 'pending' | 'checking';
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  issues: ComplianceIssue[];
  certifications: string[];
  lastChecked: string;
  region: string;
  category: string;
}

interface ComplianceIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  field?: string;
  suggestion?: string;
}

const ComplianceDashboard: React.FC = () => {
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([
    {
      id: 'comp_001',
      rfqId: 'rfq_001',
      rfqTitle: 'Premium Cornflakes Supply',
      status: 'compliant',
      score: 95,
      riskLevel: 'low',
      issues: [],
      certifications: ['FDA', 'ORGANIC', 'HALAL'],
      lastChecked: '2 minutes ago',
      region: 'US',
      category: 'Cereals'
    },
    {
      id: 'comp_002',
      rfqId: 'rfq_002',
      rfqTitle: 'Organic Wheat Flour',
      status: 'non_compliant',
      score: 68,
      riskLevel: 'high',
      issues: [
        {
          id: 'issue_001',
          severity: 'high',
          message: 'Missing allergen declaration for gluten',
          field: 'allergens',
          suggestion: 'Add gluten allergen warning to product labeling'
        },
        {
          id: 'issue_002',
          severity: 'medium',
          message: 'Organic certification expires in 30 days',
          field: 'certifications',
          suggestion: 'Renew USDA Organic certification before expiry'
        }
      ],
      certifications: ['ORGANIC', 'NON_GMO'],
      lastChecked: '5 minutes ago',
      region: 'EU',
      category: 'Flour & Grains'
    },
    {
      id: 'comp_003',
      rfqId: 'rfq_003',
      rfqTitle: 'Premium Coffee Beans',
      status: 'checking',
      score: 88,
      riskLevel: 'medium',
      issues: [
        {
          id: 'issue_003',
          severity: 'low',
          message: 'Fair Trade documentation pending review',
          field: 'certifications',
          suggestion: 'Provide updated Fair Trade certificate'
        }
      ],
      certifications: ['FAIR_TRADE', 'RAINFOREST_ALLIANCE'],
      lastChecked: '1 minute ago',
      region: 'GLOBAL',
      category: 'Beverages'
    }
  ]);

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'compliant' | 'issues' | 'checking'>('all');

  // WebSocket connection for real-time compliance updates
  const { isConnected } = useWebSocket({
    userId: 'compliance_user',
    autoConnect: true
  });

  // Compliance updates hook
  const { complianceUpdates, isChecking, requestComplianceCheck } = useComplianceUpdates();

  // Update compliance items when real-time updates come in
  useEffect(() => {
    Object.entries(complianceUpdates).forEach(([rfqId, update]) => {
      setComplianceItems(prev => prev.map(item =>
        item.rfqId === rfqId ? {
          ...item,
          status: update.status,
          score: update.complianceScore,
          riskLevel: update.riskLevel,
          issues: update.issues,
          lastChecked: 'Just now'
        } : item
      ));
    });
  }, [complianceUpdates]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'checking': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRecheck = (rfqId: string) => {
    const item = complianceItems.find(i => i.rfqId === rfqId);
    if (item) {
      setComplianceItems(prev => prev.map(i =>
        i.rfqId === rfqId ? { ...i, status: 'checking', lastChecked: 'Checking...' } : i
      ));
      
      requestComplianceCheck(rfqId, {
        category: item.category,
        region: item.region,
        certifications: item.certifications
      });
    }
  };

  const filteredItems = complianceItems.filter(item => {
    switch (filter) {
      case 'compliant':
        return item.status === 'compliant';
      case 'issues':
        return item.status === 'non_compliant' || item.issues.length > 0;
      case 'checking':
        return item.status === 'checking' || item.status === 'pending';
      default:
        return true;
    }
  });

  const stats = {
    totalItems: complianceItems.length,
    compliant: complianceItems.filter(i => i.status === 'compliant').length,
    issues: complianceItems.filter(i => i.status === 'non_compliant').length,
    avgScore: Math.round(complianceItems.reduce((sum, item) => sum + item.score, 0) / complianceItems.length)
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-600">Real-time regulatory compliance monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live Monitoring' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        {[
          { key: 'all', label: 'All Items' },
          { key: 'compliant', label: 'Compliant' },
          { key: 'issues', label: 'Issues' },
          { key: 'checking', label: 'Checking' }
        ].map(filterOption => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key as any)}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === filterOption.key
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {filterOption.label}
            {filterOption.key === 'issues' && (
              <span className="ml-1 bg-red-100 text-red-800 text-xs px-1 rounded">
                {stats.issues}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Compliant</p>
              <p className="text-2xl font-bold text-green-600">{stats.compliant}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Issues</p>
              <p className="text-2xl font-bold text-red-600">{stats.issues}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-blue-600">{stats.avgScore}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Items List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Compliance Items</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedItem === item.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedItem(item.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{item.rfqTitle}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{item.region}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Score:</span>
                        <span className={`ml-1 ${item.score >= 90 ? 'text-green-600' : item.score >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {item.score}%
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Risk:</span>
                        <span className={`ml-1 ${getRiskColor(item.riskLevel)}`}>
                          {item.riskLevel}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Issues:</span> {item.issues.length}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.certifications.map(cert => (
                        <span
                          key={cert}
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>

                    {/* Issues Preview */}
                    {item.issues.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-900 mb-1">Issues:</div>
                        {item.issues.slice(0, 2).map(issue => (
                          <div key={issue.id} className="flex items-center space-x-2 text-sm">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                            <span className="text-gray-700">{issue.message}</span>
                          </div>
                        ))}
                        {item.issues.length > 2 && (
                          <div className="text-xs text-gray-500 mt-1">
                            +{item.issues.length - 2} more issues
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.lastChecked}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRecheck(item.rfqId);
                        }}
                        disabled={isChecking[item.rfqId] || item.status === 'checking'}
                        className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                      >
                        {isChecking[item.rfqId] || item.status === 'checking' ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Shield className="h-3 w-3" />
                        )}
                        <span>Recheck</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Item Details */}
        <div>
          {selectedItem && (() => {
            const item = complianceItems.find(i => i.id === selectedItem);
            if (!item) return null;

            return (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-medium text-gray-900 mb-4">Compliance Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">RFQ Information</h4>
                    <div className="text-sm text-gray-600">
                      <div>Title: {item.rfqTitle}</div>
                      <div>Category: {item.category}</div>
                      <div>Region: {item.region}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Compliance Score</h4>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.score >= 90 ? 'bg-green-500' : 
                          item.score >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{item.score}% compliant</div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Certifications</h4>
                    <div className="space-y-1">
                      {item.certifications.map(cert => (
                        <div key={cert} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {item.issues.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Issues ({item.issues.length})</h4>
                      <div className="space-y-2">
                        {item.issues.map(issue => (
                          <div key={issue.id} className="border-l-4 border-red-400 pl-3 py-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`px-2 py-1 text-xs font-semibold rounded ${getSeverityColor(issue.severity)}`}>
                                {issue.severity}
                              </span>
                              {issue.field && (
                                <span className="text-xs text-gray-500">Field: {issue.field}</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-800 mb-1">{issue.message}</div>
                            {issue.suggestion && (
                              <div className="text-xs text-blue-600">
                                💡 {issue.suggestion}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-4 mt-6">
            <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                📊 Generate Compliance Report
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                ⚠️ Set Compliance Alerts
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                📋 Export to PDF
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                🔄 Bulk Recheck All
              </button>
            </div>
          </div>

          {/* Regional Compliance Summary */}
          <div className="bg-white rounded-lg shadow p-4 mt-6">
            <h3 className="font-medium text-gray-900 mb-4">Regional Compliance</h3>
            <div className="space-y-3">
              {['US', 'EU', 'GLOBAL'].map(region => {
                const regionItems = complianceItems.filter(item => item.region === region);
                const compliantCount = regionItems.filter(item => item.status === 'compliant').length;
                const percentage = regionItems.length > 0 ? Math.round((compliantCount / regionItems.length) * 100) : 0;
                
                return (
                  <div key={region}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{region}</span>
                      <span className="text-gray-600">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage >= 90 ? 'bg-green-500' : 
                          percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;