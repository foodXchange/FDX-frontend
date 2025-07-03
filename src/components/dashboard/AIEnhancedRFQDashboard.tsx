import React, { useState, useEffect } from 'react';
import { Bell, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign, Users, BarChart3 } from 'lucide-react';

interface RFQ {
  id: string;
  title: string;
  productType: string;
  quantity: number;
  budget: number;
  deadline: string;
  specifications: any;
  complianceRequirements: string[];
  status: 'draft' | 'published' | 'receiving_bids' | 'evaluating' | 'awarded';
  responseCount: number;
  bestPrice?: number;
  complianceScore: number;
  createdAt: string;
}

interface AISupplierMatch {
  supplier: {
    id: string;
    name: string;
    country: string;
    qualityRating: number;
    complianceRating: number;
  };
  compatibilityScore: number;
  matchReasons: string[];
  riskWarnings: string[];
  recommendations: string[];
  estimatedPrice: number;
  estimatedLeadTime: number;
  confidenceLevel: 'high' | 'medium' | 'low';
}

interface AIRiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  preventionSuggestions: string[];
  historicalFailures: string[];
  complianceScore: number;
}

interface AIInsights {
  totalRFQs: number;
  activeProjects: number;
  avgComplianceScore: number;
  potentialSavings: number;
  riskAlerts: number;
  successfulMatches: number;
}

