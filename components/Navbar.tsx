import React from 'react';
import { Coffee, Github, Home, Package, Sun, Moon, Users } from 'lucide-react';
import { GitHubUser } from '../types';
import { motion } from 'framer-motion';

interface NavbarProps {
  user: GitHubUser | null;
  isDark: boolean;
  toggleTheme: () => void;
  currentView: 'home' | 'followers';
  setView: (view: 'home' | 'followers') => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, isDark, toggleTheme, currentView, setView }) => {
  const scrollToSection = (id: string) => {
    if (currentView !== 'home') {
        setView('home');
        // Allow render to happen then scroll
        setTimeout(() => {
             const element = document.getElementById(id);
             if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-coffee-50/90 dark:bg-coffee-950/90 backdrop-blur-md border-b border-coffee-200 dark:border-coffee-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand / Profile */}
          <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => scrollToSection('hero')}>
            <div className="relative">
                {user ? (
                    <img className="h-10 w-10 rounded-full border-2 border-coffee-600 dark:border-coffee-400 group-hover:scale-105 transition-transform" src={user.avatar_url} alt={user.login} />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-coffee-300 animate-pulse" />
                )}
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-coffee-800 rounded-full p-0.5">
                    <Coffee size={12} className="text-coffee-700 dark:text-coffee-300" />
                </div>
            </div>
            <span className="ml-3 font-display font-bold text-lg text-coffee-800 dark:text-coffee-100 hidden sm:block">
              pro-grammer-SD
            </span>
          </div>

          {/* Controls & Links */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Nav Links */}
            <div className="hidden md:flex space-x-2">
                <button 
                    onClick={() => scrollToSection('hero')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${currentView === 'home' ? 'text-coffee-900 dark:text-white bg-coffee-100 dark:bg-coffee-800' : 'text-coffee-600 dark:text-coffee-300 hover:text-coffee-900 dark:hover:text-white hover:bg-coffee-100 dark:hover:bg-coffee-800'}`}
                >
                <Home size={18} />
                <span>Home</span>
                </button>
                <button 
                    onClick={() => setView('followers')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${currentView === 'followers' ? 'text-coffee-900 dark:text-white bg-coffee-100 dark:bg-coffee-800' : 'text-coffee-600 dark:text-coffee-300 hover:text-coffee-900 dark:hover:text-white hover:bg-coffee-100 dark:hover:bg-coffee-800'}`}
                >
                <Users size={18} />
                <span>People</span>
                </button>
                <button 
                    onClick={() => scrollToSection('repos')}
                    className="text-coffee-600 dark:text-coffee-300 hover:text-coffee-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-coffee-100 dark:hover:bg-coffee-800 flex items-center gap-2"
                >
                <Package size={18} />
                <span>Repos</span>
                </button>
            </div>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-coffee-600 dark:text-coffee-300 hover:bg-coffee-100 dark:hover:bg-coffee-800 transition-colors relative overflow-hidden"
                title="Toggle Roast"
            >
                <motion.div
                    initial={false}
                    animate={{ rotate: isDark ? 180 : 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </motion.div>
            </button>

             <a 
                href="https://github.com/pro-grammer-SD" 
                target="_blank" 
                rel="noreferrer"
                className="text-coffee-600 dark:text-coffee-300 hover:text-coffee-900 dark:hover:text-white px-3 py-2 rounded-md transition-colors hover:bg-coffee-100 dark:hover:bg-coffee-800 flex items-center gap-2"
            >
              <Github size={18} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;