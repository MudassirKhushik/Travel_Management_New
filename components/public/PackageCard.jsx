'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function PackageCard({ title, description, image, price, duration }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10"
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full text-sm font-medium">
          {duration} days
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">${price}</span>
          <span className="text-sm text-gray-400">per person</span>
        </div>

        <div className="mt-4 flex gap-3">
          <motion.button
            className="flex-1 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Show Details
          </motion.button>
          <motion.button
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book Slot
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}