const AIEnhancedRFQDashboard: React.FC = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [aiMatches, setAiMatches] = useState<AISupplierMatch[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<AIRiskAssessment | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rfqs' | 'analytics'>('dashboard');

  useEffect(() => {
    // Initialize with sample data
    const sampleRFQs: RFQ[] = [
      {
        id: 'rfq_001',
        title: 'Premium Cornflakes Supply',
        productType: 'cornflakes',
        quantity: 5000,
        budget: 45000,
        deadline: '2025-02-15',
        specifications: { color: 'golden', packaging: 'bulk_bags', certification: 'organic' },
        complianceRequirements: ['ISO22000', 'HACCP', 'Organic'],
        status: 'receiving_bids',
        responseCount: 7,
        bestPrice: 8.5,
        complianceScore: 95,
        createdAt: '2025-01-01'
      },
      {
        id: 'rfq_002',
        title: 'Organic Wheat Flour',
        productType: 'wheat',
        quantity: 10000,
        budget: 75000,
        deadline: '2025-02-20',
        specifications: { protein_content: '12%', moisture: '14%' },
        complianceRequirements: ['EU Organic', 'BRC'],
        status: 'draft',
        responseCount: 0,
        complianceScore: 88,
        createdAt: '2025-01-02'
      },
      {
        id: 'rfq_003',
        title: 'Specialty Rice Varieties',
        productType: 'rice',
        quantity: 8000,
        budget: 60000,
        deadline: '2025-03-01',
        specifications: { grade: 'premium', origin: 'Asia' },
        complianceRequirements: ['FDA', 'Non-GMO'],
        status: 'evaluating',
        responseCount: 12,
        bestPrice: 7.2,
        complianceScore: 92,
        createdAt: '2024-12-28'
      }
    ];

    setRfqs(sampleRFQs);
    
    // Calculate insights
    const totalRFQs = sampleRFQs.length;
    const activeProjects = sampleRFQs.filter(rfq => ['receiving_bids', 'evaluating'].includes(rfq.status)).length;
    const avgComplianceScore = Math.round(sampleRFQs.reduce((sum, rfq) => sum + rfq.complianceScore, 0) / totalRFQs);
    const potentialSavings = 125000;
    const riskAlerts = sampleRFQs.filter(rfq => rfq.complianceScore < 90).length;
    const successfulMatches = 24;

    setInsights({
      totalRFQs,
      activeProjects,
      avgComplianceScore,
      potentialSavings,
      riskAlerts,
      successfulMatches
    });
  }, []);

  const analyzeRFQWithAI = async (rfq: RFQ) => {
    setIsAnalyzing(true);
    setSelectedRfq(rfq);
    setShowAIInsights(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Simulate AI analysis results
      const mockMatches: AISupplierMatch[] = [
        {
          supplier: {
            id: 'sup_001',
            name: 'Golden Grains Ltd',
            country: 'Australia',
            qualityRating: 4.8,
            complianceRating: 95
          },
          compatibilityScore: 94,
          matchReasons: ['💰 Excellent price competitiveness', '⭐ Outstanding quality track record', '✅ Perfect compliance match'],
          riskWarnings: [],
          recommendations: ['📈 Perfect for large volume requirements'],
          estimatedPrice: 8.2,
          estimatedLeadTime: 14,
          confidenceLevel: 'high'
        },
        {
          supplier: {
            id: 'sup_002',
            name: 'EuroCereals Co',
            country: 'Germany',
            qualityRating: 4.9,
            complianceRating: 98
          },
          compatibilityScore: 91,
          matchReasons: ['🏆 Premium quality specialist', '🚚 Reliable delivery performance', '🌏 Strategic location for EU markets'],
          riskWarnings: [],
          recommendations: ['🔍 Request quality samples and certifications'],
          estimatedPrice: 9.1,
          estimatedLeadTime: 10,
          confidenceLevel: 'high'
        }
      ];

      const mockRiskAssessment: AIRiskAssessment = {
        riskLevel: rfq.specifications?.color === 'dark_brown' ? 'critical' : 'low',
        riskFactors: rfq.specifications?.color === 'dark_brown' 
          ? ['Invalid cornflake color specification detected'] 
          : [],
        preventionSuggestions: rfq.specifications?.color === 'dark_brown'
          ? ['Select approved colors: golden, light_brown, amber, or honey', 'Request color samples before finalizing order']
          : ['Maintain current specification standards'],
        historicalFailures: rfq.specifications?.color === 'dark_brown'
          ? ['9-month project failure in 2024 due to dark brown cornflake color']
          : [],
        complianceScore: rfq.specifications?.color === 'dark_brown' ? 25 : rfq.complianceScore
      };

      setAiMatches(mockMatches);
      setRiskAssessment(mockRiskAssessment);
    } catch (error) {
      console.error('AI analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'receiving_bids': return 'bg-green-100 text-green-800';
      case 'evaluating': return 'bg-yellow-100 text-yellow-800';
      case 'awarded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total RFQs</p>
              <p className="text-3xl font-bold text-gray-900">{insights?.totalRFQs}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900">{insights?.activeProjects}</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Compliance</p>
              <p className="text-3xl font-bold text-gray-900">{insights?.avgComplianceScore}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Potential Savings</p>
              <p className="text-3xl font-bold text-gray-900">${insights?.potentialSavings?.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Risk Alerts</p>
              <p className="text-3xl font-bold text-gray-900">{insights?.riskAlerts}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Matches</p>
              <p className="text-3xl font-bold text-gray-900">{insights?.successfulMatches}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent RFQ Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {rfqs.slice(0, 3).map(rfq => (
              <div key={rfq.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{rfq.title}</p>
                  <p className="text-sm text-gray-500">{rfq.quantity.toLocaleString()} units • ${rfq.budget.toLocaleString()}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rfq.status)}`}>
                  {rfq.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const RFQList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Your RFQs</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
          Create New RFQ
        </button>
      </div>
      
      {rfqs.map(rfq => (
        <div key={rfq.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{rfq.title}</h3>
              <p className="text-sm text-gray-500">
                {rfq.quantity.toLocaleString()} units • ${rfq.budget.toLocaleString()} budget
              </p>
              <p className="text-sm text-gray-500">Deadline: {rfq.deadline}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rfq.status)}`}>
              {rfq.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center mb-4 space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              {rfq.responseCount} responses
            </div>
            {rfq.bestPrice && (
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-1" />
                Best: ${rfq.bestPrice}/unit
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              {rfq.complianceScore}% compliance
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => analyzeRFQWithAI(rfq)}
              disabled={isAnalyzing}
              className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>🤖 AI Analysis</>
              )}
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50">
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI-Enhanced RFQ Management</h1>
        <p className="text-gray-600">Smart supplier matching and risk prevention powered by AI</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'rfqs', label: 'RFQs', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'rfqs' && <RFQList />}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Dashboard</h3>
              <p className="text-gray-600">Advanced analytics and reporting features coming soon...</p>
            </div>
          )}
        </div>

        {/* AI Insights Panel */}
        <div>
          {showAIInsights && selectedRfq ? (
            <div className="space-y-6">
              {/* Risk Assessment */}
              {riskAssessment && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">🚨 AI Risk Assessment</h3>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getRiskLevelColor(riskAssessment.riskLevel)}`}>
                      {riskAssessment.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Compliance Score:</span>
                      <span className={`ml-2 px-2 py-1 text-sm rounded ${
                        riskAssessment.complianceScore > 80 ? 'bg-green-100 text-green-800' :
                        riskAssessment.complianceScore > 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {riskAssessment.complianceScore}%
                      </span>
                    </div>
                  </div>

                  {riskAssessment.riskFactors.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">⚠️ Risk Factors:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {riskAssessment.riskFactors.map((factor, index) => (
                          <li key={index}>• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {riskAssessment.historicalFailures.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                      <h4 className="text-sm font-medium text-red-900 mb-2">📚 Historical Failures:</h4>
                      <ul className="text-sm text-red-800 space-y-1">
                        {riskAssessment.historicalFailures.map((failure, index) => (
                          <li key={index}>• {failure}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {riskAssessment.preventionSuggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">💡 AI Recommendations:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {riskAssessment.preventionSuggestions.map((suggestion, index) => (
                          <li key={index}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* AI Supplier Matches */}
              {aiMatches.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">🎯 AI Supplier Matches</h3>
                  <div className="space-y-4">
                    {aiMatches.map((match, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{match.supplier.name}</h4>
                            <p className="text-sm text-gray-500">{match.supplier.country}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{match.compatibilityScore}%</div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceBadge(match.confidenceLevel)}`}>
                              {match.confidenceLevel} confidence
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-xs text-gray-500">Estimated Price</span>
                            <div className="font-medium">${match.estimatedPrice}/unit</div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Lead Time</span>
                            <div className="font-medium">{match.estimatedLeadTime} days</div>
                          </div>
                        </div>

                        {match.matchReasons.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-xs font-medium text-gray-700 mb-1">Match Reasons:</h5>
                            <div className="flex flex-wrap gap-1">
                              {match.matchReasons.map((reason, idx) => (
                                <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 mr-2">
                            Invite to Bid
                          </button>
                          <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50">
                            View Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI Analysis Ready</h3>
              <p className="text-gray-600 mb-4">
                Select an RFQ and click "AI Analysis" to get intelligent supplier matching and risk assessment
              </p>
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="bg-white p-3 rounded">
                  <div className="font-medium text-blue-600">🎯 Smart Matching</div>
                  <div className="text-gray-600">AI finds perfect suppliers based on your requirements</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="font-medium text-red-600">🚨 Risk Prevention</div>
                  <div className="text-gray-600">Prevents costly errors like wrong cornflake colors</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIEnhancedRFQDashboard;