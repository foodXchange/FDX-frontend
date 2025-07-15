import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const ROICalculator: React.FC = () => {
  const [monthlyRFQs, setMonthlyRFQs] = useState(50);
  const [avgOrderValue, setAvgOrderValue] = useState(25000);
  const [currentProcessTime, setCurrentProcessTime] = useState(7);

  const calculateSavings = () => {
    const timeSaved = currentProcessTime * 0.6; // 60% time reduction
    const costSavings = avgOrderValue * 0.15; // 15% cost reduction
    const monthlySavings = monthlyRFQs * costSavings;
    const yearlySavings = monthlySavings * 12;
    
    return {
      timeSaved: Math.round(timeSaved),
      monthlySavings: Math.round(monthlySavings),
      yearlySavings: Math.round(yearlySavings),
      efficiency: Math.round((timeSaved / currentProcessTime) * 100)
    };
  };

  const savings = calculateSavings();

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-orange-600">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Calculator */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-6">
                Calculate Your ROI
              </h3>
              <p className="text-blue-100 mb-8">
                See how much you could save with FoodXchange's automated sourcing platform
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Monthly RFQs: {monthlyRFQs}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={monthlyRFQs}
                    onChange={(e) => setMonthlyRFQs(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-blue-200 mt-1">
                    <span>10</span>
                    <span>200</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">
                    Average Order Value: ${avgOrderValue.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="5000"
                    max="100000"
                    step="1000"
                    value={avgOrderValue}
                    onChange={(e) => setAvgOrderValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-blue-200 mt-1">
                    <span>$5K</span>
                    <span>$100K</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">
                    Current Process Time: {currentProcessTime} days
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={currentProcessTime}
                    onChange={(e) => setCurrentProcessTime(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-blue-200 mt-1">
                    <span>1 day</span>
                    <span>30 days</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Results */}
            <div className="text-white">
              <motion.div
                key={savings.yearlySavings}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
              >
                <div className="text-6xl font-bold text-orange-300 mb-2">
                  ${savings.yearlySavings.toLocaleString()}
                </div>
                <div className="text-xl text-blue-100">
                  Estimated Annual Savings
                </div>
              </motion.div>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-orange-300">
                    {savings.timeSaved}
                  </div>
                  <div className="text-sm text-blue-200">
                    Days Saved per RFQ
                  </div>
                </motion.div>
                
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-orange-300">
                    ${savings.monthlySavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-200">
                    Monthly Savings
                  </div>
                </motion.div>
                
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-orange-300">
                    {savings.efficiency}%
                  </div>
                  <div className="text-sm text-blue-200">
                    Efficiency Gain
                  </div>
                </motion.div>
                
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-orange-300">
                    15%
                  </div>
                  <div className="text-sm text-blue-200">
                    Cost Reduction
                  </div>
                </motion.div>
              </div>
              
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-orange-700 transition-colors shadow-lg"
                >
                  Start Saving Today
                </motion.button>
                <p className="text-sm text-blue-200 mt-2">
                  See these savings in your first month
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};