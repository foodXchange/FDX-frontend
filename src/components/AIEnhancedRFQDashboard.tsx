import React, { useState, useEffect } from 'react';
import aiMatchingService from '../services/aiMatchingService';

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
}

interface AISupplierMatch {
  supplier: any;
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

const AIEnhancedRFQDashboard: React.FC = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [aiMatches, setAiMatches] = useState<AISupplierMatch[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<AIRiskAssessment | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setRfqs([
      {
        id: 'rfq_001',
        title: 'Premium Cornflakes Supply',
        productType: 'cornflakes',
        quantity: 5000,
        budget: 45000,
        deadline: '2025-02-15',
        specifications: { color: 'golden', packaging: 'bulk_bags', certification: 'organic' },
        complianceRequirements: ['ISO 22000', 'HACCP', 'Organic'],
        status: 'receiving_bids',
        responseCount: 7,
        bestPrice: 8.5,
        complianceScore: 95
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
        complianceScore: 88
      }
    ]);
  }, []);

  const analyzeRFQWithAI = async (rfq: RFQ) => {
    setIsAnalyzing(true);
    setSelectedRfq(rfq);
    setShowAIInsights(true);

    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // AI Supplier Matching
      const matches = aiMatchingService.findBestMatches({
        productType: rfq.productType,
        quantity: rfq.quantity,
        budget: rfq.budget,
        deadline: rfq.deadline,
        specifications: rfq.specifications,
        complianceRequirements: rfq.complianceRequirements,
        targetMarkets: ['global']
      });

      // AI Risk Assessment
      const risks = aiMatchingService.assessSpecificationRisks({
        productType: rfq.productType,
        quantity: rfq.quantity,
        budget: rfq.budget,
        deadline: rfq.deadline,
        specifications: rfq.specifications,
        complianceRequirements: rfq.complianceRequirements,
        targetMarkets: ['global']
      });

      setAiMatches(matches);
      setRiskAssessment(risks);
    } catch (error) {
      console.error('AI analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🤖 AI-Enhanced RFQ Management
        </h1>
        <p className="text-gray-600">Smart supplier matching and risk prevention powered by AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RFQ List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Your RFQs</h2>
          {rfqs.map(rfq => (
            <div key={rfq.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{rfq.title}</h3>
                  <p className="text-sm text-gray-500">
                    {rfq.quantity.toLocaleString()} units • ${rfq.budget.toLocaleString()} budget
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  rfq.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  rfq.status === 'published' ? 'bg-blue-100 text-blue-800' :
                  rfq.status === 'receiving_bids' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {rfq.status.replace('_', ' ')}
                </span>
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

        {/* AI Insights Panel */}
        <div>
          {showAIInsights && selectedRfq ? (
            <div className="space-y-6">
              {/* Risk Assessment */}
              {riskAssessment && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">🚨 AI Risk Assessment</h3>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRiskLevelColor(riskAssessment.riskLevel)}`}>
                      {riskAssessment.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Compliance Score:</span>
                      <span className={`ml-2 px-2 py-1 text-sm rounded ${
                        riskAssessment.complianceScore > 80 ? 'bg-green-100 text-green-800' :
                        riskAssessment.complianceScore > 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
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
                            <div className="text-lg font-bold text-green-600">
                              {match.compatibilityScore}%
                            </div>
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

                        {match.riskWarnings.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-xs font-medium text-gray-700 mb-1">Risk Warnings:</h5>
                            <div className="space-y-1">
                              {match.riskWarnings.map((warning, idx) => (
                                <div key={idx} className="text-xs text-orange-700 bg-orange-50 p-2 rounded">
                                  {warning}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {match.recommendations.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-700 mb-1">AI Recommendations:</h5>
                            <div className="space-y-1">
                              {match.recommendations.map((rec, idx) => (
                                <div key={idx} className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                                  {rec}
                                </div>
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
              <p className="text-gray-600">
                Select an RFQ and click "AI Analysis" to get intelligent supplier matching and risk assessment
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
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