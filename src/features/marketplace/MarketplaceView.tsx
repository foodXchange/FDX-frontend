import { useState } from 'react';
import { ProductCard } from '../../components/ui/cards/ProductCard';
import { FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

const mockProducts = [
  {
    id: '1',
    name: 'Organic Quinoa Flour',
    supplier: 'Global Grains Co.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    price: '$4.50/kg',
    moq: '500kg',
    certifications: ['Organic', 'Non-GMO', 'Gluten-Free'],
    leadTime: '2-3 weeks',
    verified: true
  },
  {
    id: '2',
    name: 'Premium Olive Oil',
    supplier: 'Mediterranean Imports',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    price: '$12.00/L',
    moq: '200L',
    certifications: ['Organic', 'PDO'],
    leadTime: '3-4 weeks',
    verified: true
  }
];

export const MarketplaceView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-16 z-40 glass-morphism">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
              <span className="text-sm text-gray-500">2,847 products</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                <FunnelIcon className="w-5 h-5" />
                <span>Filters</span>
              </button>
              <div className="flex bg-white/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-6">
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {mockProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onView={() => console.log('View', product.id)}
              onRequestSample={() => console.log('Sample', product.id)}
              onQuickRFQ={() => console.log('RFQ', product.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};