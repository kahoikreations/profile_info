
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Activity, AlertCircle } from 'lucide-react';
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
      // Small delay to allow animation to start smoothly
      await new Promise(r => setTimeout(r, 300));
      const stats = await fetchRepoParticipation(repo.name);
      if (mounted) {
        setData(stats);
        setLoading(false);
      }
    };
    loadStats();
    return () => { mounted = false; };
  }, [repo.name]);

  const maxCommit = data ? Math.max(...data.all, 1) : 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-coffee-950/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-coffee-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-coffee-200 dark:border-coffee-700"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-coffee-400 to-coffee-800" />
        
        <div className="p-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-2 text-coffee-600 dark:text-coffee-300 mb-1">
                        <Activity size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Contribution Analysis</span>
                    </div>
                    <h3 className="text-3xl font-display font-black text-coffee-950 dark:text-coffee-50">{repo.name}</h3>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-coffee-100 dark:hover:bg-coffee-800 transition-colors text-coffee-500"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="min-h-[250px] flex items-center justify-center bg-coffee-50 dark:bg-coffee-950/50 rounded-3xl border border-coffee-100 dark:border-coffee-800 p-6 relative">
                {loading ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-coffee-300 border-t-coffee-800 rounded-full animate-spin" />
                        <span className="text-xs font-bold text-coffee-400 animate-pulse">BREWING DATA...</span>
                    </div>
                ) : data ? (
                    <div className="w-full h-full flex flex-col">
                        <div className="flex-1 flex items-end justify-between gap-1 w-full h-48 pt-4">
                            {data.all.map((count, i) => (
                                <div key={i} className="flex-1 flex flex-col justify-end group relative">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(count / maxCommit) * 100}%` }}
                                        transition={{ duration: 0.5, delay: i * 0.01 }}
                                        className="w-full min-w-[4px] bg-coffee-300 dark:bg-coffee-700 rounded-t-sm hover:bg-coffee-600 dark:hover:bg-coffee-400 transition-colors relative"
                                    >
                                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-coffee-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 font-bold shadow-lg transition-opacity">
                                            {count} commits
                                         </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between text-[10px] font-black uppercase tracking-widest text-coffee-400 border-t border-coffee-200 dark:border-coffee-800 pt-2">
                            <span>52 Weeks Ago</span>
                            <span>Today</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-coffee-400">
                        <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-bold">No activity data available for this brew.</p>
                    </div>
                )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                 <div className="p-4 bg-coffee-100/50 dark:bg-coffee-800/30 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-coffee-800 rounded-xl shadow-sm text-coffee-600 dark:text-coffee-300">
                        <Activity size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-coffee-400">Total Commits (1yr)</div>
                        <div className="text-xl font-black text-coffee-900 dark:text-white">
                            {data ? data.all.reduce((a, b) => a + b, 0) : '-'}
                        </div>
                    </div>
                 </div>
                 <div className="p-4 bg-coffee-100/50 dark:bg-coffee-800/30 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-coffee-800 rounded-xl shadow-sm text-coffee-600 dark:text-coffee-300">
                        <Activity size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-coffee-400">Avg. Weekly</div>
                        <div className="text-xl font-black text-coffee-900 dark:text-white">
                            {data ? Math.round(data.all.reduce((a, b) => a + b, 0) / 52) : '-'}
                        </div>
                    </div>
                 </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RepoStatsModal;
