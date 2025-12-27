
import React, { useState, useMemo } from 'react';
import { Search, Coffee, Sparkles, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { GitHubRepo } from '../types';
import RepoCard from './RepoCard';
import { motion, AnimatePresence } from 'framer-motion';

interface RepoGridProps {
  repos: GitHubRepo[];
  pinnedRepos: GitHubRepo[];
  tags: Record<string, string>;
}

const ITEMS_PER_PAGE = 10;

const RepoGrid: React.FC<RepoGridProps> = ({ repos, pinnedRepos, tags }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLang, setSelectedLang] = useState<string>('All Roasts');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const languages = useMemo(() => {
    const langs = new Set<string>(['All Roasts']);
    repos.forEach(r => { if (r.language) langs.add(r.language); });
    return Array.from(langs);
  }, [repos]);

  const filteredOthers = useMemo(() => {
    return repos
      .filter(r => !pinnedRepos.some(p => p.name === r.name))
      .filter(repo => {
        const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesLang = selectedLang === 'All Roasts' || repo.language === selectedLang;
        return matchesSearch && matchesLang;
      });
  }, [repos, pinnedRepos, searchTerm, selectedLang]);

  const totalPages = Math.ceil(filteredOthers.length / ITEMS_PER_PAGE);
  const currentRepos = filteredOthers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleLangChange = (lang: string) => {
    setSelectedLang(lang);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  return (
    <section id="repos" className="py-24 bg-white dark:bg-coffee-950 rounded-t-[5rem] shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.1)] relative z-10 -mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-10">
            <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-coffee-100 dark:bg-coffee-900 text-coffee-700 dark:text-coffee-300 rounded-full text-xs font-black uppercase tracking-tighter mb-4">
                  <Sparkles size={14} />
                  <span>Curated Collections</span>
                </div>
                <h2 className="text-5xl sm:text-6xl font-display font-black text-coffee-950 dark:text-coffee-50 tracking-tight leading-none">
                    The Archive
                </h2>
                <p className="mt-4 text-coffee-500 dark:text-coffee-400 text-lg font-serif italic">Every batch of code, roasted to perfection.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-80 group">
                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-coffee-400 group-focus-within:text-coffee-800 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search specific roasts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-8 py-3.5 bg-coffee-50 dark:bg-coffee-900 border-2 border-transparent focus:border-coffee-200 dark:focus:border-coffee-800 rounded-2xl outline-none transition-all dark:text-white font-medium text-sm"
                    />
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="w-full sm:w-48 px-6 py-3.5 bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-between gap-2 shadow-lg"
                    >
                        <span>{selectedLang}</span>
                        <ChevronDown size={16} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-coffee-900 border border-coffee-200 dark:border-coffee-800 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto no-scrollbar"
                            >
                                {languages.map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => handleLangChange(lang)}
                                        className="w-full text-left px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-coffee-50 dark:hover:bg-coffee-800 transition-colors text-coffee-700 dark:text-coffee-300"
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>

        {currentPage === 1 && pinnedRepos.length > 0 && selectedLang === 'All Roasts' && searchTerm === '' && (
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-10">
              <h3 className="text-sm font-black uppercase tracking-[0.4em] text-coffee-400">Signature Series</h3>
              <div className="h-px flex-1 bg-coffee-100 dark:bg-coffee-900" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {pinnedRepos.map(repo => (
                  <RepoCard key={`pin-${repo.name}`} repo={repo} isPinned={true} tag={tags[repo.name]} />
              ))}
            </div>
          </div>
        )}

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-coffee-400">Seasonal Blends</h3>
            <div className="h-px flex-1 bg-coffee-100 dark:bg-coffee-900" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-10">
              <AnimatePresence mode="popLayout">
                {currentRepos.map((repo, idx) => (
                    <motion.div
                      key={repo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <RepoCard repo={repo} tag={tags[repo.name]} />
                    </motion.div>
                ))}
              </AnimatePresence>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-8 py-12">
            <button 
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
              className="p-4 bg-coffee-100 dark:bg-coffee-900 text-coffee-800 dark:text-coffee-200 rounded-full disabled:opacity-30 hover:scale-110 transition-all shadow-md"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-center font-display">
                <span className="text-2xl font-black text-coffee-900 dark:text-coffee-100">{currentPage}</span>
                <span className="mx-2 text-coffee-300">/</span>
                <span className="text-2xl font-black text-coffee-400">{totalPages}</span>
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
              className="p-4 bg-coffee-100 dark:bg-coffee-900 text-coffee-800 dark:text-coffee-200 rounded-full disabled:opacity-30 hover:scale-110 transition-all shadow-md"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {filteredOthers.length === 0 && (
          <div className="text-center py-40">
             <p className="text-xl font-display text-coffee-400 uppercase tracking-widest font-black">Cellar search returned no matches.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RepoGrid;
