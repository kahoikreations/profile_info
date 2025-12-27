
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Activity, AlertCircle, Info, Coffee, Clock, Zap } from 'lucide-react';
import { GitHubRepo } from '../types';
import { fetchRepoParticipation } from '../services/githubService';

interface RepoStatsModalProps {
  repo: GitHubRepo;
  onClose: () => void;
}

const RepoStatsModal: React.FC<RepoStatsModalProps> = ({ repo, onClose }) => {
  const [data, setData] = useState<{ all: number[], owner: number[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      setLoading(true);
      try {
        const stats = await fetchRepoParticipation(repo.name);
        if (mounted) {
          setData(stats);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) setLoading(false);
      }
    };
    loadStats();
    return () => { mounted = false; };
  }, [repo.name]);

  const { maxCommit, totalCommits, hasActivity } = useMemo(() => {
    if (!data || !data.all) return { maxCommit: 1, totalCommits: 0, hasActivity: false };
    const total = data.all.reduce((a, b) => a + b, 0);
    return {
      maxCommit: Math.max(...data.all, 1),
      totalCommits: total,
      hasActivity: total > 0
    };
  }, [data]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-coffee-950/85 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-coffee-900 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden border border-coffee-200/50 dark:border-coffee-700/50"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-coffee-400 via-coffee-600 to-coffee-800" />
        
        <div className="p-8 sm:p-10">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-2 text-coffee-500 dark:text-coffee-400 mb-1">
                        <Activity size={16} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Caffeine Levels & Output</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-display font-black text-coffee-950 dark:text-coffee-50 leading-none">
                      {repo.name}
                    </h3>
                </div>
                <button 
                    onClick={onClose}
                    className="p-3 rounded-full bg-coffee-50 dark:bg-coffee-800/50 text-coffee-400 hover:text-coffee-900 dark:hover:text-white transition-all active:scale-90"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="min-h-[280px] flex flex-col bg-coffee-50/50 dark:bg-black/20 rounded-[2rem] border border-coffee-100 dark:border-coffee-800/50 p-6 sm:p-8 relative">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 border-4 border-coffee-200 dark:border-coffee-800 border-t-coffee-700 dark:border-t-coffee-400 rounded-full animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Coffee size={14} className="text-coffee-700 dark:text-coffee-400" />
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-coffee-400 uppercase tracking-[0.3em] animate-pulse">Grinding Yearly Stats...</span>
                    </div>
                ) : data && hasActivity ? (
                    <div className="w-full flex-1 flex flex-col">
                        <div className="flex-1 flex items-end justify-between gap-[2px] sm:gap-1 w-full h-40 pt-4 px-1">
                            {data.all.map((count, i) => {
                                const heightPercent = (count / maxCommit) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${Math.max(heightPercent, count > 0 ? 5 : 0)}%` }}
                                            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: i * 0.008 }}
                                            className={`w-full rounded-full transition-all relative overflow-hidden ${
                                              count > 0 
                                              ? 'bg-gradient-to-t from-coffee-800 via-coffee-600 to-coffee-400 dark:from-coffee-500 dark:via-coffee-400 dark:to-coffee-300' 
                                              : 'bg-coffee-200/30 dark:bg-coffee-800/20'
                                            }`}
                                        >
                                            {count > 0 && (
                                              <motion.div 
                                                animate={{ opacity: [0.3, 0.6, 0.3], y: [0, -10, 0] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 bg-white/20 blur-sm"
                                              />
                                            )}
                                        </motion.div>
                                        
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-coffee-950 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 font-black shadow-2xl transition-all translate-y-2 group-hover:translate-y-0 border border-coffee-800">
                                            <span className="text-coffee-400 mr-2">WEEK {52 - i}:</span>
                                            {count} {count === 1 ? 'COMMIT' : 'COMMITS'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-coffee-400/70 pt-4 border-t border-coffee-200/50 dark:border-coffee-800/50">
                            <span className="flex items-center gap-1.5"><Clock size={10} /> 12 MONTHS AGO</span>
                            <div className="flex gap-4">
                               <div className="flex items-center gap-1.5">
                                 <div className="w-2 h-2 rounded-full bg-coffee-500" />
                                 <span>ACTIVITY</span>
                               </div>
                            </div>
                            <span>PRESENT DAY</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                        <div className="w-16 h-16 bg-coffee-100 dark:bg-coffee-800/50 rounded-full flex items-center justify-center mb-4">
                          <AlertCircle size={32} className="text-coffee-300 dark:text-coffee-600" />
                        </div>
                        <h4 className="text-coffee-900 dark:text-coffee-100 font-bold mb-1">Cold Brew Alert</h4>
                        <p className="text-coffee-500 dark:text-coffee-400 text-xs max-w-[200px] leading-relaxed">
                            {data ? "No activity recorded in the last 52 weeks. Time for a fresh batch?" : "GitHub is still preparing these metrics. Please try again in a few minutes."}
                        </p>
                        {data && (
                           <button onClick={onClose} className="mt-6 px-6 py-2 bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-900 rounded-full text-[10px] font-black uppercase tracking-widest">
                             Got it
                           </button>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="p-6 bg-coffee-50 dark:bg-coffee-900/40 rounded-3xl border border-coffee-100 dark:border-coffee-800/50 flex items-center gap-5 transition-transform hover:scale-[1.02]">
                    <div className="w-12 h-12 flex-shrink-0 bg-white dark:bg-coffee-800 rounded-2xl shadow-sm flex items-center justify-center text-coffee-600 dark:text-coffee-400">
                        <Activity size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-coffee-400 mb-0.5">Yearly Output</div>
                        <div className="text-2xl font-black text-coffee-950 dark:text-white leading-none">
                            {loading ? '...' : totalCommits} <span className="text-xs text-coffee-400 font-medium">commits</span>
                        </div>
                    </div>
                 </div>
                 <div className="p-6 bg-coffee-50 dark:bg-coffee-900/40 rounded-3xl border border-coffee-100 dark:border-coffee-800/50 flex items-center gap-5 transition-transform hover:scale-[1.02]">
                    <div className="w-12 h-12 flex-shrink-0 bg-white dark:bg-coffee-800 rounded-2xl shadow-sm flex items-center justify-center text-coffee-600 dark:text-coffee-400">
                        <Zap size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-coffee-400 mb-0.5">Average Roast</div>
                        <div className="text-2xl font-black text-coffee-950 dark:text-white leading-none">
                            {loading ? '...' : (totalCommits / 52).toFixed(1)} <span className="text-xs text-coffee-400 font-medium">p/wk</span>
                        </div>
                    </div>
                 </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2 px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
              <Info size={14} className="text-blue-500 flex-shrink-0" />
              <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium leading-tight">
                Activity includes all commits made to this repository across all branches in the past year.
              </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RepoStatsModal;
