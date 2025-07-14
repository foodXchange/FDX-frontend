import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

// Interactive AI Chat Demo
export const AIChatDemo: React.FC<{ className?: string }> = ({ className }) => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'Hi! I\'m your AI procurement assistant. How can I help you today?' }
  ]);
  const [currentDemo, setCurrentDemo] = useState(0);

  const demoScenarios = [
    {
      userMessage: "Find organic apple suppliers near New York",
      aiResponse: "I found 12 certified organic apple suppliers within 100 miles of New York. Top 3 matches:\n\n🥇 GreenHarvest Farms (95% match)\n• USDA Organic certified\n• $2.45/lb average price\n• 4.8/5 rating\n\n🥈 Valley Organic Co. (92% match)\n• Multiple certifications\n• $2.60/lb average price\n• 4.7/5 rating\n\n🥉 Northeast Organics (89% match)\n• Family-owned since 1985\n• $2.50/lb average price\n• 4.6/5 rating\n\nWould you like me to create an RFQ for any of these suppliers?"
    },
    {
      userMessage: "What's the market price trend for salmon?",
      aiResponse: "🐟 Atlantic Salmon Market Analysis:\n\n📈 Current Price: $8.25/lb (↑2.3% this week)\n📊 30-day trend: Steady increase (+8.5%)\n🔮 Forecast: Prices expected to stabilize next month\n\n🌟 Key Insights:\n• Seasonal demand increase affecting prices\n• Chilean supply disruption causing shortage\n• Recommended action: Lock in prices for Q4 orders\n\nShall I help you find salmon suppliers with competitive pricing?"
    },
    {
      userMessage: "Check compliance for my dairy suppliers",
      aiResponse: "🛡️ Compliance Status Summary:\n\n✅ 8 suppliers fully compliant\n⚠️ 2 suppliers need attention:\n\n• Alpine Dairy: FDA inspection due in 15 days\n• Mountain Creamery: HACCP certificate expires next month\n\n📋 Actions Required:\n1. Contact Alpine Dairy for inspection update\n2. Request renewed HACCP cert from Mountain Creamery\n\n🎯 Overall Compliance Score: 94.2%\n\nWould you like me to send automated reminders to these suppliers?"
    }
  ];

  const runDemo = () => {
    const scenario = demoScenarios[currentDemo];
    
    // Add user message
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'user',
        text: scenario.userMessage
      }]);
    }, 500);

    // Add AI response with typing effect
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: scenario.aiResponse
      }]);
    }, 1500);

    setCurrentDemo((prev) => (prev + 1) % demoScenarios.length);
  };

  return (
    <div className={cn('glass-morphism rounded-xl p-4', className)}>
      <div className="flex items-center mb-4">
        <SparklesIcon className="w-5 h-5 text-purple-600 mr-2" />
        <h3 className="font-semibold text-gray-900">AI Assistant Demo</h3>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 h-64 overflow-y-auto mb-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mb-3 p-2 rounded-lg max-w-[85%]',
                message.type === 'user' 
                  ? 'bg-blue-500 text-white ml-auto' 
                  : 'bg-white text-gray-900'
              )}
            >
              <div className="text-sm whitespace-pre-line">{message.text}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Button onClick={runDemo} size="sm" className="w-full">
        Try Demo Scenario {currentDemo + 1}
      </Button>
    </div>
  );
};

