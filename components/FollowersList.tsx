
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitHubUser } from '../types';
import { Users, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface FollowersListProps {
  followers: GitHubUser[];
}

const FOLLOWERS_PER_PAGE = 10;

const FollowersList: React.FC<FollowersListProps> = ({ followers }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const sortedFollowers = useMemo(() => {
    // Top followers first could be random or based on existing order as a "premium" list
    return [...followers];
  }, [followers]);

  const totalPages = Math.ceil(sortedFollowers.length / FOLLOWERS_PER_PAGE);
  const currentFollowers = sortedFollowers.slice((currentPage - 1) * FOLLOWERS_PER_PAGE, currentPage * FOLLOWERS_PER_PAGE);

  return (
    <section id="followers" className="py-24 bg-white dark:bg-coffee-950 rounded-t-[5rem] shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.1)] min-h-screen relative z-10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-16">
            <h2 className="text-5xl sm:text-6xl font-display font-black text-coffee-950 dark:text-coffee-50 tracking-tight leading-none mb-4">
                The Roast Testers
            </h2>
            <p className="text-coffee-500 dark:text-coffee-400 text-lg font-serif italic">The regular patrons who savor every update.</p>
        </div>

        {sortedFollowers.length > 0 ? (
             <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {currentFollowers.map((follower, index) => (
                            <motion.div
                                key={follower.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-coffee-50 dark:bg-coffee-900/40 rounded-[2rem] p-8 border border-coffee-100 dark:border-coffee-800 hover:shadow-2xl hover:-translate-y-2 transition-all group"
                            >
                                <div className="flex items-start gap-6">
                                     <div className="relative">
                                        <div className="absolute inset-0 bg-coffee-500/20 rounded-full blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img 
                                            src={follower.avatar_url} 
                                            alt={follower.login}
                                            className="w-20 h-20 rounded-full border-4 border-white dark:border-coffee-800 shadow-lg object-cover relative z-10" 
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-coffee-800 dark:bg-coffee-100 rounded-full p-1.5 shadow-md z-20">
                                            <Users size={14} className="text-white dark:text-coffee-900" />
                                        </div>
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <h3 className="font-display font-bold text-xl text-coffee-900 dark:text-coffee-100 truncate">
                                             {follower.name || follower.login}
                                         </h3>
                                         <p className="text-coffee-500 dark:text-coffee-400 text-sm mb-3">@{follower.login}</p>
                                         <p className="text-coffee-600 dark:text-coffee-300 text-xs line-clamp-2 min-h-[3em] italic">
                                             {follower.bio || "Savoring the bits, one byte at a time."}
                                         </p>
                                     </div>
                                </div>
                                
                                <div className="mt-6 flex justify-end">
                                    <a 
                                        href={follower.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-coffee-600 dark:text-coffee-300 hover:text-white hover:bg-coffee-800 dark:hover:bg-coffee-100 dark:hover:text-coffee-950 px-5 py-2.5 rounded-full transition-all border border-coffee-200 dark:border-coffee-700"
                                    >
                                        <span>PATRON PROFILE</span>
                                        <ArrowUpRight size={14} />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-8 mt-20">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                            className="p-5 bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-950 rounded-full disabled:opacity-20 hover:scale-110 active:scale-90 transition-all shadow-xl"
                        >
                            <ChevronLeft size={28} />
                        </button>
                        <div className="text-center font-display">
                            <div className="text-3xl font-black text-coffee-900 dark:text-coffee-50 leading-none">{currentPage}</div>
                            <div className="text-[10px] uppercase font-black tracking-widest text-coffee-400 mt-1">OF {totalPages} PAGES</div>
                        </div>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                            className="p-5 bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-950 rounded-full disabled:opacity-20 hover:scale-110 active:scale-90 transition-all shadow-xl"
                        >
                            <ChevronRight size={28} />
                        </button>
                    </div>
                )}
             </>
        ) : (
            <div className="text-center py-40">
                <p className="text-2xl font-display font-black text-coffee-300 uppercase tracking-[0.3em]">The club awaits its first member.</p>
            </div>
        )}
      </div>
    </section>
  );
};

export default FollowersList;
