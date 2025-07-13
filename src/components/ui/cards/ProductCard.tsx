import { Badge } from '../Badge';
import { ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
  id: string;
  name: string;
  supplier: string;
  image: string;
  price: string;
  moq: string;
  certifications: string[];
  leadTime: string;
  verified: boolean;
  onView: () => void;
  onRequestSample: () => void;
  onQuickRFQ: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  name,
  supplier,
  image,
  price,
  moq,
  certifications,
  leadTime,
  verified,
  onView,
  onRequestSample,
  onQuickRFQ
}) => {
  return (
    <div className="group relative bg-white rounded-xl shadow-md card-hover overflow-hidden">
      <div className="aspect-w-16 aspect-h-9 relative">
        <img src={image} alt={name} className="w-full h-48 object-cover" />
        {verified && (
          <div className="absolute top-2 right-2">
            <div className="bg-[#1E4C8A] text-white p-2 rounded-full">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {certifications.slice(0, 3).map((cert, i) => (
            <Badge key={i} variant="certification" size="sm">{cert}</Badge>
          ))}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-600 mb-3">{supplier}</p>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Price</span>
            <span className="font-semibold text-[#B08D57]">{price}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">MOQ</span>
            <span className="font-medium">{moq}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <ClockIcon className="w-4 h-4" />
            <span>{leadTime}</span>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onView} className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
            View
          </button>
          <button onClick={onRequestSample} className="flex-1 px-3 py-2 bg-[#52B788] text-white hover:bg-[#2D7A5F] rounded-lg text-sm font-medium transition-colors">
            Sample
          </button>
          <button onClick={onQuickRFQ} className="flex-1 px-3 py-2 btn-primary rounded-lg text-sm font-medium">
            RFQ
          </button>
        </div>
      </div>
    </div>
  );
};