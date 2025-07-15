import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const StickyCTA: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show sticky CTA when user scrolls down past hero section
      if (window.pageYOffset > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 p-4 z-50 md:hidden"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.a
              href="/register"
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg font-bold text-center hover:bg-orange-700 transition-colors inline-block"
            >
              Start Free Trial
            </motion.a>
            <motion.a
              href="/login"
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-bold text-center hover:bg-blue-700 transition-colors inline-block"
            >
              Login
            </motion.a>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            No credit card required • Free trial
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};