import React, { useState, useMemo } from 'react';
import { Search, Filter, FlaskConical, Clock, Star, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitHubRepo } from '../types';
import RepoCard from './RepoCard';

interface RepoGridProps {
  repos: GitHubRepo[];
  pinnedRepos: GitHubRepo[];
}

const RepoGrid: React.FC<RepoGridProps> = ({ repos, pinnedRepos }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Extract unique languages from all repos
  const languages = useMemo(() => {
    const langs = new Set([...repos, ...pinnedRepos].map(r => r.language).filter(Boolean));
    return ['All', ...Array.from(langs).sort()];
  }, [repos, pinnedRepos]);

  const filterRepo = (repo: GitHubRepo) => {
      const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLang = languageFilter === 'All' || repo.language === languageFilter;
      return matchesSearch && matchesLang;
  };

  const filteredPinned = pinnedRepos.filter(filterRepo);
  const filteredOthers = repos.filter(r => !pinnedRepos.some(p => p.name === r.name)).filter(filterRepo);

  const brewingProjects = [
    { title: "Espresso AI", desc: "A neural network that predicts the perfect grind size." },
    { title: "Latte Layouts", desc: "CSS framework based entirely on coffee art patterns." },
    { title: "Bean Counter", desc: "Blockchain-based inventory management for roasters." }
  ];

  return (
    <section id="repos" className="py-16 bg-white dark:bg-coffee-950 rounded-t-[3rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] min-h-screen relative z-10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
                <h2 className="text-4xl font-display font-bold text-coffee-900 dark:text-coffee-100 flex items-center gap-3">
                    <span className="bg-coffee-100 dark:bg-coffee-800 p-2 rounded-xl text-3xl shadow-sm">📦</span>
                    The Code Pantry
                </h2>
                <p className="mt-2 text-coffee-600 dark:text-coffee-400">Freshly brewed open source contributions.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-start sm:items-center">
                
                {/* Search */}
                <div className="relative group w-full sm:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-coffee-400 group-focus-within:text-coffee-600 dark:group-focus-within:text-coffee-300" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full sm:w-64 border border-coffee-200 dark:border-coffee-700 rounded-xl focus:ring-2 focus:ring-coffee-400 focus:border-coffee-400 outline-none transition-all bg-coffee-50 dark:bg-coffee-900 placeholder-coffee-300 dark:placeholder-coffee-600 text-coffee-800 dark:text-coffee-200 shadow-inner"
                    />
                </div>

                {/* Animated Filter Button & Dropdown */}
                <div className="relative w-full sm:w-auto">
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center justify-between w-full sm:w-48 px-4 py-2 bg-coffee-50 dark:bg-coffee-900 border border-coffee-200 dark:border-coffee-700 rounded-xl text-coffee-800 dark:text-coffee-200 focus:outline-none hover:bg-coffee-100 dark:hover:bg-coffee-800 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-coffee-400" />
                            <span className="truncate">{languageFilter}</span>
                        </div>
                        {isFilterOpen ? <X size={16} /> : <ChevronDown size={16} />}
                    </button>

                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-full mt-2 w-full sm:w-48 bg-white dark:bg-coffee-900 border border-coffee-200 dark:border-coffee-700 rounded-xl shadow-lg z-30 overflow-hidden"
                            >
                                <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                                    {languages.map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => { setLanguageFilter(lang); setIsFilterOpen(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-coffee-50 dark:hover:bg-coffee-800 ${
                                                languageFilter === lang 
                                                ? 'text-coffee-800 dark:text-coffee-100 font-bold bg-coffee-50 dark:bg-coffee-800' 
                                                : 'text-coffee-600 dark:text-coffee-400'
                                            }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>

        {/* Signature Blends (Pinned) */}
        {filteredPinned.length > 0 && (
            <div className="mb-16">
                <h3 className="text-2xl font-display font-bold text-coffee-800 dark:text-coffee-200 mb-6 flex items-center gap-2">
                    <Star className="fill-coffee-500 text-coffee-500" /> Signature Blends
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPinned.map(repo => (
                        <RepoCard key={`pin-${repo.name}`} repo={repo} isPinned={true} />
                    ))}
                </div>
            </div>
        )}

        {/* Other Repos */}
        {filteredOthers.length > 0 && (
            <div className="mb-16">
                 <h3 className="text-xl font-display font-bold text-coffee-700 dark:text-coffee-300 mb-6 flex items-center gap-2">
                    <FlaskConical className="text-coffee-400" /> Experimental Batches
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOthers.map(repo => (
                        <RepoCard key={repo.id} repo={repo} />
                    ))}
                </div>
            </div>
        )}

        {/* No Results */}
        {filteredPinned.length === 0 && filteredOthers.length === 0 && (
            <div className="text-center py-20 text-coffee-400 dark:text-coffee-600">
                <p className="text-xl">No blends found matching your taste.</p>
                <button 
                    onClick={() => { setSearchTerm(''); setLanguageFilter('All'); }}
                    className="mt-4 text-coffee-600 dark:text-coffee-300 underline hover:text-coffee-800 dark:hover:text-white"
                >
                    Clear filters
                </button>
            </div>
        )}

        {/* Brewing Soon Section */}
        <div className="mt-20 border-t-2 border-dashed border-coffee-200 dark:border-coffee-800 pt-16">
             <div className="text-center mb-10">
                <h2 className="text-3xl font-display font-bold text-coffee-800 dark:text-coffee-100 inline-flex items-center gap-3">
                    <Clock className="text-coffee-500 animate-pulse" size={32} />
                    Brewing Soon
                </h2>
                <p className="text-coffee-500 dark:text-coffee-400 mt-2">Experimental roasts currently in development.</p>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {brewingProjects.map((proj, idx) => (
                    <div key={idx} className="bg-coffee-50 dark:bg-coffee-900 rounded-xl p-6 border border-coffee-100 dark:border-coffee-800 flex flex-col items-center text-center opacity-80 hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-coffee-200 dark:bg-coffee-800 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl animate-bounce" style={{ animationDelay: `${idx * 0.2}s` }}>☕</span>
                        </div>
                        <h4 className="font-display font-bold text-lg text-coffee-800 dark:text-coffee-200">{proj.title}</h4>
                        <p className="text-sm text-coffee-600 dark:text-coffee-400 mt-2">{proj.desc}</p>
                        <div className="mt-4 text-xs font-bold text-coffee-400 uppercase tracking-widest bg-coffee-100 dark:bg-coffee-800 px-2 py-1 rounded">
                            Steeping...
                        </div>
                    </div>
                ))}
             </div>
        </div>
      </div>
    </section>
  );
};

export default RepoGrid;