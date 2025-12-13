import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, GitFork, GitBranch, ChevronDown, ChevronUp, Copy, Check, Pin, ArrowUpRight, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { GitHubRepo } from '../types';
import { fetchReadme, analyzeRepo } from '../services/githubService';

interface RepoCardProps {
  repo: GitHubRepo;
  isPinned?: boolean;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo, isPinned = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [readme, setReadme] = useState<string | null>(null);
  const [loadingReadme, setLoadingReadme] = useState(false);
  const [copied, setCopied] = useState(false);

  const analysis = analyzeRepo(repo);

  // Generate deterministic "activity" data based on repo ID
  const activityBars = useMemo(() => {
    const bars = [];
    let seed = repo.id;
    for(let i=0; i<14; i++) {
        // Simple LCG random generator
        seed = (seed * 9301 + 49297) % 233280;
        const height = 20 + Math.floor((seed / 233280) * 80); // 20% to 100% height
        const intensity = height > 80 ? 3 : height > 50 ? 2 : 1;
        bars.push({ height, intensity });
    }
    return bars;
  }, [repo.id]);

  const toggleExpand = async () => {
    if (!expanded && !readme) {
      setLoadingReadme(true);
      const content = await fetchReadme(repo.name, repo.default_branch);
      setReadme(content || 'No README found for this repository.');
      setLoadingReadme(false);
    }
    setExpanded(!expanded);
  };

