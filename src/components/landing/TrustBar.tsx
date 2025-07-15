import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, GlobeAltIcon, CheckBadgeIcon, TrophyIcon } from '@heroicons/react/24/outline';

export const TrustBar: React.FC = () => {
  const clients = [
    { name: 'Nestlé', logo: 'N', color: 'from-red-500 via-orange-500 to-yellow-500' },
    { name: 'Unilever', logo: 'U', color: 'from-blue-500 via-indigo-500 to-purple-500' },
    { name: 'PepsiCo', logo: 'P', color: 'from-blue-600 via-red-500 to-pink-500' },
    { name: 'Kraft Heinz', logo: 'K', color: 'from-yellow-500 via-orange-500 to-red-500' },
    { name: 'Tyson Foods', logo: 'T', color: 'from-green-500 via-emerald-500 to-blue-500' },
    { name: 'Cargill', logo: 'C', color: 'from-amber-500 via-orange-500 to-red-500' },
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 text-violet-600 text-sm font-medium mb-6">
              <TrophyIcon className="w-4 h-4 mr-2" />
              Trusted by Industry Leaders
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Join{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
                500+ Companies
              </span>
              <br />
              Already Scaling with Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From Fortune 500 to innovative startups, leading companies choose FoodXchange
            </p>
          </motion.div>
        </div>

        {/* Client Logos with Enhanced Design */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-24">
          {clients.map((client, index) => (
            <motion.div 
              key={index} 
              className="flex flex-col items-center group"
              initial={{ opacity: 0, y: 30, rotateY: -90 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
            >
              <div className="relative mb-4">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${client.color} flex items-center justify-center text-white font-black text-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3`}>
                  {client.logo}
                </div>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-sm text-gray-600 font-semibold group-hover:text-gray-900 transition-colors">
                {client.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators with Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: ShieldCheckIcon,
              title: "ISO 27001 Certified",
              description: "Enterprise Security",
              color: "from-emerald-500 to-green-500",
              bgColor: "from-emerald-500/10 to-green-500/10"
            },
            {
              icon: CheckBadgeIcon,
              title: "SOC 2 Type II",
              description: "Data Protection",
              color: "from-blue-500 to-indigo-500",
              bgColor: "from-blue-500/10 to-indigo-500/10"
            },
            {
              icon: GlobeAltIcon,
              title: "GDPR Compliant",
              description: "Global Standards",
              color: "from-purple-500 to-violet-500",
              bgColor: "from-purple-500/10 to-violet-500/10"
            }
          ].map((item, index) => (
            <motion.div 
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className={`relative p-8 rounded-3xl bg-gradient-to-r ${item.bgColor} backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300`}>
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center mr-4 shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div 
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: "500+", label: "Companies" },
              { number: "50+", label: "Countries" },
              { number: "99.9%", label: "Uptime" },
              { number: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-2">
                  {stat.number}
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};