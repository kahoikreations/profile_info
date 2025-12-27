
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, GitFork, GitBranch, ChevronDown, Check, Pin, Tag, ExternalLink, Terminal, BarChart2 } from 'lucide-react';
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

  const activityData = useMemo(() => {
    const seed = repo.id;
    return Array.from({ length: 8 }, (_, i) => {
      const val = Math.abs(Math.sin(seed + i)) * (repo.stargazers_count + 1);
      return Math.min(Math.max(val % 10, 2), 10);
    });
  }, [repo.id, repo.stargazers_count]);

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
        className={`group rounded-[2rem] overflow-hidden flex relative border-2 transition-all duration-500 ${
          isPinned 
            ? 'border-coffee-700 dark:border-coffee-400 bg-coffee-100/90 dark:bg-coffee-900/90 shadow-2xl' 
            : 'border-coffee-200 dark:border-coffee-800 bg-coffee-50 dark:bg-coffee-950/40 shadow-xl'
        }`}
      >
        {/* Side Heatbars - Properly positioned in side */}
        <div className="w-4 flex flex-col justify-center gap-1.5 p-1.5 bg-coffee-200/10 dark:bg-coffee-950/40 border-r border-coffee-200/30 dark:border-coffee-800/30">
          {activityData.map((val, i) => (
            <div 
              key={i} 
              className="w-full rounded-full transition-all duration-1000"
              style={{ 
                backgroundColor: isPinned ? `rgba(111, 69, 59, ${val/10})` : `rgba(167, 127, 114, ${val/10})`,
                height: `${val * 4}px`
              }}
            />
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-8 pb-4 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <GitBranch size={18} className="text-coffee-600 dark:text-coffee-400" />
                    <h3 className="font-display font-bold text-2xl text-coffee-900 dark:text-coffee-100 group-hover:text-coffee-700 dark:group-hover:text-coffee-300 transition-colors">
                      {repo.name}
                    </h3>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                    {repo.language && (
                        <span className="px-4 py-1 bg-coffee-800 dark:bg-coffee-200 text-[10px] font-black uppercase tracking-widest text-white dark:text-coffee-950 rounded-md border border-coffee-900 dark:border-coffee-100 shadow-sm">
                            {repo.language}
                        </span>
                    )}
                    {tag && (
                        <div className="px-3 py-1 bg-coffee-200/50 dark:bg-coffee-800/50 text-coffee-700 dark:text-coffee-400 border border-coffee-300 dark:border-coffee-700 rounded-full flex items-center gap-1.5">
                            <Tag size={10} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{tag}</span>
                        </div>
                    )}
                </div>
              </div>
              {isPinned && (
                <div className="bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-950 p-2 rounded-full shadow-lg">
                  <Pin size={16} className="fill-current" />
                </div>
              )}
            </div>

            <p className="text-coffee-700 dark:text-coffee-300 mb-6 text-sm leading-relaxed min-h-[3rem] line-clamp-2">
                {repo.description || "A smooth, undocumented blend of pure code."}
            </p>

            <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-1.5">
                    <Star size={18} className="text-coffee-600 dark:text-coffee-400" />
                    <span className="font-bold text-coffee-800 dark:text-coffee-200">{repo.stargazers_count}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <GitFork size={18} className="text-coffee-500" />
                    <span className="font-bold text-coffee-800 dark:text-coffee-200">{repo.forks_count}</span>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[10px] font-black text-coffee-400 uppercase tracking-tighter">{analysis.roast}</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a 
                href={repo.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 min-h-[52px] bg-coffee-800 dark:bg-coffee-100 text-white dark:text-coffee-950 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
              >
                <span>TASTE CODE</span>
                <ExternalLink size={16} />
              </a>
              <button 
                onClick={copyCloneUrl}
                className={`flex-1 min-h-[52px] px-4 border-2 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 ${
                    copied 
                    ? 'bg-coffee-600 border-coffee-600 text-white' 
                    : 'bg-white dark:bg-coffee-900/50 border-coffee-200 dark:border-coffee-700 text-coffee-800 dark:text-coffee-100 hover:bg-coffee-50'
                }`}
              >
                {copied ? (
                    <>
                        <span className="text-[11px] font-black uppercase tracking-wider">COPIED URL</span>
                        <Check size={18} />
                    </>
                ) : (
                    <>
                        <span className="text-[11px] font-black uppercase tracking-wider">CLONE REPO</span>
                        <Terminal size={18} />
                    </>
                )}
              </button>
              <button
                onClick={() => setShowStats(true)}
                className="w-[52px] h-[52px] flex-shrink-0 flex items-center justify-center rounded-2xl border-2 border-coffee-200 dark:border-coffee-700 text-coffee-600 dark:text-coffee-300 hover:bg-coffee-100 dark:hover:bg-coffee-800 transition-all active:scale-95"
                title="View Contribution Activity"
              >
                <BarChart2 size={20} />
              </button>
            </div>

            <div className="mt-auto pt-6 border-t border-coffee-200 dark:border-coffee-800">
                <button 
                    onClick={toggleExpand}
                    className="w-full text-xs font-black tracking-widest text-coffee-500 hover:text-coffee-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                    {expanded ? 'HIDE SPECS' : 'DETAILED NOTES'}
                    <ChevronDown className={`transition-transform duration-500 ${expanded ? 'rotate-180' : ''}`} size={14} />
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
                <div className="p-8 prose prose-sm dark:prose-invert max-w-none prose-p:text-coffee-800 dark:prose-p:text-coffee-200 prose-headings:text-coffee-950 dark:prose-headings:text-white prose-pre:bg-coffee-900 prose-code:text-coffee-400">
                    {loadingReadme ? (
                      <div className="flex flex-col items-center py-10 gap-4">
                        <div className="w-8 h-8 border-4 border-coffee-300 border-t-coffee-800 rounded-full animate-spin" />
                        <span className="text-xs font-bold text-coffee-400 animate-pulse uppercase tracking-widest">Grinding documentation...</span>
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
