import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

interface RFQ {
  id: string;
  productName: string;
  category: string;
  quantity: string;
  targetPrice: string;
  deadline: string;
  status: 'draft' | 'active' | 'closed' | 'awarded';
  supplierCount: number;
  createdAt: string;
  description?: string;
}

interface RFQListProps {
  rfqs?: RFQ[];
  onView?: (rfq: RFQ) => void;
  onEdit?: (rfq: RFQ) => void;
  onDelete?: (rfq: RFQ) => void;
  onCreate?: () => void;
}

const mockRFQs: RFQ[] = [
  {
    id: 'RFQ-001',
    productName: 'Organic Cornflakes',
    category: 'Cereals',
    quantity: '1,000 kg',
    targetPrice: '$3,500',
    deadline: '2024-01-15',
    status: 'active',
    supplierCount: 5,
    createdAt: '2024-01-01',
    description: 'High-quality organic cornflakes for retail distribution'
  },
  {
    id: 'RFQ-002',
    productName: 'Gluten-Free Pasta',
    category: 'Pasta',
    quantity: '500 kg',
    targetPrice: '$2,200',
    deadline: '2024-01-20',
    status: 'active',
    supplierCount: 3,
    createdAt: '2024-01-02',
  },
  {
    id: 'RFQ-003',
    productName: 'Almond Milk',
    category: 'Dairy Alternatives',
    quantity: '2,000 L',
    targetPrice: '$4,800',
    deadline: '2024-01-18',
    status: 'closed',
    supplierCount: 8,
    createdAt: '2023-12-28',
  },
  {
    id: 'RFQ-004',
    productName: 'Quinoa Flour',
    category: 'Flours',
    quantity: '750 kg',
    targetPrice: '$1,800',
    deadline: '2024-01-25',
    status: 'draft',
    supplierCount: 0,
    createdAt: '2024-01-03',
  },
];

const getStatusColor = (status: RFQ['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    case 'awarded':
      return 'bg-blue-100 text-blue-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const StatusBadge = ({ status }: { status: RFQ['status'] }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

export function RFQList({ 
  rfqs = mockRFQs, 
  onView, 
  onEdit, 
  onDelete, 
  onCreate 
}: RFQListProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [sortField, setSortField] = useState<keyof RFQ>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort RFQs
  const filteredAndSortedRFQs = rfqs
    .filter(rfq => 
      rfq.productName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      rfq.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      rfq.category.toLowerCase().includes(searchFilter.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      
      // Handle undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1 * modifier;
      if (bValue == null) return -1 * modifier;
      
      if (aValue < bValue) return -1 * modifier;
      if (aValue > bValue) return 1 * modifier;
      return 0;
    });

  const handleSort = (field: keyof RFQ) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <Card variant="default" shadow="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>RFQ Management</CardTitle>
          <Button
            onClick={onCreate}
            leftIcon={<PlusIcon className="h-4 w-4" />}
          >
            Create RFQ
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search RFQs..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  <button
                    onClick={() => handleSort('id')}
                    className="hover:text-gray-900 transition-colors"
                  >
                    RFQ ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  <button
                    onClick={() => handleSort('productName')}
                    className="hover:text-gray-900 transition-colors"
                  >
                    Product {sortField === 'productName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  <button
                    onClick={() => handleSort('quantity')}
                    className="hover:text-gray-900 transition-colors"
                  >
                    Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  <button
                    onClick={() => handleSort('targetPrice')}
                    className="hover:text-gray-900 transition-colors"
                  >
                    Target Price {sortField === 'targetPrice' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  <button
                    onClick={() => handleSort('deadline')}
                    className="hover:text-gray-900 transition-colors"
                  >
                    Deadline {sortField === 'deadline' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  <button
                    onClick={() => handleSort('status')}
                    className="hover:text-gray-900 transition-colors"
                  >
                    Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Suppliers</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedRFQs.map((rfq) => (
                <tr
                  key={rfq.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 text-sm">
                    <div className="font-mono text-sm text-blue-600">
                      {rfq.id}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{rfq.productName}</div>
                      <div className="text-sm text-gray-500">{rfq.category}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="font-medium">{rfq.quantity}</div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="font-medium text-green-600">{rfq.targetPrice}</div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="text-sm">
                      {new Date(rfq.deadline).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <StatusBadge status={rfq.status} />
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {rfq.supplierCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView?.(rfq)}
                        leftIcon={<EyeIcon className="h-4 w-4" />}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(rfq)}
                        leftIcon={<PencilIcon className="h-4 w-4" />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(rfq)}
                        leftIcon={<TrashIcon className="h-4 w-4" />}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Results count */}
        <div className="mt-6 text-sm text-gray-700">
          Showing {filteredAndSortedRFQs.length} of {rfqs.length} RFQs
        </div>
      </CardContent>
    </Card>
  );
}