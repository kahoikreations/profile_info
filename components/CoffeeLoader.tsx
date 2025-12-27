
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import lottie from 'lottie-web';

const CoffeeLoader: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const anim = lottie.loadAnimation({
      container: container.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'https://lottie.host/8c158572-8848-4394-811c-66885834863e/5A2Y7t3f00.json'
    });
    return () => anim.destroy();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-coffee-50 dark:bg-coffee-950">
      <div className="relative w-80 h-80 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full h-full"
          ref={container}
        />
        <div className="absolute -top-10 w-full h-full flex justify-center items-start opacity-30 pointer-events-none">
          <motion.div animate={{ y: [0, -60], opacity: [0, 0.6, 0], scale: [0.8, 1.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-5xl">♨️</motion.div>
          <motion.div animate={{ y: [0, -80], opacity: [0, 0.5, 0], scale: [0.7, 1.2] }} transition={{ repeat: Infinity, duration: 2, delay: 0.3 }} className="text-4xl ml-6">♨️</motion.div>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <motion.p 
          className="text-3xl font-display font-black text-coffee-900 dark:text-coffee-50 tracking-[0.3em] uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          The Daily Brew
        </motion.p>
        <motion.p 
          className="text-coffee-500 dark:text-coffee-400 font-bold mt-2 tracking-widest text-xs uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Roasting bits & bytes...
        </motion.p>
      </div>
      
      <div className="mt-10 h-1.5 w-64 bg-coffee-100 dark:bg-coffee-900 rounded-full overflow-hidden shadow-inner border border-coffee-200 dark:border-coffee-800">
         <motion.div 
            className="h-full bg-coffee-700 dark:bg-coffee-400 shadow-[0_0_10px_rgba(111,69,59,0.5)]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: "linear" }}
         />
      </div>
    </div>
  );
};

export default CoffeeLoader;
