
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, GitFork, GitBranch, ChevronDown, Check, Pin, Tag, ExternalLink, Terminal, BarChart2, Coffee, CircleDot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { GitHubRepo } from '../types';
import { fetchReadme, analyzeRepo } from '../services/githubService';
import RepoStatsModal from './RepoStatsModal';

interface RepoCardProps {
  repo: GitHubRepo;
  isPinned?: boolean;
  tag?: string;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo, isPinned = false, tag }) => {
  const [expanded, setExpanded] = useState(false);
  const [readme, setReadme] = useState<string | null>(null);
  const [readmeBranch, setReadmeBranch] = useState<string>('main');
  const [loadingReadme, setLoadingReadme] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const analysis = analyzeRepo(repo);

  const firstTopic = repo.topics && repo.topics.length > 0 ? repo.topics[0] : null;

  const toggleExpand = async () => {
    if (!expanded && !readme) {
      setLoadingReadme(true);
      const result = await fetchReadme(repo.name, repo.default_branch);
      if (result) {
          setReadme(result.content);
          setReadmeBranch(result.branch);
      } else {
          setReadme('No README found.');
      }
      setLoadingReadme(false);
    }
    setExpanded(!expanded);
  };

  const copyCloneUrl = () => {
    navigator.clipboard.writeText(`git clone ${repo.clone_url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const transformImageUri = (uri: string) => {
      if (uri.startsWith('http') || uri.startsWith('//') || uri.startsWith('data:')) return uri;
      const cleanPath = uri.replace(/^\.?\//, '');
      return `https://raw.githubusercontent.com/${repo.full_name}/${readmeBranch}/${cleanPath}`;
  };

  return (
    <>
      <motion.div 
        layout
        className={`group rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden flex flex-col relative border-2 transition-all duration-500 ${
          isPinned 
            ? 'border-coffee-700 dark:border-coffee-400 bg-coffee-100/90 dark:bg-coffee-900/90 shadow-2xl' 
            : 'border-coffee-200 dark:border-coffee-800 bg-coffee-50 dark:bg-coffee-950/40 shadow-xl'
        }`}
      >
        {/* Social Preview Image with subtle zoom effect */}
        {repo.repoImage && (
          <div className="relative h-44 sm:h-52 overflow-hidden">
            <img 
              src={repo.repoImage} 
              alt={repo.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className={`absolute inset-0 bg-gradient-to-t to-transparent ${isPinned ? 'from-coffee-100/95 dark:from-coffee-900/95' : 'from-coffee-50 dark:from-coffee-950/80'}`} />
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <div className="p-6 sm:p-10 pb-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        <GitBranch size={18} className="text-coffee-600 dark:text-coffee-400 flex-shrink-0" />
                        <h3 className="font-display font-bold text-xl sm:text-2xl text-coffee-900 dark:text-coffee-100 group-hover:text-coffee-700 dark:group-hover:text-coffee-300 transition-colors truncate">
                          {repo.name}
                        </h3>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                    {repo.language && (
                        <span className="px-3 py-1 bg-coffee-800 dark:bg-coffee-200 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white dark:text-coffee-950 rounded-md border border-coffee-900 dark:border-coffee-100 shadow-sm">
                            {repo.language}
                        </span>
                    )}
                    {firstTopic && (
                        <div className="px-3 py-1 bg-coffee-100 dark:bg-coffee-800 text-coffee-600 dark:text-coffee-300 border border-coffee-200 dark:border-coffee-700 rounded-md flex items-center gap-1 shadow-sm">
                            <Coffee size={9} />
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{firstTopic}</span>
                        </div>
                    )}
                    {tag && (
                        <div className="px-2 py-1 bg-coffee-200/50 dark:bg-coffee-800/50 text-coffee-700 dark:text-coffee-400 border border-coffee-300 dark:border-coffee-700 rounded-full flex items-center gap-1">
                            <Tag size={9} />
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{tag}</span>
                        </div>
                    )}
                </div>
              </div>
              {isPinned && (
                <div className="bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-950 p-2 sm:p-2.5 rounded-full shadow-lg flex-shrink-0">
                  <Pin size={16} className="fill-current" />
                </div>
              )}
            </div>

            <p className="text-coffee-700 dark:text-coffee-300 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed min-h-[4rem] line-clamp-2">
                {repo.description || "A smooth, undocumented blend of pure code."}
            </p>

            {/* Metrics Row: Stars, Forks, and Issues (The requested concentric icon) */}
            <div className="flex items-center gap-5 sm:gap-6 mb-8 sm:mb-10">
                <div className="flex items-center gap-1.5 sm:gap-2 group/stat">
                    <Star size={16} className="text-coffee-600 dark:text-coffee-400 transition-transform group-hover/stat:scale-110" />
                    <span className="font-black text-xs sm:text-sm text-coffee-800 dark:text-coffee-200">{repo.stargazers_count}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 group/stat">
                    <GitFork size={16} className="text-coffee-500 transition-transform group-hover/stat:scale-110" />
                    <span className="font-black text-xs sm:text-sm text-coffee-800 dark:text-coffee-200">{repo.forks_count}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 group/stat">
                    <CircleDot size={16} className="text-red-500/80 transition-transform group-hover/stat:scale-110" />
                    <span className="font-black text-xs sm:text-sm text-coffee-800 dark:text-coffee-200">{repo.open_issues_count}</span>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                   <span className="text-[10px] font-black text-coffee-400 uppercase tracking-widest">{analysis.roast}</span>
                </div>
            </div>

            <div className="grid grid-cols-5 sm:flex sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
              <a 
                href={repo.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="col-span-2 sm:flex-1 min-h-[48px] sm:min-h-[56px] bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-950 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
              >
                <span className="hidden xs:inline">TASTE</span> CODE
                <ExternalLink size={16} />
              </a>
              <button 
                onClick={copyCloneUrl}
                className={`col-span-2 sm:flex-1 min-h-[48px] sm:min-h-[56px] px-2 sm:px-4 border-2 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1 sm:gap-3 transition-all duration-300 ${
                    copied 
                    ? 'bg-coffee-600 border-coffee-600 text-white' 
                    : 'bg-white dark:bg-coffee-900/50 border-coffee-200 dark:border-coffee-700 text-coffee-800 dark:text-coffee-100 hover:bg-coffee-50'
                }`}
              >
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider truncate">
                  {copied ? 'COPIED' : 'CLONE'}
                </span>
                <Terminal size={16} className="flex-shrink-0" />
              </button>
              <button
                onClick={() => setShowStats(true)}
                className="col-span-1 min-h-[48px] sm:w-[56px] sm:h-[56px] flex-shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl border-2 border-coffee-200 dark:border-coffee-700 text-coffee-600 dark:text-coffee-300 hover:bg-coffee-100 dark:hover:bg-coffee-800 transition-all active:scale-95"
                title="View Contribution Activity"
              >
                <BarChart2 size={20} />
              </button>
            </div>

            <div className="mt-auto pt-6 sm:pt-8 border-t border-coffee-200 dark:border-coffee-800">
                <button 
                    onClick={toggleExpand}
                    className="w-full text-[10px] sm:text-xs font-black tracking-widest text-coffee-500 hover:text-coffee-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                    {expanded ? 'HIDE SPECS' : 'DETAILED NOTES'}
                    <ChevronDown className={`transition-transform duration-500 ${expanded ? 'rotate-180' : ''}`} size={16} />
                </button>
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                className="bg-coffee-100/50 dark:bg-black/40 overflow-hidden border-t border-coffee-200 dark:border-coffee-800"
              >
                <div className="p-6 sm:p-10 prose prose-xs sm:prose-sm dark:prose-invert max-w-none prose-p:text-coffee-800 dark:prose-p:text-coffee-200 prose-headings:text-coffee-950 dark:prose-headings:text-white prose-pre:bg-coffee-900 prose-code:text-coffee-400">
                    {loadingReadme ? (
                      <div className="flex flex-col items-center py-10 sm:py-12 gap-4">
                        <div className="w-8 h-8 border-4 border-coffee-300 border-t-coffee-800 rounded-full animate-spin" />
                        <span className="text-[10px] sm:text-xs font-bold text-coffee-400 animate-pulse uppercase tracking-widest">Grinding documentation...</span>
                      </div>
                    ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} urlTransform={transformImageUri}>
                            {readme || ''}
                        </ReactMarkdown>
                    )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <AnimatePresence>
        {showStats && (
            <RepoStatsModal repo={repo} onClose={() => setShowStats(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default RepoCard;
