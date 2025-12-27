
import React, { useState } from 'react';
import { Coffee, Github, Home, Package, Sun, Moon, Users, Menu, X, RefreshCw, BarChart3 } from 'lucide-react';
import { GitHubUser } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  user: GitHubUser | null;
  isDark: boolean;
  toggleTheme: (e?: any) => void;
  currentView: 'home' | 'followers' | 'stats';
  setView: (view: 'home' | 'followers' | 'stats') => void;
  onRefresh: () => void;
  isUsingCache?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, isDark, toggleTheme, currentView, setView, onRefresh, isUsingCache }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000); 
  };

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (currentView !== 'home') {
        setView('home');
        setTimeout(() => {
             const element = document.getElementById(id);
             if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSetView = (view: 'home' | 'followers' | 'stats') => {
      setView(view);
      setIsMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
      { id: 'home', label: 'Lobby', icon: Home, action: () => handleSetView('home'), active: currentView === 'home' },
      { id: 'stats', label: 'Metrics', icon: BarChart3, action: () => handleSetView('stats'), active: currentView === 'stats' },
      { id: 'followers', label: 'Patrons', icon: Users, action: () => handleSetView('followers'), active: currentView === 'followers' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-coffee-50/90 dark:bg-coffee-950/90 backdrop-blur-md border-b border-coffee-200 dark:border-coffee-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => handleSetView('home')}>
            <div className="relative">
                {user ? (
                    <img className="h-10 w-10 rounded-full border-2 border-coffee-600 dark:border-coffee-400 group-hover:scale-105 transition-transform" src={user.avatar_url} alt={user.login} />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-coffee-300 animate-pulse flex items-center justify-center">
                       <Coffee size={18} className="text-coffee-100" />
                    </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-coffee-800 rounded-full p-0.5">
                    <Coffee size={12} className="text-coffee-700 dark:text-coffee-300" />
                </div>
            </div>
            <span className="ml-3 font-display font-black text-lg text-coffee-800 dark:text-coffee-100 block">
              {user?.login || '...'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex space-x-2">
                {navLinks.map((link) => (
                    <button 
                        key={link.label}
                        onClick={link.action}
                        className={`px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${link.active ? 'text-white dark:text-coffee-950 bg-coffee-800 dark:bg-coffee-100 shadow-lg' : 'text-coffee-600 dark:text-coffee-400 hover:text-coffee-900 dark:hover:text-white hover:bg-coffee-100 dark:hover:bg-coffee-900'}`}
                    >
                    <link.icon size={16} />
                    <span>{link.label}</span>
                    </button>
                ))}
            </div>
            
            <div className="h-6 w-px bg-coffee-200 dark:bg-coffee-800 hidden sm:block mx-2" />

            <button onClick={handleRefresh} className="p-2.5 rounded-full text-coffee-600 dark:text-coffee-300 hover:bg-coffee-100 dark:hover:bg-coffee-800 transition-colors relative">
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                {isUsingCache && <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
            </button>

            <button onClick={(e) => toggleTheme(e)} className="p-2.5 rounded-full text-coffee-600 dark:text-coffee-300 hover:bg-coffee-100 dark:hover:bg-coffee-800 transition-colors">
                <motion.div animate={{ rotate: isDark ? 180 : 0 }} transition={{ duration: 0.5 }}>
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </motion.div>
            </button>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-coffee-600 dark:text-coffee-300 hover:bg-coffee-100 dark:hover:bg-coffee-800 rounded-md transition-colors">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-coffee-50 dark:bg-coffee-950 border-t border-coffee-200 dark:border-coffee-800 overflow-hidden"
            >
                <div className="px-4 py-6 space-y-2">
                    {navLinks.map((link) => (
                        <button
                            key={link.label}
                            onClick={link.action}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-colors ${
                                link.active 
                                ? 'bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-900' 
                                : 'text-coffee-600 dark:text-coffee-400 hover:bg-coffee-100 dark:hover:bg-coffee-900'
                            }`}
                        >
                            <link.icon size={20} />
                            {link.label}
                        </button>
                    ))}
                    <a 
                      href={`https://github.com/${user?.login}`} 
                      target="_blank" 
                      className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-coffee-600 dark:text-coffee-400 border border-coffee-100 dark:border-coffee-800"
                    >
                      <Github size={20} />
                      Source Hub
                    </a>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
