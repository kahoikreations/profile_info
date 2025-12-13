import React, { useEffect, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GitHubUser } from '../types';
import { fetchReadme } from '../services/githubService';

interface ProfileHeroProps {
  user: GitHubUser;
  setView: (view: 'home' | 'followers') => void;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({ user, setView }) => {
  const [profileReadme, setProfileReadme] = useState<string | null>(null);
  const [isReadmeExpanded, setIsReadmeExpanded] = useState(false);
  const controls = useAnimation();
  const [easterEggActive, setEasterEggActive] = useState(false);

  useEffect(() => {
    const loadProfileReadme = async () => {
      const content = await fetchReadme(user.login, 'main');
      if (content) setProfileReadme(content);
      else {
           const contentMaster = await fetchReadme(user.login, 'master');
           setProfileReadme(contentMaster);
      }
    };
    loadProfileReadme();
  }, [user.login]);

  const triggerEasterEgg = async () => {
    if (easterEggActive) return;
    setEasterEggActive(true);
    
    await controls.start({
        rotate: [0, -15, 15, -15, 15, 0],
        scale: [1, 1.2, 1.2, 1.2, 1],
        transition: { duration: 0.5 }
    });
    
    setEasterEggActive(false);
  };

  return (
    <section id="hero" className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-coffee-100 dark:bg-coffee-900 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-orange-100 dark:bg-coffee-800 rounded-full blur-3xl opacity-50 -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start gap-12">
            
            {/* Left: Avatar & Stats */}
            <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="flex-shrink-0 text-center md:text-left sticky top-24 w-full md:w-auto flex flex-col items-center md:items-start"
            >
                {/* 3D Aesthetic Avatar Container */}
                <div className="relative group perspective-1000">
                    <motion.div
                        className="relative w-56 h-56 rounded-full shadow-2xl transition-all duration-500 ease-out transform-style-3d group-hover:rotate-y-12 group-hover:rotate-x-12"
                        whileHover={{ scale: 1.05 }}
                    >
                        {/* Steam Animation on Hover */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                            <div className="absolute top-0 left-10 text-4xl text-coffee-300 dark:text-coffee-600 animate-steam-1">♨️</div>
                            <div className="absolute -top-4 left-24 text-3xl text-coffee-300 dark:text-coffee-600 animate-steam-2">♨️</div>
                            <div className="absolute top-0 left-36 text-4xl text-coffee-300 dark:text-coffee-600 animate-steam-3">♨️</div>
                        </div>

                        <img 
                            src={user.avatar_url} 
                            alt={user.name} 
                            className="w-full h-full rounded-full border-4 border-white dark:border-coffee-700 object-cover shadow-[0_20px_50px_rgba(8,112,184,0.7)] dark:shadow-[0_20px_50px_rgba(78,48,42,0.5)] bg-coffee-100"
                        />
                        
                        {/* Coffee Mug Icon (Easter Egg Trigger) */}
                        <motion.div 
                            animate={controls}
                            onClick={triggerEasterEgg}
                            className="absolute bottom-2 right-4 bg-coffee-600 hover:bg-coffee-700 text-white p-2.5 rounded-full shadow-lg border-2 border-white dark:border-coffee-600 cursor-pointer transition-colors z-20"
                            whileHover={{ scale: 1.1, rotate: 15 }}
                        >
                            <span className="text-xl select-none">☕</span>
                        </motion.div>
                    </motion.div>
                </div>

                <h1 className="mt-8 text-4xl font-display font-bold text-coffee-900 dark:text-coffee-50">{user.name || user.login}</h1>
                <p className="text-coffee-600 dark:text-coffee-300 text-lg mt-1 font-mono">@{user.login}</p>
                
                {/* Bio Moved Here */}
                <div className="mt-4 max-w-xs text-center md:text-left">
                     <p className="text-coffee-700 dark:text-coffee-400 text-sm leading-relaxed italic border-l-2 border-coffee-300 dark:border-coffee-700 pl-3">
                        "{user.bio || "Brewing code, one commit at a time."}"
                     </p>
                </div>
                
                <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="bg-white/80 dark:bg-coffee-900/80 px-4 py-2 rounded-lg border border-coffee-100 dark:border-coffee-800 shadow-sm text-center">
                        <span className="block font-bold text-coffee-800 dark:text-coffee-100 text-xl">{user.public_repos}</span>
                        <span className="text-xs text-coffee-500 dark:text-coffee-400 uppercase tracking-wide">Repos</span>
                    </div>
                    
                    {/* Clickable Followers Count */}
                    <button 
                        onClick={() => setView('followers')}
                        className="bg-white/80 dark:bg-coffee-900/80 px-4 py-2 rounded-lg border border-coffee-100 dark:border-coffee-800 shadow-sm text-center hover:bg-coffee-50 dark:hover:bg-coffee-800 transition-colors group cursor-pointer"
                    >
                        <span className="block font-bold text-coffee-800 dark:text-coffee-100 text-xl group-hover:text-coffee-600 dark:group-hover:text-coffee-300 transition-colors">{user.followers}</span>
                        <span className="text-xs text-coffee-500 dark:text-coffee-400 uppercase tracking-wide">Followers</span>
                    </button>
                </div>
            </motion.div>

            {/* Right: README */}
            <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex-1 bg-white/60 dark:bg-coffee-900/40 backdrop-blur-sm rounded-2xl shadow-sm border border-coffee-200 dark:border-coffee-800 w-full overflow-hidden md:-mt-8"
            >
                <div className="p-6 sm:p-8">
                    {profileReadme ? (
                        <div className="relative">
                            <motion.div 
                                initial={{ height: 384 }}
                                animate={{ height: isReadmeExpanded ? 'auto' : 384 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className={`overflow-hidden prose prose-stone dark:prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-display prose-headings:text-coffee-800 dark:prose-headings:text-coffee-100 prose-a:text-coffee-600 dark:prose-a:text-coffee-300 prose-strong:text-coffee-700 dark:prose-strong:text-coffee-200 ${!isReadmeExpanded ? 'mask-gradient-bottom' : ''}`}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{profileReadme}</ReactMarkdown>
                            </motion.div>
                            
                            {/* Gradient Mask for collapsed state */}
                            <AnimatePresence>
                                {!isReadmeExpanded && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/90 dark:from-coffee-900/90 to-transparent pointer-events-none"
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-coffee-400">
                             <p>No public profile README found.</p>
                        </div>
                    )}
                </div>

                {/* Read More / Less Toggle */}
                {profileReadme && (
                    <button 
                        onClick={() => setIsReadmeExpanded(!isReadmeExpanded)}
                        className="w-full py-4 bg-coffee-50 dark:bg-coffee-800/50 hover:bg-coffee-100 dark:hover:bg-coffee-800 text-coffee-600 dark:text-coffee-300 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors border-t border-coffee-100 dark:border-coffee-700"
                    >
                        {isReadmeExpanded ? 'Read Less' : 'Read More'}
                        <motion.div
                            animate={{ rotate: isReadmeExpanded ? 180 : 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                        >
                            <ChevronDown size={16} />
                        </motion.div>
                    </button>
                )}
            </motion.div>
        </div>
      </div>
      
      {/* Styles for Steam Animation */}
      <style>{`
        @keyframes steam-1 {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: translateY(-20px) scale(1.5); opacity: 0; }
        }
        @keyframes steam-2 {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            50% { opacity: 0.6; }
            100% { transform: translateY(-25px) scale(1.2); opacity: 0; }
        }
        @keyframes steam-3 {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: translateY(-15px) scale(1.4); opacity: 0; }
        }
        .animate-steam-1 { animation: steam-1 2s infinite ease-out; }
        .animate-steam-2 { animation: steam-2 2.5s infinite ease-out 0.5s; }
        .animate-steam-3 { animation: steam-3 1.8s infinite ease-out 1s; }
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
      `}</style>
    </section>
  );
};

export default ProfileHero;