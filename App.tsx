
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, RefreshCw, Coffee, Github, Loader2 } from 'lucide-react';
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
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [pinnedRepos, setPinnedRepos] = useState<GitHubRepo[]>([]);
  const [followers, setFollowers] = useState<GitHubUser[]>([]);
  const [tags, setTags] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<CoffeeStats | null>(null);
  const [error, setError] = useState<{ message: string; resetAt?: number; startAt?: number } | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'followers' | 'stats'>('home');
  const [isDark, setIsDark] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [ripple, setRipple] = useState<{ x: number, y: number, show: boolean }>({ x: 0, y: 0, show: false });
  const [countdown, setCountdown] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const autoRetryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = useCallback(async (isInitial: boolean = false, forceRefresh: boolean = false) => {
    if (isInitial) setLoading(true);
    else setBackgroundRefreshing(true);
    
    const minLoadTime = isInitial ? new Promise(resolve => setTimeout(resolve, 4000)) : Promise.resolve();

    try {
      const data = await getPortfolioData(forceRefresh);
      await minLoadTime;
      setUser(data.user);
      setRepos(data.repos);
      setPinnedRepos(data.pinnedRepos);
      setFollowers(data.followers);
      setTags(data.tags || {});
      setStats(data.stats);
      setError(null);
    } catch (err: any) {
      console.error(err);
      if (err instanceof RateLimitError) {
        setError({ 
          message: err.message, 
          resetAt: err.resetTime,
          startAt: Math.floor(Date.now() / 1000)
        });
      } else {
        setError({ message: "Unable to fetch data. Check your connection." });
      }
    } finally {
      if (isInitial) setLoading(false);
      setBackgroundRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(true); }, [loadData]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (error?.resetAt && error.startAt) {
      const totalTime = error.resetAt - error.startAt;
      
      const updateUI = () => {
        const now = Math.floor(Date.now() / 1000);
        const diff = error.resetAt! - now;
        
        if (diff <= 0) {
          setCountdown('Resetting now...');
          setProgress(100);
          loadData(false, true); 
          return;
        }

        const m = Math.floor(diff / 60);
        const s = diff % 60;
        setCountdown(`${m}m ${s}s remaining`);
        
        const currentProgress = ((totalTime - diff) / totalTime) * 100;
        setProgress(Math.min(currentProgress, 100));
      };

      updateUI();
      timer = setInterval(updateUI, 1000);
    }

    // Auto retry even without exact reset header for generic errors
    if (error && !error.resetAt) {
        autoRetryTimer.current = setInterval(() => {
            loadData(false, true);
        }, 30000);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (autoRetryTimer.current) clearInterval(autoRetryTimer.current);
    };
  }, [error, loadData]);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-coffee-50 dark:bg-coffee-950 p-8 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <div className="w-[600px] h-[600px] border-[1px] border-coffee-800 rounded-full animate-[ping_10s_linear_infinite]" />
            <div className="w-[400px] h-[400px] border-[1px] border-coffee-800 rounded-full animate-[ping_15s_linear_infinite]" />
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 bg-white dark:bg-coffee-900/50 backdrop-blur-3xl p-8 sm:p-16 rounded-[4rem] border border-coffee-200 dark:border-coffee-800 shadow-2xl max-w-2xl w-full"
        >
            <div className="mb-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-coffee-100 dark:bg-coffee-800 rounded-full flex items-center justify-center mb-6 relative">
                    {backgroundRefreshing ? (
                      <Loader2 size={32} className="text-coffee-600 dark:text-coffee-300 animate-spin" />
                    ) : (
                      <Coffee size={32} className="text-coffee-600 dark:text-coffee-300" />
                    )}
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 border-2 border-coffee-400 rounded-full"
                    />
                </div>
                <h1 className="text-3xl sm:text-4xl font-display font-black text-coffee-950 dark:text-coffee-50 mb-3 tracking-tighter">
                    {backgroundRefreshing ? "Re-grinding..." : "Barista is on break"}
                </h1>
                <p className="text-coffee-500 dark:text-coffee-400 font-serif italic text-lg">
                    {backgroundRefreshing ? "Pouring a fresh pot of data." : "The server is cooling down. We'll be back in a moment."}
                </p>
            </div>
            
            {error.resetAt && (
                <div className="space-y-4 mb-10">
                    <div className="flex justify-between items-end px-2">
                        <div className="text-left">
                            <span className="text-[10px] font-black uppercase tracking-widest text-coffee-400 block mb-1">Status</span>
                            <span className="text-sm font-bold text-coffee-700 dark:text-coffee-300">
                              {backgroundRefreshing ? "Connecting..." : "Wait for reset"}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black uppercase tracking-widest text-coffee-400 block mb-1">Est. Time</span>
                            <span className="text-sm font-black text-coffee-800 dark:text-coffee-100 uppercase tracking-tighter">{countdown}</span>
                        </div>
                    </div>
                    <div className="h-3 w-full bg-coffee-100 dark:bg-coffee-800 rounded-full overflow-hidden border border-coffee-200 dark:border-coffee-700">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-coffee-600 dark:bg-coffee-400 shadow-[0_0_15px_rgba(111,69,59,0.3)] transition-all duration-1000"
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    disabled={backgroundRefreshing}
                    onClick={() => loadData(false, true)} 
                    className="flex-1 px-8 py-5 bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-950 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {backgroundRefreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    <span>{backgroundRefreshing ? 'Refreshing...' : 'Try Manual Refresh'}</span>
                </button>
                <a 
                    href="https://github.com/pro-grammer-SD" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 px-8 py-5 border-2 border-coffee-200 dark:border-coffee-700 text-coffee-800 dark:text-coffee-100 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-coffee-100 dark:hover:bg-coffee-800 transition-all flex items-center justify-center gap-3"
                >
                    <span>Visit Profile</span>
                    <Github size={18} />
                </a>
            </div>
        </motion.div>
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
            isRefreshing={backgroundRefreshing}
          />
          
          <main className="relative">
            {/* Background Refresh Indicator */}
            <AnimatePresence>
              {backgroundRefreshing && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed top-24 right-4 sm:right-10 z-[30] flex items-center gap-3 px-4 py-2 bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-950 rounded-full shadow-xl"
                >
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Refreshing...</span>
                </motion.div>
              )}
            </AnimatePresence>

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

          <footer className="py-24 bg-coffee-950 text-coffee-600 text-center border-t border-coffee-900/30">
            <div className="max-w-7xl mx-auto px-4">
               <p className="font-display font-black text-coffee-200 text-4xl mb-3 tracking-tighter">PRO-GRAMMER-SD</p>
               <p className="text-[10px] tracking-[0.4em] font-black uppercase mb-10 opacity-60">Crafted with caffeine and curiosity &copy; {new Date().getFullYear()}</p>
               <div className="flex justify-center items-center gap-6">
                  <div className="w-16 h-px bg-coffee-900" />
                  <div className="text-coffee-800 hover:text-coffee-600 transition-colors cursor-pointer"><Coffee size={28} /></div>
                  <div className="w-16 h-px bg-coffee-900" />
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
                className="fixed bottom-10 right-10 p-5 bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-950 rounded-full shadow-2xl z-50 hover:scale-110 active:scale-90 transition-all group"
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