// Live Market Data Demo
export const MarketDataDemo: React.FC<{ className?: string }> = ({ className }) => {
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [animatingPrice, setAnimatingPrice] = useState(false);

  const marketData = [
    {
      name: 'Atlantic Salmon',
      price: 8.25,
      change: 2.3,
      trend: 'up',
      volume: '12,450 lbs',
      suppliers: 24
    },
    {
      name: 'Organic Apples',
      price: 2.45,
      change: -1.2,
      trend: 'down',
      volume: '45,200 lbs',
      suppliers: 18
    },
    {
      name: 'Premium Beef',
      price: 15.80,
      change: 4.1,
      trend: 'up',
      volume: '8,900 lbs',
      suppliers: 12
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatingPrice(true);
      setTimeout(() => setAnimatingPrice(false), 500);
      setSelectedProduct((prev) => (prev + 1) % marketData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentProduct = marketData[selectedProduct];

  return (
    <div className={cn('glass-morphism rounded-xl p-4', className)}>
      <div className="flex items-center mb-4">
        <ChartBarIcon className="w-5 h-5 text-green-600 mr-2" />
        <h3 className="font-semibold text-gray-900">Live Market Data</h3>
      </div>

      <div className="space-y-3">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
          <h4 className="font-medium text-gray-900 mb-2">{currentProduct.name}</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-600">Current Price</div>
              <motion.div 
                className="text-lg font-bold text-green-600"
                animate={animatingPrice ? { scale: [1, 1.1, 1] } : {}}
              >
                ${currentProduct.price}
              </motion.div>
            </div>
            
            <div>
              <div className="text-xs text-gray-600">24h Change</div>
              <div className={cn(
                'text-sm font-semibold',
                currentProduct.change > 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {currentProduct.change > 0 ? '+' : ''}{currentProduct.change}%
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-600">Volume</div>
              <div className="text-sm font-medium">{currentProduct.volume}</div>
            </div>
            
            <div>
              <div className="text-xs text-gray-600">Suppliers</div>
              <div className="text-sm font-medium">{currentProduct.suppliers}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {marketData.map((product, index) => (
            <button
              key={product.name}
              onClick={() => setSelectedProduct(index)}
              className={cn(
                'p-2 rounded-lg text-xs transition-all',
                index === selectedProduct 
                  ? 'bg-blue-100 border-2 border-blue-300' 
                  : 'bg-gray-100 hover:bg-gray-200'
              )}
            >
              {product.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Supplier Matching Demo
export const SupplierMatchDemo: React.FC<{ className?: string }> = ({ className }) => {
  const [matchingStage, setMatchingStage] = useState(0);
  const [isMatching, setIsMatching] = useState(false);

  const matchingStages = [
    'Analyzing requirements...',
    'Searching supplier database...',
    'Calculating compatibility scores...',
    'Ranking by performance...',
    'Match complete!'
  ];

  const suppliers = [
    {
      name: 'FreshFarms Co.',
      match: 96,
      location: 'California',
      specialty: 'Organic Produce',
      rating: 4.8,
      certifications: ['USDA Organic', 'GAP']
    },
    {
      name: 'GreenHarvest',
      match: 94,
      location: 'Oregon',
      specialty: 'Sustainable Farming',
      rating: 4.7,
      certifications: ['Organic', 'Fair Trade']
    },
    {
      name: 'Valley Organics',
      match: 89,
      location: 'Washington',
      specialty: 'Premium Fruits',
      rating: 4.6,
      certifications: ['USDA Organic']
    }
  ];

  const startMatching = () => {
    setIsMatching(true);
    setMatchingStage(0);

    const interval = setInterval(() => {
      setMatchingStage(prev => {
        if (prev >= matchingStages.length - 1) {
          clearInterval(interval);
          setIsMatching(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  return (
    <div className={cn('glass-morphism rounded-xl p-4', className)}>
      <div className="flex items-center mb-4">
        <UserGroupIcon className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="font-semibold text-gray-900">AI Supplier Matching</h3>
      </div>

      {!isMatching && matchingStage < matchingStages.length - 1 ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Looking for:</div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="font-medium">Organic Apples</div>
              <div className="text-sm text-gray-600">5000 lbs • USDA Organic • California preferred</div>
            </div>
          </div>
          <Button onClick={startMatching} size="sm">
            Find Suppliers
          </Button>
        </div>
      ) : isMatching ? (
        <div className="text-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <div className="text-sm text-gray-600">{matchingStages[matchingStage]}</div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 mb-3">Top Matches Found:</div>
          {suppliers.map((supplier, index) => (
            <motion.div
              key={supplier.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-lg p-3 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-sm">{supplier.name}</h4>
                  <div className="text-xs text-gray-600">{supplier.location} • {supplier.specialty}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{supplier.match}%</div>
                  <div className="text-xs text-gray-600">match</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-xs text-yellow-600">★ {supplier.rating}</div>
                </div>
                <div className="flex gap-1">
                  {supplier.certifications.map(cert => (
                    <span key={cert} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Compliance Checker Demo
export const ComplianceDemo: React.FC<{ className?: string }> = ({ className }) => {
  const [checkingCompliance, setCheckingCompliance] = useState(false);
  const [complianceResults, setComplianceResults] = useState<any>(null);

  const runComplianceCheck = () => {
    setCheckingCompliance(true);
    
    setTimeout(() => {
      setComplianceResults({
        overallScore: 96,
        checks: [
          { name: 'USDA Organic', status: 'passed', expiry: '2025-03-15' },
          { name: 'FDA Registration', status: 'passed', expiry: '2024-12-31' },
          { name: 'HACCP Certification', status: 'warning', expiry: '2024-08-20', message: 'Expires soon' },
          { name: 'GAP Certification', status: 'passed', expiry: '2025-06-10' }
        ]
      });
      setCheckingCompliance(false);
    }, 2000);
  };

  return (
    <div className={cn('glass-morphism rounded-xl p-4', className)}>
      <div className="flex items-center mb-4">
        <ShieldCheckIcon className="w-5 h-5 text-green-600 mr-2" />
        <h3 className="font-semibold text-gray-900">Compliance Checker</h3>
      </div>

      {!complianceResults ? (
        <div className="text-center py-6">
          {checkingCompliance ? (
            <div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              </motion.div>
              <div className="text-sm text-gray-600">Checking compliance...</div>
            </div>
          ) : (
            <div>
              <div className="text-sm text-gray-600 mb-4">
                Verify supplier compliance automatically
              </div>
              <Button onClick={runComplianceCheck} size="sm">
                Check Compliance
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{complianceResults.overallScore}%</div>
            <div className="text-sm text-gray-600">Compliance Score</div>
          </div>

          <div className="space-y-2">
            {complianceResults.checks.map((check: any, index: number) => (
              <motion.div
                key={check.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 bg-white rounded-lg border"
              >
                <div className="flex items-center">
                  <div className={cn(
                    'w-2 h-2 rounded-full mr-2',
                    check.status === 'passed' ? 'bg-green-500' :
                    check.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  )} />
                  <span className="text-sm font-medium">{check.name}</span>
                </div>
                <div className="text-xs text-gray-600">
                  {check.message || `Expires ${check.expiry}`}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Order Tracking Demo
export const OrderTrackingDemo: React.FC<{ className?: string }> = ({ className }) => {
  const [selectedOrder, setSelectedOrder] = useState(0);

  const orders = [
    {
      id: 'ORD-2024-001',
      product: 'Organic Apples',
      supplier: 'FreshFarms Co.',
      status: 'in_transit',
      progress: 75,
      eta: '2 hours',
      updates: [
        { time: '09:00', status: 'Picked up from warehouse' },
        { time: '11:30', status: 'In transit - Route 101' },
        { time: '13:45', status: 'Expected delivery: 15:30' }
      ]
    },
    {
      id: 'ORD-2024-002',
      product: 'Premium Salmon',
      supplier: 'Ocean Fresh Ltd.',
      status: 'preparing',
      progress: 25,
      eta: '6 hours',
      updates: [
        { time: '08:00', status: 'Order confirmed' },
        { time: '09:15', status: 'Preparing shipment' }
      ]
    }
  ];

  const currentOrder = orders[selectedOrder];

  return (
    <div className={cn('glass-morphism rounded-xl p-4', className)}>
      <div className="flex items-center mb-4">
        <TruckIcon className="w-5 h-5 text-orange-600 mr-2" />
        <h3 className="font-semibold text-gray-900">Live Order Tracking</h3>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2 mb-3">
          {orders.map((order, index) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(index)}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition-all',
                index === selectedOrder 
                  ? 'bg-orange-100 text-orange-800 border border-orange-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {order.id}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg p-3 border">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-medium text-sm">{currentOrder.product}</h4>
              <div className="text-xs text-gray-600">{currentOrder.supplier}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-orange-600">
                ETA: {currentOrder.eta}
              </div>
              <div className="text-xs text-gray-600 capitalize">
                {currentOrder.status.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{currentOrder.progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                initial={{ width: 0 }}
                animate={{ width: `${currentOrder.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700 mb-2">Recent Updates:</div>
            {currentOrder.updates.map((update, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-between text-xs"
              >
                <span className="text-gray-600">{update.time}</span>
                <span className="font-medium text-gray-900">{update.status}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Demo Showcase Component
export const DemoShowcase: React.FC<{ className?: string }> = ({ className }) => {
  const [activeDemo, setActiveDemo] = useState(0);

  const demos = [
    { component: AIChatDemo, title: 'AI Assistant', icon: SparklesIcon },
    { component: MarketDataDemo, title: 'Market Data', icon: ChartBarIcon },
    { component: SupplierMatchDemo, title: 'Supplier Matching', icon: UserGroupIcon },
    { component: ComplianceDemo, title: 'Compliance Check', icon: ShieldCheckIcon },
    { component: OrderTrackingDemo, title: 'Order Tracking', icon: TruckIcon }
  ];

  const ActiveDemoComponent = demos[activeDemo].component;

  return (
    <div className={cn('glass-morphism rounded-xl p-6', className)}>
      <h2 className="text-xl font-bold mb-6 gradient-text text-center">
        Platform Capabilities Demo
      </h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {demos.map((demo, index) => {
          const IconComponent = demo.icon;
          return (
            <button
              key={demo.title}
              onClick={() => setActiveDemo(index)}
              className={cn(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all',
                index === activeDemo
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {demo.title}
            </button>
          );
        })}
      </div>

      <div className="min-h-[400px]">
        <ActiveDemoComponent />
      </div>
    </div>
  );
};