  const copyClone = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`git clone ${repo.clone_url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pinnedStyle = isPinned 
    ? "border-2 border-coffee-800 dark:border-coffee-500 shadow-[4px_4px_0px_0px_rgba(111,69,59,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,127,114,1)] bg-cream dark:bg-coffee-900"
    : "border border-coffee-200 dark:border-coffee-700 shadow-sm bg-white dark:bg-coffee-900";

  return (
    <motion.div 
      layout
      whileHover={{ 
        y: -5, 
        scale: 1.01,
        boxShadow: isPinned 
            ? "6px 6px 0px 0px rgba(111,69,59,1)" 
            : "0 10px 25px -5px rgba(138, 90, 77, 0.15)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`rounded-xl overflow-hidden flex flex-col relative ${pinnedStyle}`}
    >
        {isPinned && (
            <motion.div 
                className="absolute top-0 right-0 bg-coffee-800 dark:bg-coffee-600 text-white px-3 py-1 rounded-bl-xl z-20 flex items-center gap-1 shadow-sm"
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
            >
                <Pin size={12} className="fill-current" />
                <span className="text-xs font-bold uppercase tracking-wider">Signature</span>
            </motion.div>
        )}

      <div className="p-6 flex flex-col h-full cursor-default">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2 mb-1">
                <GitBranch size={16} className={`${isPinned ? 'text-coffee-800 dark:text-coffee-200' : 'text-coffee-500 dark:text-coffee-400'}`} />
                <h3 className="font-display font-bold text-xl text-coffee-900 dark:text-coffee-100 break-all">{repo.name}</h3>
            </div>
            {repo.language && (
                <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-semibold ${isPinned ? 'bg-coffee-200 dark:bg-coffee-800 text-coffee-800 dark:text-coffee-200' : 'bg-coffee-100 dark:bg-coffee-800 text-coffee-700 dark:text-coffee-300'}`}>
                    {repo.language}
                </span>
            )}
          </div>
        </div>

        {/* Stats with Animation */}
        <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="flex gap-4 text-coffee-700 dark:text-coffee-300 text-sm font-medium">
                <motion.div 
                    className="flex items-center gap-1 cursor-help p-1 rounded hover:bg-coffee-50 dark:hover:bg-coffee-800 transition-colors"
                    whileHover={{ scale: 1.15, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <Star size={16} className={`fill-coffee-300 dark:fill-coffee-700 ${isPinned ? 'text-coffee-600 dark:text-coffee-400' : ''}`} />
                    <span className="font-mono">{repo.stargazers_count}</span>
                </motion.div>
                <motion.div 
                    className="flex items-center gap-1 cursor-help p-1 rounded hover:bg-coffee-50 dark:hover:bg-coffee-800 transition-colors"
                    whileHover={{ scale: 1.15, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <GitFork size={16} />
                    <span className="font-mono">{repo.forks_count}</span>
                </motion.div>
            </div>
            
            {/* Visual Contribution Activity Bar Chart */}
            <div className="flex items-end gap-[2px] h-6" title="Estimated Contribution Activity">
               {activityBars.map((bar, idx) => (
                   <motion.div
                       key={idx}
                       initial={{ height: 0 }}
                       animate={{ height: `${bar.height}%` }}
                       transition={{ delay: 0.1 + (idx * 0.05), duration: 0.5 }}
                       className={`w-1.5 rounded-t-sm ${
                           bar.intensity === 3 
                             ? 'bg-coffee-700 dark:bg-coffee-400' 
                             : bar.intensity === 2 
                               ? 'bg-coffee-500 dark:bg-coffee-600' 
                               : 'bg-coffee-200 dark:bg-coffee-800'
                       }`}
                   />
               ))}
            </div>
        </div>

        {/* Description */}
        <p className="text-coffee-700 dark:text-coffee-400 mb-4 text-sm leading-relaxed line-clamp-3">
            {repo.description || "No description provided."}
        </p>

        {/* AI/Coffee Analysis */}
        <div className={`mt-auto p-3 rounded-lg border mb-4 ${isPinned ? 'bg-coffee-100 dark:bg-coffee-800 border-coffee-200 dark:border-coffee-700' : 'bg-coffee-50 dark:bg-coffee-800 border-coffee-100 dark:border-coffee-700'}`}>
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-coffee-500 dark:text-coffee-400 uppercase tracking-wide">Blend Analysis</span>
                <span className="text-xs font-bold text-coffee-800 dark:text-coffee-200">{analysis.roast}</span>
            </div>
            <p className="text-sm italic text-coffee-800 dark:text-coffee-300">"{analysis.description}"</p>
        </div>

        {/* Action Bar */}
        <div className={`flex items-center justify-between border-t pt-4 mt-2 ${isPinned ? 'border-coffee-200 dark:border-coffee-700' : 'border-coffee-100 dark:border-coffee-800'}`}>
            <div className="flex items-center gap-2">
                <a 
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-coffee-600 dark:bg-coffee-600 text-white rounded-md text-xs hover:bg-coffee-700 dark:hover:bg-coffee-500 transition-colors shadow-sm active:scale-95 transform"
                    title="Go to Repository"
                >
                    <ArrowUpRight size={14} />
                    <span className="font-display font-bold">Go</span>
                </a>
                <button 
                    onClick={copyClone}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-coffee-800 border border-coffee-200 dark:border-coffee-700 text-coffee-700 dark:text-coffee-200 rounded-md text-xs hover:bg-coffee-50 dark:hover:bg-coffee-700 transition-colors shadow-sm active:scale-95 transform"
                    title="Copy Clone Command"
                >
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    {/* Changed from font-mono to standard font (implicit) */}
                    <span className="font-bold">Clone</span>
                </button>
            </div>
            
            <button 
                onClick={toggleExpand}
                className="flex items-center gap-1 text-coffee-700 dark:text-coffee-300 hover:text-coffee-900 dark:hover:text-white text-sm font-bold transition-colors group"
            >
                {expanded ? 'Close Specs' : 'Read Specs'}
                <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    <ChevronDown size={16} />
                </motion.div>
            </button>
        </div>
      </div>

      {/* Expanded Content (README) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="bg-white dark:bg-coffee-950 border-t border-coffee-200 dark:border-coffee-700 overflow-hidden"
          >
            <div className="p-6">
                {loadingReadme ? (
                    <div className="flex items-center justify-center py-8 text-coffee-400 gap-2">
                         <div className="w-4 h-4 border-2 border-coffee-400 border-t-transparent rounded-full animate-spin"></div>
                         <span className="text-sm">Grinding beans...</span>
                    </div>
                ) : (
                    <div className="prose prose-sm prose-stone dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-coffee-800 dark:prose-headings:text-coffee-100 prose-a:text-coffee-600 dark:prose-a:text-coffee-300 prose-a:underline prose-code:text-coffee-800 dark:prose-code:text-coffee-200 prose-code:bg-coffee-50 dark:prose-code:bg-coffee-900 prose-code:px-1 prose-code:rounded prose-pre:bg-coffee-900 dark:prose-pre:bg-black prose-pre:text-coffee-50 prose-img:rounded-lg prose-img:shadow-md">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{readme || ''}</ReactMarkdown>
                    </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RepoCard;