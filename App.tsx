
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, RefreshCw, Coffee } from 'lucide-react';
import { getPortfolioData, RateLimitError } from './services/githubService';
import { GitHubUser, GitHubRepo, CoffeeStats } from './types';
import CoffeeLoader from './components/CoffeeLoader';
import Navbar from './components/Navbar';
import ProfileHero from './components/ProfileHero';
import RepoGrid from './components/RepoGrid';
import FollowersList from './components/FollowersList';
import StatsPage from './components/StatsPage';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [pinnedRepos, setPinnedRepos] = useState<GitHubRepo[]>([]);
  const [followers, setFollowers] = useState<GitHubUser[]>([]);
  const [tags, setTags] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<CoffeeStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'followers' | 'stats'>('home');
  const [isDark, setIsDark] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [ripple, setRipple] = useState<{ x: number, y: number, show: boolean }>({ x: 0, y: 0, show: false });

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = useCallback(async (isInitial: boolean = false, forceRefresh: boolean = false) => {
    if (isInitial) setLoading(true);
    const minLoadTime = isInitial ? new Promise(resolve => setTimeout(resolve, 4000)) : Promise.resolve();

    try {
      const [data] = await Promise.all([getPortfolioData(forceRefresh), minLoadTime]);
      setUser(data.user);
      setRepos(data.repos);
      setPinnedRepos(data.pinnedRepos);
      setFollowers(data.followers);
      setTags(data.tags || {});
      setStats(data.stats);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err instanceof RateLimitError ? "API Limit Reached. Try again in an hour." : "Unable to fetch data. Check your connection.");
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(true); }, [loadData]);

  const toggleTheme = (event?: any) => {
    const x = event?.clientX || window.innerWidth / 2;
    const y = event?.clientY || 60;
    document.body.classList.add('theme-transitioning');
    setRipple({ x, y, show: true });
    setTimeout(() => {
      const nextMode = !isDark;
      setIsDark(nextMode);
      document.documentElement.classList.toggle('dark', nextMode);
      setTimeout(() => {
        setRipple(prev => ({ ...prev, show: false }));
        document.body.classList.remove('theme-transitioning');
      }, 800);
    }, 10);
  };

  if (error && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-coffee-50 dark:bg-coffee-950 p-8 text-center">
        <div className="w-24 h-24 bg-coffee-100 dark:bg-coffee-900 rounded-full flex items-center justify-center mb-8">
            <RefreshCw size={48} className="text-coffee-400" />
        </div>
        <h1 className="text-3xl font-display font-black text-coffee-900 dark:text-coffee-50 mb-4">{error}</h1>
        <button onClick={() => loadData(true, true)} className="px-8 py-3 bg-coffee-800 text-white rounded-full font-black uppercase tracking-widest">Retry Brewing</button>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {ripple.show && (
          <motion.div
            initial={{ clipPath: `circle(0% at ${ripple.x}px ${ripple.y}px)` }}
            animate={{ clipPath: `circle(150% at ${ripple.x}px ${ripple.y}px)` }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-coffee-900 dark:bg-coffee-100 pointer-events-none opacity-10"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loader" exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.6 }} className="fixed inset-0 z-[100]">
            <CoffeeLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && user && (
        <div className="min-h-screen bg-coffee-50 dark:bg-coffee-950 transition-colors duration-1000">
          <Navbar 
            user={user} isDark={isDark} toggleTheme={toggleTheme} 
            currentView={currentView} setView={setCurrentView}
            onRefresh={() => loadData(false, true)}
          />
          
          <main className="relative">
            <ProfileHero user={user} setView={setCurrentView} />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {currentView === 'home' && <RepoGrid repos={repos} pinnedRepos={pinnedRepos} tags={tags} />}
                {currentView === 'followers' && <FollowersList followers={followers} />}
                {currentView === 'stats' && stats && <StatsPage stats={stats} />}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="py-20 bg-coffee-950 text-coffee-600 text-center border-t border-coffee-900/50">
            <div className="max-w-7xl mx-auto px-4">
               <p className="font-display font-black text-coffee-200 text-3xl mb-2 tracking-tighter">PRO-GRAMMER-SD</p>
               <p className="text-[10px] tracking-[0.4em] font-black uppercase mb-8 opacity-60">Crafted with caffeine and curiosity</p>
               <div className="flex justify-center items-center gap-4">
                  <div className="w-12 h-px bg-coffee-900" />
                  <div className="text-coffee-800"><Coffee size={24} /></div>
                  <div className="w-12 h-px bg-coffee-900" />
               </div>
            </div>
          </footer>

          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-10 right-10 p-5 bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-950 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 hover:scale-110 active:scale-90 transition-all group"
              >
                <ChevronUp size={28} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default App;
