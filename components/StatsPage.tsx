
import React from 'react';
import { motion } from 'framer-motion';
import { CoffeeStats } from '../types';
import { Award, Zap, Clock, Star, GitFork, BarChart3, Coffee } from 'lucide-react';

interface StatsPageProps {
  stats: CoffeeStats;
}

const StatsPage: React.FC<StatsPageProps> = ({ stats }) => {
  const statCards = [
    { label: 'Brew Strength', value: stats.brewStrength, icon: Zap, color: 'text-amber-500' },
    { label: 'Total Stars Collected', value: stats.totalStars, icon: Star, color: 'text-coffee-500' },
    { label: 'Fork Consumptions', value: stats.totalForks, icon: GitFork, color: 'text-coffee-400' },
    { label: 'Roasting History', value: `${stats.accountAgeDays} Days`, icon: Clock, color: 'text-coffee-600' },
    { label: 'Signature Roast', value: stats.mostStarredRepo, icon: Award, color: 'text-amber-600' },
  ];

  return (
    <section className="py-24 bg-white dark:bg-coffee-950 rounded-t-[5rem] shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.1)] min-h-screen relative z-10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-coffee-100 dark:bg-coffee-900 text-coffee-700 dark:text-coffee-300 rounded-full text-xs font-black uppercase tracking-tighter mb-4">
              <BarChart3 size={14} />
              <span>Lab Reports</span>
            </div>
            <h2 className="text-5xl sm:text-7xl font-display font-black text-coffee-950 dark:text-coffee-50 tracking-tight leading-none mb-6">
                Brew Metrics
            </h2>
            <p className="text-coffee-500 dark:text-coffee-400 text-xl font-serif italic max-w-2xl mx-auto">
                Analyzing the chemistry of my contributions and repository success.
            </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {statCards.map((card, idx) => (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-coffee-50 dark:bg-coffee-900/40 p-10 rounded-[3rem] border border-coffee-100 dark:border-coffee-800 shadow-xl flex flex-col items-center text-center group hover:bg-white dark:hover:bg-coffee-900 transition-all"
                >
                    <div className={`p-5 rounded-[1.5rem] bg-white dark:bg-coffee-800 shadow-lg mb-6 ${card.color}`}>
                        <card.icon size={32} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-coffee-400 mb-2">{card.label}</span>
                    <div className="text-3xl font-display font-black text-coffee-900 dark:text-coffee-50 truncate w-full">
                        {card.value}
                    </div>
                </motion.div>
            ))}
        </div>

        <div className="bg-coffee-100/50 dark:bg-coffee-900/20 rounded-[4rem] p-12 border border-coffee-200 dark:border-coffee-800">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
                <div className="flex-1">
                    <h3 className="text-3xl font-display font-black text-coffee-900 dark:text-coffee-100 mb-8">Flavor Profile</h3>
                    <div className="space-y-6">
                        {stats.topLanguages.map((lang, idx) => (
                            <div key={lang.lang} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-black uppercase tracking-widest text-coffee-700 dark:text-coffee-300">{lang.lang}</span>
                                    <span className="text-xs font-bold text-coffee-400">{lang.count} Roasts</span>
                                </div>
                                <div className="h-4 bg-white dark:bg-coffee-800 rounded-full overflow-hidden p-1 shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(lang.count / stats.topLanguages[0].count) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                                        className="h-full bg-coffee-600 dark:bg-coffee-400 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-full lg:w-96 flex flex-col items-center justify-center p-12 bg-white dark:bg-coffee-950 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-coffee-800" />
                    <Coffee size={64} className="text-coffee-800 dark:text-coffee-200 mb-6" />
                    <div className="text-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-coffee-400 mb-2">Verdict</div>
                        <div className="text-2xl font-serif italic font-black text-coffee-900 dark:text-white">
                           "A complex profile with high intensity and robust architecture."
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default StatsPage;
