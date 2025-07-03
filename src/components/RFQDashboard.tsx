import React, { useState, useEffect } from 'react';

interface RFQ {
  id: string;
  title: string;
  productType: string;
  quantity: number;
  budget: number;
  deadline: string;
  status: 'draft' | 'published' | 'receiving_bids' | 'evaluating' | 'awarded';
  responseCount: number;
  bestPrice?: number;
  complianceScore: number;
}

interface SupplierResponse {
  id: string;
  rfqId: string;
  supplierName: string;
  supplierCountry: string;
  price: number;
  leadTime: number;
  moq: number;
  qualityRating: number;
  complianceRating: number;
  certifications: string[];
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

const RFQDashboard: React.FC = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [responses, setResponses] = useState<SupplierResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'my-rfqs' | 'responses' | 'orders'>('my-rfqs');

  useEffect(() => {
    setRfqs([
      { id: 'rfq_001', title: 'Premium Cornflakes Supply', productType: 'cornflakes', quantity: 5000, budget: 45000, deadline: '2025-02-15', status: 'receiving_bids', responseCount: 7, bestPrice: 8.5, complianceScore: 95 },
      { id: 'rfq_002', title: 'Organic Wheat Flour', productType: 'wheat', quantity: 10000, budget: 75000, deadline: '2025-02-20', status: 'evaluating', responseCount: 12, bestPrice: 6.8, complianceScore: 88 },
      { id: 'rfq_003', title: 'Jasmine Rice Premium', productType: 'rice', quantity: 8000, budget: 32000, deadline: '2025-02-10', status: 'awarded', responseCount: 9, bestPrice: 3.2, complianceScore: 92 }
    ]);

    setResponses([
      { id: 'res_001', rfqId: 'rfq_001', supplierName: 'Golden Grains Ltd', supplierCountry: 'Australia', price: 8.5, leadTime: 14, moq: 1000, qualityRating: 4.8, complianceRating: 95, certifications: ['ISO 22000', 'HACCP', 'Organic'], status: 'pending', submittedAt: '2025-01-15T10:30:00Z' },
      { id: 'res_002', rfqId: 'rfq_001', supplierName: 'Sunrise Foods', supplierCountry: 'India', price: 7.2, leadTime: 21, moq: 2000, qualityRating: 4.5, complianceRating: 90, certifications: ['ISO 22000', 'FSSAI'], status: 'pending', submittedAt: '2025-01-16T09:15:00Z' },
      { id: 'res_003', rfqId: 'rfq_001', supplierName: 'Euro Cereals Co', supplierCountry: 'Germany', price: 9.1, leadTime: 10, moq: 500, qualityRating: 4.9, complianceRating: 98, certifications: ['EU Organic', 'BRC', 'IFS'], status: 'pending', submittedAt: '2025-01-16T14:45:00Z' }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-blue-100 text-blue-800',
      receiving_bids: 'bg-green-100 text-green-800',
      evaluating: 'bg-yellow-100 text-yellow-800',
      awarded: 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleAcceptBid = (responseId: string) => {
    setResponses(prev => prev.map(r => 
      r.id === responseId ? { ...r, status: 'accepted' } : 
      r.rfqId === responses.find(res => res.id === responseId)?.rfqId ? { ...r, status: 'rejected' } : r
    ));
    
    const acceptedResponse = responses.find(r => r.id === responseId);
    if (acceptedResponse) {
      setRfqs(prev => prev.map(rfq => 
        rfq.id === acceptedResponse.rfqId ? { ...rfq, status: 'awarded' } : rfq
      ));
      createOrder(acceptedResponse);
    }
  };

  const createOrder = (response: SupplierResponse) => {
    const rfq = rfqs.find(r => r.id === response.rfqId);
    if (!rfq) return;

    const order = {
      id: 'order_' + Date.now(),
      rfqId: response.rfqId,
      supplierId: response.id,
      supplierName: response.supplierName,
      productName: rfq.title,
      quantity: rfq.quantity,
      unitPrice: response.price,
      totalAmount: rfq.quantity * response.price,
      expectedDelivery: new Date(Date.now() + response.leadTime * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    console.log('📦 Order created:', order);
    alert('Order created successfully!\nOrder ID: ' + order.id + '\nSupplier: ' + response.supplierName + '\nTotal: $' + order.totalAmount.toLocaleString());
  };

  const formatPrice = (price: number) => '$' + price.toFixed(2);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RFQ Management</h1>
        <p className="text-gray-600">Manage your requests, evaluate suppliers, and create orders</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'my-rfqs', label: 'My RFQs', count: rfqs.length },
            { key: 'responses', label: 'Supplier Responses', count: responses.filter(r => r.status === 'pending').length },
            { key: 'orders', label: 'Orders', count: rfqs.filter(r => r.status === 'awarded').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={'py-2 px-1 border-b-2 font-medium text-sm ' + 
                (activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'my-rfqs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Active RFQs</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {rfqs.map(rfq => (
                  <div key={rfq.id} className="p-6 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedRfq(rfq)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{rfq.title}</h3>
                        <p className="text-sm text-gray-500">
                          {rfq.quantity.toLocaleString()} units • Budget: {formatPrice(rfq.budget)} • Due: {formatDate(rfq.deadline)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={'inline-flex px-2 py-1 text-xs font-semibold rounded-full ' + getStatusColor(rfq.status)}>
                          {rfq.status.replace('_', ' ')}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{rfq.responseCount} responses</p>
                      </div>
                    </div>
                    {rfq.bestPrice && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-green-600">Best Price: {formatPrice(rfq.bestPrice)}/unit</span>
                        <span className="text-sm text-blue-600">Compliance: {rfq.complianceScore}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            {selectedRfq ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedRfq.title}</h3>
                <div className="space-y-3">
                  <div><span className="font-medium">Product:</span> {selectedRfq.productType}</div>
                  <div><span className="font-medium">Quantity:</span> {selectedRfq.quantity.toLocaleString()}</div>
                  <div><span className="font-medium">Budget:</span> {formatPrice(selectedRfq.budget)}</div>
                  <div><span className="font-medium">Deadline:</span> {formatDate(selectedRfq.deadline)}</div>
                  <div><span className="font-medium">Status:</span> <span className={'px-2 py-1 text-xs rounded ' + getStatusColor(selectedRfq.status)}>{selectedRfq.status}</span></div>
                  <div><span className="font-medium">Responses:</span> {selectedRfq.responseCount}</div>
                  <div><span className="font-medium">Compliance Score:</span> {selectedRfq.complianceScore}%</div>
                </div>
                <button 
                  onClick={() => setActiveTab('responses')}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  View Responses
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">Select an RFQ to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'responses' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Supplier Responses</h2>
            <p className="text-sm text-gray-500">Evaluate and accept the best offers</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MOQ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ratings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certifications</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {responses.map(response => (
                  <tr key={response.id} className={response.status === 'accepted' ? 'bg-green-50' : response.status === 'rejected' ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{response.supplierName}</div>
                        <div className="text-sm text-gray-500">{response.supplierCountry}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatPrice(response.price)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{response.leadTime} days</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{response.moq.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">Quality: {response.qualityRating}/5</div>
                      <div className="text-sm text-gray-500">Compliance: {response.complianceRating}%</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {response.certifications.slice(0, 2).map(cert => (
                          <span key={cert} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">{cert}</span>
                        ))}
                        {response.certifications.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{response.certifications.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {response.status === 'pending' ? (
                        <button
                          onClick={() => handleAcceptBid(response.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Accept & Create Order
                        </button>
                      ) : (
                        <span className={'px-3 py-1 rounded text-sm ' + 
                          (response.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                          {response.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
            <p className="text-sm text-gray-500">Track your confirmed orders</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rfqs.filter(rfq => rfq.status === 'awarded').map(rfq => (
                <div key={rfq.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{rfq.title}</h3>
                  <p className="text-sm text-gray-500">Quantity: {rfq.quantity.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Total: {formatPrice(rfq.quantity * (rfq.bestPrice || 0))}</p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mt-2">
                    Order Confirmed
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFQDashboard;
