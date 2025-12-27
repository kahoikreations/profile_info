
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
        className={`group rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col relative border-2 transition-all duration-500 h-full ${
          isPinned 
            ? 'border-coffee-700 dark:border-coffee-400 bg-coffee-100/90 dark:bg-coffee-900/90 shadow-2xl' 
            : 'border-coffee-200 dark:border-coffee-800 bg-coffee-50 dark:bg-coffee-950/40 shadow-xl'
        }`}
      >
        {/* Visual Preview Section with Subtle Zoom */}
        {repo.repoImage && (
          <div className="relative h-48 sm:h-56 overflow-hidden">
            <motion.img 
              src={repo.repoImage} 
              alt={repo.name} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className={`absolute inset-0 bg-gradient-to-t to-transparent ${isPinned ? 'from-coffee-100/95 dark:from-coffee-900/95' : 'from-coffee-50 dark:from-coffee-950/90'}`} />
            
            {/* Status Overlays */}
            <div className="absolute top-4 left-4 flex gap-2">
                {isPinned && (
                  <div className="bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-950 px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
                    <Pin size={12} className="fill-current" />
                    <span className="text-[10px] font-black tracking-widest uppercase">Signature</span>
                  </div>
                )}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <div className="p-6 sm:p-10 flex flex-col h-full">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <GitBranch size={16} className="text-coffee-500" />
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-coffee-950 dark:text-coffee-50 tracking-tight truncate group-hover:text-coffee-700 dark:group-hover:text-coffee-400 transition-colors">
                      {repo.name}
                    </h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                    {repo.language && (
                        <span className="px-3 py-1 bg-coffee-800 dark:bg-coffee-200 text-[9px] font-black uppercase tracking-[0.2em] text-white dark:text-coffee-950 rounded-md border border-coffee-900 dark:border-coffee-100">
                            {repo.language}
                        </span>
                    )}
                    {firstTopic && (
                        <div className="px-3 py-1 bg-coffee-100/50 dark:bg-coffee-800/50 text-coffee-600 dark:text-coffee-400 border border-coffee-200 dark:border-coffee-700 rounded-md flex items-center gap-1.5">
                            <Coffee size={10} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{firstTopic}</span>
                        </div>
                    )}
                </div>
            </div>

            <p className="text-coffee-700 dark:text-coffee-300 mb-8 text-sm sm:text-base leading-relaxed min-h-[3.5rem] line-clamp-2 italic font-serif">
                {repo.description || "A smooth, undocumented blend of pure code and late-night inspiration."}
            </p>

            {/* Optimized Metrics Row with requested concentric icon for issues */}
            <div className="flex items-center gap-5 sm:gap-8 mb-8">
                <div className="flex items-center gap-2 group/stat cursor-help" title="Stars">
                    <Star size={18} className="text-coffee-600 dark:text-coffee-400 transition-transform group-hover/stat:scale-125" />
                    <span className="font-black text-sm text-coffee-900 dark:text-coffee-100">{repo.stargazers_count}</span>
                </div>
                <div className="flex items-center gap-2 group/stat cursor-help" title="Forks">
                    <GitFork size={18} className="text-coffee-500 transition-transform group-hover/stat:scale-125" />
                    <span className="font-black text-sm text-coffee-900 dark:text-coffee-100">{repo.forks_count}</span>
                </div>
                <div className="flex items-center gap-2 group/stat cursor-help" title="Open Issues">
                    <CircleDot size={18} className="text-red-500/80 transition-transform group-hover/stat:scale-125" />
                    <span className="font-black text-sm text-coffee-900 dark:text-coffee-100">{repo.open_issues_count}</span>
                </div>
                <div className="ml-auto hidden sm:block">
                   <div className="px-3 py-1 bg-coffee-100 dark:bg-coffee-800/50 rounded-lg">
                      <span className="text-[9px] font-black text-coffee-400 dark:text-coffee-500 uppercase tracking-widest">{analysis.roast}</span>
                   </div>
                </div>
            </div>

            <div className="grid grid-cols-5 sm:flex gap-3 sm:gap-4 mb-8">
              <a 
                href={repo.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="col-span-2 sm:flex-1 min-h-[48px] bg-coffee-900 dark:bg-coffee-100 text-white dark:text-coffee-950 py-3 rounded-2xl font-black text-[10px] sm:text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl"
              >
                <span>TASTE CODE</span>
                <ExternalLink size={14} />
              </a>
              <button 
                onClick={copyCloneUrl}
                className={`col-span-2 sm:flex-1 min-h-[48px] px-4 border-2 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 ${
                    copied 
                    ? 'bg-coffee-600 border-coffee-600 text-white' 
                    : 'bg-white dark:bg-coffee-900/50 border-coffee-200 dark:border-coffee-700 text-coffee-800 dark:text-coffee-100 hover:bg-coffee-50'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest truncate">
                  {copied ? 'COPIED' : 'CLONE'}
                </span>
                <Terminal size={14} className="flex-shrink-0" />
              </button>
              <button
                onClick={() => setShowStats(true)}
                className="col-span-1 min-h-[48px] sm:w-[56px] flex-shrink-0 flex items-center justify-center rounded-2xl border-2 border-coffee-200 dark:border-coffee-700 text-coffee-600 dark:text-coffee-400 hover:bg-coffee-100 dark:hover:bg-coffee-800 transition-all active:scale-95"
                title="Lab Reports"
              >
                <BarChart2 size={20} />
              </button>
            </div>

            <div className="mt-auto pt-6 border-t border-coffee-200 dark:border-coffee-800">
                <button 
                    onClick={toggleExpand}
                    className="w-full text-[10px] font-black tracking-[0.3em] text-coffee-400 hover:text-coffee-900 dark:hover:text-coffee-100 transition-colors flex items-center justify-center gap-3 uppercase"
                >
                    {expanded ? 'Hide Recipe' : 'Detailed Notes'}
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
                className="bg-coffee-100/30 dark:bg-black/20 overflow-hidden border-t border-coffee-200 dark:border-coffee-800"
              >
                <div className="p-8 sm:p-10 prose prose-sm dark:prose-invert max-w-none prose-p:text-coffee-800 dark:prose-p:text-coffee-300 prose-headings:text-coffee-950 dark:prose-headings:text-coffee-100 prose-pre:bg-coffee-900/90 prose-code:text-coffee-400 prose-img:rounded-3xl">
                    {loadingReadme ? (
                      <div className="flex flex-col items-center py-12 gap-5">
                        <div className="w-10 h-10 border-4 border-coffee-200 dark:border-coffee-800 border-t-coffee-700 rounded-full animate-spin" />
                        <span className="text-[10px] font-black text-coffee-400 animate-pulse uppercase tracking-[0.4em]">Steeping docs...</span>
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
