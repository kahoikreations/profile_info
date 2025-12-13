import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchProfile, fetchRepos, fetchPinnedRepos, fetchFollowers } from './services/githubService';
import { GitHubUser, GitHubRepo } from './types';
import CoffeeLoader from './components/CoffeeLoader';
import Navbar from './components/Navbar';
import ProfileHero from './components/ProfileHero';
import RepoGrid from './components/RepoGrid';
import FollowersList from './components/FollowersList';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [pinnedRepos, setPinnedRepos] = useState<GitHubRepo[]>([]);
  const [followers, setFollowers] = useState<GitHubUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'followers'>('home');
  
  // Theme State
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const init = async () => {
      // Minimum loading time of 4 seconds as requested for the experience
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 4000));
      
      try {
        const [userData, reposData, pinnedData, followersData] = await Promise.all([
          fetchProfile(),
          fetchRepos(),
          fetchPinnedRepos(),
          fetchFollowers(),
          minLoadTime
        ]);

        setUser(userData);
        setRepos(reposData);
        setPinnedRepos(pinnedData);
        setFollowers(followersData);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Could not load GitHub data. Rate limit might be exceeded.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

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

      {!loading && !error && user && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen flex flex-col bg-coffee-50 dark:bg-coffee-950 transition-colors duration-500"
        >
          <Navbar 
            user={user} 
            isDark={isDark} 
            toggleTheme={toggleTheme} 
            currentView={currentView}
            setView={setCurrentView}
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

          <footer className="bg-white dark:bg-coffee-900 py-8 border-t border-coffee-200 dark:border-coffee-800 mt-auto transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-4 text-center text-coffee-500 dark:text-coffee-400 text-sm">
              <p>&copy; {new Date().getFullYear()} {user.name}. Brewed with React & Coffee.</p>
            </div>
          </footer>
        </motion.div>
      )}

      {error && !loading && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-coffee-50 dark:bg-coffee-950 text-coffee-900 dark:text-coffee-100">
            <div className="text-6xl mb-4">☕💔</div>
            <h1 className="text-2xl font-bold mb-2">Out of Coffee Beans</h1>
            <p className="text-coffee-600 dark:text-coffee-400">{error}</p>
            <p className="text-xs text-coffee-400 dark:text-coffee-500 mt-4">Try refreshing in a few minutes.</p>
        </div>
      )}
    </>
  );
};

export default App;