import React, { useState, useEffect } from 'react';
import websocketService from '../services/websocket';

interface AvailableRFQ {
  id: string;
  title: string;
  productType: string;
  quantity: number;
  budget: number;
  deadline: string;
  buyerCompany: string;
  buyerCountry: string;
  specifications: any;
  complianceRequirements: string[];
  postedAt: string;
  responseCount: number;
  timeLeft: string;
}

interface MyBid {
  id: string;
  rfqId: string;
  rfqTitle: string;
  price: number;
  leadTime: number;
  moq: number;
  status: 'submitted' | 'shortlisted' | 'accepted' | 'rejected';
  submittedAt: string;
  notes?: string;
  buyerFeedback?: string;
}

const SupplierDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'my-bids' | 'messages' | 'profile'>('available');
  const [availableRFQs, setAvailableRFQs] = useState<AvailableRFQ[]>([]);
  const [myBids, setMyBids] = useState<MyBid[]>([]);
  const [selectedRFQ, setSelectedRFQ] = useState<AvailableRFQ | null>(null);
  const [bidForm, setBidForm] = useState({ price: '', leadTime: '', moq: '', notes: '' });
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    setAvailableRFQs([
      {
        id: 'rfq_001',
        title: 'Premium Cornflakes Supply',
        productType: 'cornflakes',
        quantity: 5000,
        budget: 45000,
        deadline: '2025-02-15',
        buyerCompany: 'Global Foods Inc',
        buyerCountry: 'USA',
        specifications: { color: 'golden', packaging: 'bulk_bags', certification: 'organic' },
        complianceRequirements: ['ISO 22000', 'HACCP', 'Organic Certification'],
        postedAt: '2025-01-10T08:00:00Z',
        responseCount: 6,
        timeLeft: '18 days'
      },
      {
        id: 'rfq_002', 
        title: 'Organic Wheat Flour',
        productType: 'wheat',
        quantity: 10000,
        budget: 75000,
        deadline: '2025-02-20',
        buyerCompany: 'EuroMills Ltd',
        buyerCountry: 'Germany',
        specifications: { protein_content: '12%', moisture: '14%', packaging: 'paper_bags' },
        complianceRequirements: ['EU Organic', 'BRC', 'IFS'],
        postedAt: '2025-01-12T10:30:00Z',
        responseCount: 11,
        timeLeft: '23 days'
      }
    ]);

    setMyBids([
      {
        id: 'bid_001',
        rfqId: 'rfq_003',
        rfqTitle: 'Jasmine Rice Premium',
        price: 3.2,
        leadTime: 18,
        moq: 1000,
        status: 'accepted',
        submittedAt: '2025-01-14T14:20:00Z',
        buyerFeedback: 'Excellent proposal! Looking forward to working together.'
      },
      {
        id: 'bid_002',
        rfqId: 'rfq_001',
        rfqTitle: 'Premium Cornflakes Supply',
        price: 8.5,
        leadTime: 14,
        moq: 1000,
        status: 'shortlisted',
        submittedAt: '2025-01-15T09:45:00Z',
        notes: 'Can provide additional organic certifications'
      }
    ]);

    websocketService.connect('supplier_001');
  }, []);

  const submitBid = () => {
    if (!selectedRFQ) return;
    
    const newBid: MyBid = {
      id: 'bid_' + Date.now(),
      rfqId: selectedRFQ.id,
      rfqTitle: selectedRFQ.title,
      price: parseFloat(bidForm.price),
      leadTime: parseInt(bidForm.leadTime),
      moq: parseInt(bidForm.moq),
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      notes: bidForm.notes
    };

    setMyBids(prev => [newBid, ...prev]);
    setBidForm({ price: '', leadTime: '', moq: '', notes: '' });
    setSelectedRFQ(null);
    
    websocketService.updateRFQField(selectedRFQ.id, 'new_bid_received', newBid, 'valid');
    
    alert('Bid submitted successfully!\nRFQ: ' + selectedRFQ.title + '\nYour Price: $' + bidForm.price + '/unit');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-yellow-100 text-yellow-800', 
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price: number) => '$' + price.toFixed(2);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supplier Portal</h1>
          <p className="text-gray-600">Discover RFQs, submit bids, and grow your business</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Company</div>
          <div className="font-medium">Golden Grains Ltd</div>
          <div className="text-sm text-green-600">⭐ 4.8 Rating • 🏆 Verified Supplier</div>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-blue-800 font-medium mb-2">🔔 Recent Notifications</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            {notifications.slice(0, 3).map((notification, index) => (
              <li key={index}>• {notification}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'available', label: 'Available RFQs', count: availableRFQs.length },
            { key: 'my-bids', label: 'My Bids', count: myBids.length },
            { key: 'messages', label: 'Messages', count: 0 },
            { key: 'profile', label: 'Profile', count: 0 }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={'py-2 px-1 border-b-2 font-medium text-sm ' + 
                (activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700')}
            >
              {tab.label} {tab.count > 0 && '(' + tab.count + ')'}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'available' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {availableRFQs.map(rfq => (
              <div key={rfq.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{rfq.title}</h3>
                    <p className="text-sm text-gray-600">{rfq.buyerCompany} • {rfq.buyerCountry}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    {rfq.timeLeft} left
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Quantity</div>
                    <div className="font-medium">{rfq.quantity.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Budget</div>
                    <div className="font-medium">{formatPrice(rfq.budget)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Deadline</div>
                    <div className="font-medium">{new Date(rfq.deadline).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Responses</div>
                    <div className="font-medium">{rfq.responseCount} bids</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Required Certifications</div>
                  <div className="flex flex-wrap gap-1">
                    {rfq.complianceRequirements.map(req => (
                      <span key={req} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedRFQ(rfq)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                  >
                    Submit Bid
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            {selectedRFQ ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Bid</h3>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">{selectedRFQ.title}</h4>
                  <p className="text-sm text-gray-500">{selectedRFQ.buyerCompany}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Unit ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={bidForm.price}
                      onChange={(e) => setBidForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="8.50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Time (days)
                    </label>
                    <input
                      type="number"
                      value={bidForm.leadTime}
                      onChange={(e) => setBidForm(prev => ({ ...prev, leadTime: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="14"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Order Quantity
                    </label>
                    <input
                      type="number"
                      value={bidForm.moq}
                      onChange={(e) => setBidForm(prev => ({ ...prev, moq: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      value={bidForm.notes}
                      onChange={(e) => setBidForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Certifications, special offers, etc."
                    />
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={submitBid}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Submit Bid
                  </button>
                  <button
                    onClick={() => setSelectedRFQ(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">Select an RFQ to submit a bid</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'my-bids' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">My Submitted Bids</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RFQ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">My Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MOQ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myBids.map(bid => (
                  <tr key={bid.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{bid.rfqTitle}</div>
                      {bid.buyerFeedback && (
                        <div className="text-sm text-gray-500 mt-1">💬 {bid.buyerFeedback}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatPrice(bid.price)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{bid.leadTime} days</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{bid.moq.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={'px-2 py-1 text-xs font-semibold rounded-full ' + getStatusColor(bid.status)}>
                        {bid.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(bid.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Supplier Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Company Information</h3>
              <div className="space-y-2">
                <div><span className="font-medium">Company:</span> Golden Grains Ltd</div>
                <div><span className="font-medium">Country:</span> Australia</div>
                <div><span className="font-medium">Rating:</span> ⭐ 4.8/5 (127 reviews)</div>
                <div><span className="font-medium">Verified:</span> ✅ Premium Supplier</div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {['ISO 22000', 'HACCP', 'Organic', 'BRC', 'SQF'].map(cert => (
                  <span key={cert} className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;
