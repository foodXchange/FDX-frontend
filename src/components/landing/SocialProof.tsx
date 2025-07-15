import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const SocialProof: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const testimonials = [
    {
      quote: "FoodXchange reduced our sourcing time by 60% and helped us find suppliers we never would have discovered on our own.",
      author: "Sarah Chen",
      position: "Procurement Director",
      company: "Global Foods Inc",
      avatar: "SC",
      metrics: "60% faster sourcing",
      videoThumbnail: "/images/testimonial-sarah.jpg",
      videoUrl: "https://player.vimeo.com/video/123456789",
      hasVideo: true
    },
    {
      quote: "The compliance automation is a game-changer. We went from weeks to days for regulatory approvals.",
      author: "Michael Rodriguez",
      position: "Supply Chain Manager",
      company: "Fresh Supply Co",
      avatar: "MR",
      metrics: "3x faster approvals",
      videoThumbnail: "/images/testimonial-michael.jpg",
      videoUrl: "https://player.vimeo.com/video/123456790",
      hasVideo: true
    },
    {
      quote: "Real-time tracking and temperature monitoring gave us complete visibility into our perishable shipments.",
      author: "Emma Thompson",
      position: "Import Manager",
      company: "Quality Imports LLC",
      avatar: "ET",
      metrics: "99.5% on-time delivery",
      videoThumbnail: "/images/testimonial-emma.jpg",
      videoUrl: "",
      hasVideo: false
    }
  ];

  const stats = [
    { number: "500+", label: "Active Importers", color: "#1E4C8A" },
    { number: "10,000+", label: "Verified Suppliers", color: "#FF6B35" },
    { number: "50+", label: "Countries", color: "#52B788" },
    { number: "$2B+", label: "Trade Volume", color: "#B08D57" }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of food companies transforming their supply chains
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-bold mb-2" style={{ color: stat.color }}>
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Video Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {testimonial.hasVideo ? (
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="relative z-10 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
                      onClick={() => setSelectedVideo(testimonial.videoUrl)}
                    >
                      <svg className="w-6 h-6 text-orange-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </motion.button>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="font-bold">{testimonial.author}</div>
                      <div className="text-sm opacity-90">{testimonial.position}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-6"></div>
              )}
              
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-md"
                    style={{ backgroundColor: '#FF6B35' }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.position}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.quote}"</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="font-medium text-green-600">
                      {testimonial.metrics}
                    </span>
                  </div>
                  {testimonial.hasVideo && (
                    <span className="text-xs text-gray-500">
                      Watch full story
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Case Study CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Join These Success Stories?
          </h3>
          <p className="text-gray-600 mb-6">
            See how FoodXchange can transform your sourcing process in just 14 days
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors"
            >
              Read Full Case Studies
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-bold hover:border-gray-400 transition-colors"
            >
              Schedule a Demo
            </motion.button>
          </div>
        </motion.div>
      </div>
      
      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
            >
              ×
            </button>
            <div className="relative pb-[56.25%] h-0">
              <iframe 
                src={selectedVideo}
                title="Customer testimonial video"
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};