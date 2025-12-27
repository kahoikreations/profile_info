
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
        className="absolute inset-0 bg-coffee-950/90 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative w-full max-w-2xl bg-white dark:bg-coffee-900 rounded-[3rem] shadow-[0_35px_100px_-15px_rgba(0,0,0,0.6)] overflow-hidden border border-coffee-200/50 dark:border-coffee-700/50"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-coffee-300 via-coffee-600 to-coffee-800" />
        
        <div className="p-8 sm:p-12">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <div className="flex items-center gap-2 text-coffee-500 dark:text-coffee-400 mb-2">
                        <Activity size={16} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Codebase Chemistry</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-display font-black text-coffee-950 dark:text-coffee-50 tracking-tighter">
                      {repo.name}
                    </h3>
                </div>
                <button 
                    onClick={onClose}
                    className="p-3 rounded-full bg-coffee-50 dark:bg-coffee-800/50 text-coffee-400 hover:text-coffee-950 dark:hover:text-white transition-all active:scale-75"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="min-h-[300px] flex flex-col bg-coffee-50/50 dark:bg-black/30 rounded-[2.5rem] border border-coffee-100 dark:border-coffee-800/50 p-6 sm:p-10 relative">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-5">
                        <div className="relative">
                          <div className="w-14 h-14 border-4 border-coffee-100 dark:border-coffee-800 border-t-coffee-700 rounded-full animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Coffee size={16} className="text-coffee-700 dark:text-coffee-400" />
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-coffee-400 uppercase tracking-[0.4em] animate-pulse">Running Lab Tests...</span>
                    </div>
                ) : data && hasActivity ? (
                    <div className="w-full flex-1 flex flex-col">
                        <div className="flex-1 flex items-end justify-between gap-[3px] sm:gap-1.5 w-full h-44 pt-6">
                            {data.all.map((count, i) => {
                                const heightPercent = (count / maxCommit) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${Math.max(heightPercent, count > 0 ? 8 : 2)}%` }}
                                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: i * 0.01 }}
                                            className={`w-full rounded-full transition-all duration-300 relative ${
                                              count > 0 
                                              ? 'bg-gradient-to-t from-coffee-800 via-coffee-600 to-coffee-400 dark:from-coffee-600 dark:via-coffee-400 dark:to-coffee-200 shadow-lg' 
                                              : 'bg-coffee-200/40 dark:bg-coffee-800/20'
                                            }`}
                                        >
                                            {count > 0 && (
                                              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                                            )}
                                        </motion.div>
                                        
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-2 bg-coffee-950 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 font-black shadow-2xl transition-all translate-y-2 group-hover:translate-y-0 border border-coffee-800 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-coffee-400" />
                                            <span className="text-coffee-300">WK {52 - i}:</span>
                                            {count} COMMIT{count !== 1 ? 'S' : ''}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-coffee-400/80 pt-6 border-t border-coffee-200/50 dark:border-coffee-800/50">
                            <span className="flex items-center gap-2"><Clock size={10} /> 52 WEEKS AGO</span>
                            <div className="flex items-center gap-4">
                               <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-coffee-500" />
                                 <span>ACTIVITY</span>
                               </div>
                            </div>
                            <span>NOW</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                        <div className="w-20 h-20 bg-coffee-100/50 dark:bg-coffee-800/30 rounded-full flex items-center justify-center mb-6">
                          <AlertCircle size={32} className="text-coffee-300 dark:text-coffee-600" />
                        </div>
                        <h4 className="text-coffee-950 dark:text-coffee-100 font-display font-black text-xl mb-2">Cold Brew Detected</h4>
                        <p className="text-coffee-500 dark:text-coffee-400 text-xs max-w-[220px] leading-relaxed italic font-serif">
                            {data ? "No recent batches found in the last year. The server is quiet, but the code still tastes great." : "GitHub's barista is still processing your request. Try again in a minute."}
                        </p>
                        <button onClick={onClose} className="mt-8 px-8 py-3 bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all">
                          Noted
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-10 grid grid-cols-2 gap-5">
                 <div className="p-6 bg-coffee-50 dark:bg-coffee-900/40 rounded-[2rem] border border-coffee-100 dark:border-coffee-800/50 flex flex-col gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-coffee-800 rounded-xl shadow-md flex items-center justify-center text-coffee-600 dark:text-coffee-300">
                        <Activity size={20} />
                    </div>
                    <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-coffee-400 mb-1">Total Batches</div>
                        <div className="text-3xl font-black text-coffee-950 dark:text-white leading-none">
                            {loading ? '...' : totalCommits}
                        </div>
                    </div>
                 </div>
                 <div className="p-6 bg-coffee-50 dark:bg-coffee-900/40 rounded-[2rem] border border-coffee-100 dark:border-coffee-800/50 flex flex-col gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-coffee-800 rounded-xl shadow-md flex items-center justify-center text-coffee-600 dark:text-coffee-300">
                        <Zap size={20} />
                    </div>
                    <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-coffee-400 mb-1">Weekly Intensity</div>
                        <div className="text-3xl font-black text-coffee-950 dark:text-white leading-none">
                            {loading ? '...' : (totalCommits / 52).toFixed(1)}
                        </div>
                    </div>
                 </div>
            </div>
            
            <div className="mt-8 px-5 py-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl flex items-start gap-3">
              <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-blue-800/70 dark:text-blue-300/70 font-medium leading-relaxed italic">
                These metrics represent all commit activity synchronized with the main repository across the past 52-week roasting cycle.
              </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RepoStatsModal;
