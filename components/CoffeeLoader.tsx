import React from 'react';
import { motion } from 'framer-motion';

const CoffeeLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-coffee-50">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* 3rd Party Coffee Animation */}
        <motion.img 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src="https://media.giphy.com/media/11c7UUfN4eoHF6/giphy.gif" 
            alt="Brewing Coffee..."
            className="w-full h-full object-contain drop-shadow-lg rounded-full"
        />
      </div>
      
      <motion.p 
        className="mt-8 text-xl font-display font-bold text-coffee-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Brewing Code...
      </motion.p>
      
      <motion.div 
        className="mt-4 h-1 w-48 bg-coffee-200 rounded-full overflow-hidden"
      >
         <motion.div 
            className="h-full bg-coffee-600"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
         />
      </motion.div>
    </div>
  );
};

export default CoffeeLoader;