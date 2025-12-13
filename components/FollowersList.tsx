import React from 'react';
import { motion } from 'framer-motion';
import { GitHubUser } from '../types';
import { Users, ArrowUpRight } from 'lucide-react';

interface FollowersListProps {
  followers: GitHubUser[];
}

const FollowersList: React.FC<FollowersListProps> = ({ followers }) => {
  return (
    <section id="followers" className="py-16 bg-white dark:bg-coffee-950 rounded-t-[3rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] min-h-screen relative z-10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
            <h2 className="text-4xl font-display font-bold text-coffee-900 dark:text-coffee-100 flex items-center gap-3">
                <span className="bg-coffee-100 dark:bg-coffee-800 p-2 rounded-xl text-3xl shadow-sm">☕</span>
                Coffee Club
            </h2>
            <p className="mt-2 text-coffee-600 dark:text-coffee-400">Regulars and connoisseurs who enjoy the brew.</p>
        </div>

        {followers.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {followers.map((follower, index) => (
                    <motion.div
                        key={follower.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-coffee-50 dark:bg-coffee-900 rounded-xl p-6 border border-coffee-100 dark:border-coffee-800 hover:shadow-lg hover:-translate-y-1 transition-all group"
                    >
                        <div className="flex items-start gap-4">
                             <div className="relative">
                                <img 
                                    src={follower.avatar_url} 
                                    alt={follower.login}
                                    className="w-16 h-16 rounded-full border-2 border-coffee-200 dark:border-coffee-700 object-cover" 
                                />
                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-coffee-800 rounded-full p-1 shadow-sm">
                                    <Users size={12} className="text-coffee-500" />
                                </div>
                             </div>
                             <div className="flex-1 min-w-0">
                                 <h3 className="font-display font-bold text-lg text-coffee-900 dark:text-coffee-100 truncate">
                                     {follower.name || follower.login}
                                 </h3>
                                 <p className="text-coffee-500 dark:text-coffee-400 text-sm mb-1">@{follower.login}</p>
                                 <p className="text-coffee-600 dark:text-coffee-300 text-xs line-clamp-2 min-h-[2.5em]">
                                     {follower.bio || "No bio available."}
                                 </p>
                             </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                            <a 
                                href={follower.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs font-bold text-coffee-600 dark:text-coffee-300 hover:text-coffee-900 dark:hover:text-white bg-white dark:bg-coffee-800 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all border border-coffee-100 dark:border-coffee-700"
                            >
                                <span>Visit Profile</span>
                                <ArrowUpRight size={12} />
                            </a>
                        </div>
                    </motion.div>
                ))}
             </div>
        ) : (
            <div className="text-center py-20 text-coffee-400 dark:text-coffee-600">
                <p className="text-xl">No one has joined the coffee club yet.</p>
            </div>
        )}
      </div>
    </section>
  );
};

export default FollowersList;