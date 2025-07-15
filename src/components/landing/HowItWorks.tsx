import React from 'react';
import { motion } from 'framer-motion';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '1',
      title: 'Create Your Company Profile',
      description: 'Set up your business profile with compliance requirements, product categories, and sourcing preferences in under 60 seconds',
      gif: '/gifs/create-profile.gif',
      color: '#1E4C8A',
      icon: '🏢'
    },
    {
      step: '2',
      title: 'AI-Powered Supplier Matching',
      description: 'Our intelligent system finds the perfect suppliers based on your requirements, location, and quality standards',
      gif: '/gifs/supplier-matching.gif',
      color: '#52B788',
      icon: '🤖'
    },
    {
      step: '3',
      title: 'Secure Deal Negotiation',
      description: 'Compare quotes, verify certifications, and negotiate terms with built-in communication tools and AI insights',
      gif: '/gifs/negotiation.gif',
      color: '#FF6B35',
      icon: '🤝'
    },
    {
      step: '4',
      title: 'Real-time Order Tracking',
      description: 'Monitor shipments with live tracking, quality checks, temperature monitoring, and delivery confirmations',
      gif: '/gifs/order-tracking.gif',
      color: '#B08D57',
      icon: '📦'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Start Sourcing in 4 Simple Steps
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From profile creation to delivery tracking - see how FoodXchange transforms your supply chain in minutes
          </p>
        </motion.div>

        {/* Interactive Timeline */}
        <div className="relative max-w-6xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-200 via-green-200 via-orange-200 to-amber-200 hidden lg:block"></div>
          
          {/* Steps */}
          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} flex-col gap-8`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right lg:pr-8' : 'lg:text-left lg:pl-8'} text-center`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-center mb-4">
                      <span className="text-4xl mr-3">{step.icon}</span>
                      <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">{step.description}</p>
                    <div className="flex items-center justify-center space-x-2 text-sm font-medium" style={{ color: step.color }}>
                      <span>Step {step.step}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                </div>
                
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.step}
                  </motion.div>
                </div>
                
                {/* Visual/GIF */}
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:pl-8' : 'lg:pr-8'}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <img 
                      src={step.gif} 
                      alt={step.title}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if GIF fails
                        const target = e.target as HTMLImageElement;
                        target.src = `data:image/svg+xml,%3Csvg width='400' height='256' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad${index}' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='${step.color}' stop-opacity='0.3'/%3E%3Cstop offset='100%25' stop-color='${step.color}' stop-opacity='0.1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grad${index})'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='${step.color}'%3E${step.icon}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-800">{step.title}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};