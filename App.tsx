import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { getPortfolioData, RateLimitError } from './services/githubService';
import { GitHubUser, GitHubRepo } from './types';
import CoffeeLoader from './components/CoffeeLoader';
import Navbar from './components/Navbar';
import ProfileHero from './components/ProfileHero';
import RepoGrid from './components/RepoGrid';
import FollowersList from './components/FollowersList';
import PeriodicRefresh from './components/PeriodicRefresh';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  // Unified Data State
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [pinnedRepos, setPinnedRepos] = useState<GitHubRepo[]>([]);
  const [followers, setFollowers] = useState<GitHubUser[]>([]);
  
  // UI State
  const [error, setError] = useState<string | null>(null);
  const [rateLimitReset, setRateLimitReset] = useState<number | null>(null);
  const [showRateLimitDialog, setShowRateLimitDialog] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'followers'>('home');
  const [isDark, setIsDark] = useState(false);
  
  // Calculated state
  const [timeLeftStr, setTimeLeftStr] = useState<string>("--:--:--");

  // Theme Init
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDark(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Rate Limit Timer
  useEffect(() => {
    if (!rateLimitReset) return;
    const updateTimer = () => {
        const diff = (rateLimitReset * 1000) - Date.now();
        if (diff <= 0) {
            setTimeLeftStr("Ready to brew!");
            return;
        }
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };
    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [rateLimitReset]);

  // Main Data Loader
  const loadData = useCallback(async (isInitial: boolean = false, forceRefresh: boolean = false) => {
      if (isInitial) setLoading(true);

      // Artificial delay for initial "Brewing" animation to look good
      const minLoadTime = isInitial ? new Promise(resolve => setTimeout(resolve, 3000)) : Promise.resolve();

      try {
          const [data] = await Promise.all([
              getPortfolioData(forceRefresh),
              minLoadTime
          ]);
          
          setUser(data.user);
          setRepos(data.repos);
          setPinnedRepos(data.pinnedRepos);
          setFollowers(data.followers);
          
          // Clear Errors
          setError(null);
          setRateLimitReset(null);
          setShowRateLimitDialog(false);
          
      } catch (err: any) {
          console.error("Error loading portfolio:", err);
          
          if (err instanceof RateLimitError || err.resetTime) {
              const resetTime = err.resetTime || (Math.floor(Date.now() / 1000) + 3600);
              setRateLimitReset(resetTime);
              
              if (forceRefresh) {
                  setShowRateLimitDialog(true);
              } else {
                  setError("Out of Coffee Beans");
              }
          } else {
              if (!forceRefresh) setError("Network Connection Error");
          }
      } finally {
          if (isInitial) setLoading(false);
      }
  }, []);

  // Initial Load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
            <motion.div 
                key="loader"
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 z-50 bg-coffee-50 dark:bg-coffee-950"
            >
                <CoffeeLoader />
            </motion.div>
        )}
      </AnimatePresence>

      {/* Success View */}
      {!loading && !error && user && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen flex flex-col bg-coffee-50 dark:bg-coffee-950 transition-colors duration-500 relative"
        >
          <Navbar 
            user={user} 
            isDark={isDark} 
            toggleTheme={toggleTheme} 
            currentView={currentView}
            setView={setCurrentView}
            onRefresh={() => loadData(false, true)}
            isUsingCache={true} // Service handles caching invisibly now
          />
          
          <main className="flex-grow">
            <ProfileHero user={user} setView={setCurrentView} />
            
            <AnimatePresence mode="wait">
                {currentView === 'home' ? (
                    <motion.div 
                        key="home"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <RepoGrid repos={repos} pinnedRepos={pinnedRepos} />
                    </motion.div>
                ) : (
                    <motion.div 
                        key="followers"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <FollowersList followers={followers} />
                    </motion.div>
                )}
            </AnimatePresence>
          </main>

          <footer className="bg-white dark:bg-coffee-900 py-8 border-t border-coffee-200 dark:border-coffee-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-coffee-500 dark:text-coffee-400 text-sm">
              <p>&copy; {new Date().getFullYear()} {user.name || user.login}. Brewed with React & Coffee.</p>
              <p className="text-xs text-coffee-400 mt-2 opacity-60">
                 Served via Static/Cache Layer • Rate Limit Protected
              </p>
            </div>
          </footer>

          {/* Dialog for Manual Refresh Rate Limit */}
          <AnimatePresence>
             {showRateLimitDialog && (
                 <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                     <motion.div 
                         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                         className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                         onClick={() => setShowRateLimitDialog(false)}
                     />
                     <motion.div
                         initial={{ scale: 0.9, opacity: 0, y: 20 }}
                         animate={{ scale: 1, opacity: 1, y: 0 }}
                         exit={{ scale: 0.9, opacity: 0, y: 20 }}
                         className="bg-white dark:bg-coffee-900 rounded-2xl p-8 shadow-2xl relative z-10 max-w-md w-full border border-coffee-200 dark:border-coffee-700 text-center"
                     >
                         <h3 className="text-xl font-bold text-coffee-800 dark:text-coffee-100 mb-2">Machine Cooling Down</h3>
                         <p className="text-coffee-600 dark:text-coffee-300 mb-6">
                             We are protecting the GitHub API. Please sip your current brew while we wait.
                         </p>
                         <div className="bg-coffee-50 dark:bg-coffee-800 rounded-lg p-4 mb-6">
                             <div className="text-coffee-500 text-xs font-bold uppercase tracking-wider mb-1">Refill In</div>
                             <div className="font-mono text-3xl font-bold text-coffee-800 dark:text-coffee-100">{timeLeftStr}</div>
                         </div>
                         <button 
                             onClick={() => setShowRateLimitDialog(false)}
                             className="w-full py-3 bg-coffee-600 text-white rounded-xl font-bold hover:bg-coffee-700 transition-colors"
                         >
                             Okay, waiting...
                         </button>
                     </motion.div>
                 </div>
             )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Error / Rate Limit View */}
      {error && !loading && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-coffee-50 dark:bg-coffee-950 text-coffee-900 dark:text-coffee-100 overflow-hidden">
            <PeriodicRefresh onRefresh={() => loadData(false, false)} />
            
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="z-10 max-w-md w-full"
            >
                <div className="text-7xl mb-6">☕💔</div>
                <h1 className="text-3xl font-display font-bold mb-3">{error}</h1>
                <p className="text-coffee-600 dark:text-coffee-300 mb-8 leading-relaxed">
                    The GitHub API rate limit has been reached. 
                    <br/>The system is in cool-down mode.
                </p>

                {rateLimitReset && (
                    <div className="bg-white dark:bg-coffee-900 border border-coffee-200 dark:border-coffee-700 rounded-xl p-6 w-full shadow-lg">
                        <p className="text-xs text-coffee-400 font-bold uppercase tracking-widest mb-2">System Reset In</p>
                        <div className="font-mono text-4xl sm:text-5xl font-bold text-coffee-800 dark:text-coffee-100">
                            {timeLeftStr}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
      )}
    </>
  );
};

export default App;