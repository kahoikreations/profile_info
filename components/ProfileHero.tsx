
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ChevronDown, Coffee } from 'lucide-react';
import { GitHubUser } from '../types';
import { fetchReadme } from '../services/githubService';
import CoffeeLottie from './CoffeeLottie';

interface ProfileHeroProps {
  user: GitHubUser;
  setView: (view: 'home' | 'followers' | 'stats') => void;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({ user, setView }) => {
  const [profileReadme, setProfileReadme] = useState<string | null>(null);
  const [readmeBranch, setReadmeBranch] = useState<string>('main');
  const [isReadmeExpanded, setIsReadmeExpanded] = useState(false);

  useEffect(() => {
    fetchReadme(user.login, 'main').then(result => {
      if (result) {
        setProfileReadme(result.content);
        setReadmeBranch(result.branch);
      }
    });
  }, [user.login]);

  const transformImageUri = (uri: string) => {
    if (uri.startsWith('http') || uri.startsWith('//') || uri.startsWith('data:')) return uri;
    const cleanPath = uri.replace(/^\.?\//, '');
    return `https://raw.githubusercontent.com/${user.login}/${user.login}/${readmeBranch}/${cleanPath}`;
  };

  return (
    <section id="hero" className="relative pt-32 pb-20 overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start gap-12">
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-shrink-0 text-center md:text-left md:sticky md:top-24 w-full md:w-auto flex flex-col items-center md:items-start z-20"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-coffee-400/20 dark:bg-coffee-300/10 rounded-full blur-[40px] animate-pulse"></div>
                    <motion.div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden border-8 border-white dark:border-coffee-800 shadow-2xl">
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    </motion.div>
                </div>

                <div className="mt-4 w-full">
                    <CoffeeLottie />
                </div>

                <h1 className="mt-4 text-4xl sm:text-6xl font-serif font-extrabold text-coffee-900 dark:text-coffee-50 italic">
                  {user.name || user.login}
                </h1>
                <p className="text-coffee-600 dark:text-coffee-300 text-xl font-mono mt-2 bg-coffee-100 dark:bg-coffee-900 px-3 py-1 rounded-lg">
                  @pro-grammmer-SD
                </p>
                
                <div className="mt-8 flex gap-4 w-full">
                    <div className="flex-1 bg-white/80 dark:bg-coffee-900/80 px-6 py-4 rounded-3xl border border-coffee-200 dark:border-coffee-700 shadow-xl text-center">
                        <span className="block font-black text-coffee-800 dark:text-coffee-100 text-3xl">{user.public_repos}</span>
                        <span className="text-[10px] text-coffee-500 dark:text-coffee-400 uppercase font-black tracking-widest">Batches</span>
                    </div>
                    <button onClick={() => setView('followers')} className="flex-1 bg-white/80 dark:bg-coffee-900/80 px-6 py-4 rounded-3xl border border-coffee-200 dark:border-coffee-700 shadow-xl text-center group transition-transform active:scale-95">
                        <span className="block font-black text-coffee-800 dark:text-coffee-100 text-3xl group-hover:text-coffee-500 transition-colors">{user.followers}</span>
                        <span className="text-[10px] text-coffee-500 dark:text-coffee-400 uppercase font-black tracking-widest">Testers</span>
                    </button>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 bg-white/40 dark:bg-coffee-900/30 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-coffee-100 dark:border-coffee-800 w-full overflow-hidden"
            >
                <div className="p-8 sm:p-12">
                    {profileReadme ? (
                        <div className="relative">
                            <motion.div 
                                animate={{ height: isReadmeExpanded ? 'auto' : 400 }}
                                className={`overflow-hidden prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-a:text-coffee-700 dark:prose-a:text-coffee-300 ${!isReadmeExpanded ? 'mask-gradient-bottom' : ''}`}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} urlTransform={transformImageUri}>
                                    {profileReadme}
                                </ReactMarkdown>
                            </motion.div>
                            {!isReadmeExpanded && (
                                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white/90 dark:from-coffee-950/90 to-transparent pointer-events-none" />
                            )}
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-coffee-300 gap-4">
                            <div className="animate-spin text-coffee-500"><Coffee size={40} /></div>
                            <span className="text-xs font-black uppercase tracking-widest">Grinding Profile...</span>
                        </div>
                    )}
                </div>

                {profileReadme && (
                    <button 
                        onClick={() => setIsReadmeExpanded(!isReadmeExpanded)}
                        className="w-full py-6 bg-coffee-50/50 dark:bg-coffee-800/20 hover:bg-coffee-100 dark:hover:bg-coffee-800/40 transition-colors text-coffee-600 dark:text-coffee-300 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 border-t border-coffee-100 dark:border-coffee-800"
                    >
                        {isReadmeExpanded ? 'SHOW LESS' : 'READ FULL PROFILE'}
                        <ChevronDown className={`transition-transform duration-300 ${isReadmeExpanded ? 'rotate-180' : ''}`} size={16} />
                    </button>
                )}
            </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHero;
