
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, RefreshCw, Coffee, Github, ExternalLink, Clock } from 'lucide-react';
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
  const [backgroundRetrying, setBackgroundRetrying] = useState(false);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [pinnedRepos, setPinnedRepos] = useState<GitHubRepo[]>([]);
  const [followers, setFollowers] = useState<GitHubUser[]>([]);
  const [tags, setTags] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<CoffeeStats | null>(null);
  const [error, setError] = useState<{ message: string; resetAt?: number } | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'followers' | 'stats'>('home');
  const [isDark, setIsDark] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [ripple, setRipple] = useState<{ x: number, y: number, show: boolean }>({ x: 0, y: 0, show: false });
  const [countdown, setCountdown] = useState<string>('');

  // Fix: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> to resolve namespace errors in frontend context
  const autoRetryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = useCallback(async (isInitial: boolean = false, forceRefresh: boolean = false) => {
    if (isInitial) setLoading(true);
    if (error && !isInitial) setBackgroundRetrying(true);
    
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
      if (err instanceof RateLimitError) {
        setError({ 
          message: "API Limit Reached. Brewing suspended temporarily.", 
          resetAt: err.resetTime 
        });
      } else {
        setError({ message: "Unable to fetch data. Check your connection." });
      }
    } finally {
      if (isInitial) setLoading(false);
      setBackgroundRetrying(false);
    }
  }, [error]);

  // Initial load
  useEffect(() => { loadData(true); }, []);

  // Countdown timer and Auto-retry logic
  useEffect(() => {
    // Fix: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> to resolve namespace errors
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (error?.resetAt) {
      const updateCountdown = () => {
        const now = Math.floor(Date.now() / 1000);
        const diff = error.resetAt! - now;
        if (diff <= 0) {
          setCountdown('Resetting now...');
          loadData(false, true); // Auto trigger on actual reset
          return;
        }
        const m = Math.floor(diff / 60);
        const s = diff % 60;
        setCountdown(`${m}m ${s}s remaining`);
      };

      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
    }

    // Auto retry every 10 seconds if in error state
    if (error) {
        autoRetryTimer.current = setInterval(() => {
            loadData(false, true);
        }, 10000);
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
        {/* Abstract Coffee Rings in BG */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <div className="w-[500px] h-[500px] border-[20px] border-coffee-800 rounded-full animate-ping" />
        </div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-10 bg-white dark:bg-coffee-900/50 backdrop-blur-xl p-12 rounded-[3rem] border border-coffee-200 dark:border-coffee-800 shadow-2xl max-w-lg w-full"
        >
            <div className="w-24 h-24 bg-coffee-100 dark:bg-coffee-800 rounded-full flex items-center justify-center mb-8 mx-auto relative">
                {backgroundRetrying ? (
                    <div className="w-full h-full border-4 border-coffee-200 border-t-coffee-800 rounded-full animate-spin" />
                ) : (
                    <RefreshCw size={48} className="text-coffee-600 dark:text-coffee-300" />
                )}
                {backgroundRetrying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Coffee size={24} className="text-coffee-400 animate-pulse" />
                    </div>
                )}
            </div>

            <h1 className="text-3xl font-display font-black text-coffee-950 dark:text-coffee-50 mb-4 tracking-tighter leading-tight">
                {error.message}
            </h1>
            
            {error.resetAt && (
                <div className="flex items-center justify-center gap-2 mb-8 bg-coffee-50 dark:bg-coffee-800/50 py-3 px-6 rounded-2xl border border-coffee-100 dark:border-coffee-700">
                    <Clock size={16} className="text-coffee-500" />
                    <span className="text-sm font-black uppercase tracking-widest text-coffee-700 dark:text-coffee-300">
                        {countdown}
                    </span>
                </div>
            )}

            <p className="text-coffee-500 dark:text-coffee-400 text-sm mb-10 font-medium leading-relaxed italic">
                {backgroundRetrying ? "Retrying background brew every 10s..." : "The server is a bit over-caffeinated. We'll automatically try again soon."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    disabled={backgroundRetrying}
                    onClick={() => loadData(true, true)} 
                    className="flex-1 px-8 py-4 bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-950 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <RefreshCw size={18} className={backgroundRetrying ? 'animate-spin' : ''} />
                    <span>Retry Brewing</span>
                </button>
                <a 
                    href="https://github.com/pro-grammer-SD/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 px-8 py-4 border-2 border-coffee-200 dark:border-coffee-700 text-coffee-800 dark:text-coffee-100 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-coffee-50 dark:hover:bg-coffee-800 transition-all flex items-center justify-center gap-2"
                >
                    <span>Check Profile</span>
                    <ExternalLink size={18} />
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
