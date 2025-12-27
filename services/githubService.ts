
import { GitHubRepo, GitHubUser, CoffeeStats } from '../types';

const CONFIG = {
  USERNAME: 'pro-grammer-SD',
  API_BASE: 'https://api.github.com',
  CACHE_KEY: 'gh_portfolio_v4',
  CACHE_TTL: 60 * 60 * 1000,
};

export class RateLimitError extends Error {
  resetTime: number;
  constructor(message: string, resetTime: number) {
    super(message);
    this.name = 'RateLimitError';
    this.resetTime = resetTime;
  }
}

interface PortfolioData {
  user: GitHubUser;
  repos: GitHubRepo[];
  pinnedRepos: GitHubRepo[];
  followers: GitHubUser[];
  tags: Record<string, string>;
  stats: CoffeeStats;
  timestamp: number;
}

const getCache = (): PortfolioData | null => {
  try {
    const raw = localStorage.getItem(CONFIG.CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.timestamp > CONFIG.CACHE_TTL) return null;
    return data;
  } catch { return null; }
};

const setCache = (data: Omit<PortfolioData, 'timestamp'>) => {
  try {
    localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({ ...data, timestamp: Date.now() }));
  } catch (e) { console.warn('Cache quota exceeded', e); }
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      const resetHeader = response.headers.get('x-ratelimit-reset');
      const resetTime = resetHeader ? parseInt(resetHeader, 10) : Math.floor(Date.now() / 1000) + 3600;
      throw new RateLimitError('API Rate Limit Exceeded', resetTime);
    }
    return null;
  }
  return response.json();
};

const fetchTags = async (repoName: string): Promise<string | null> => {
  try {
    const response = await fetch(`${CONFIG.API_BASE}/repos/${CONFIG.USERNAME}/${repoName}/tags?per_page=1`);
    const tags = await handleResponse(response);
    return tags?.[0]?.name || null;
  } catch { return null; }
};

export const fetchRepoParticipation = async (repoName: string): Promise<{ all: number[]; owner: number[] } | null> => {
  try {
    const response = await fetch(`${CONFIG.API_BASE}/repos/${CONFIG.USERNAME}/${repoName}/stats/participation`);
    if (response.status === 202) return null; // GitHub is calculating stats
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

const calculateStats = (user: GitHubUser, repos: GitHubRepo[]): CoffeeStats => {
  const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
  
  const langs: Record<string, number> = {};
  repos.forEach(r => {
    if (r.language) langs[r.language] = (langs[r.language] || 0) + 1;
  });
  
  const topLanguages = Object.entries(langs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, count]) => ({ lang, count }));

  const mostStarredRepo = repos.length > 0 ? [...repos].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))[0].name : 'N/A';
  
  const accountAgeDays = Math.floor((Date.now() - new Date(user.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24));
  
  const brewStrength = totalStars > 500 ? 'Double Espresso' : totalStars > 100 ? 'Ristretto' : 'Mild Roast';

  return { totalStars, totalForks, topLanguages, mostStarredRepo, accountAgeDays, brewStrength };
};

export const getPortfolioData = async (forceRefresh = false): Promise<PortfolioData> => {
  if (!forceRefresh) {
    const cached = getCache();
    if (cached) return cached;
  }

  const [userData, reposData, followersData] = await Promise.all([
    fetch(`${CONFIG.API_BASE}/users/${CONFIG.USERNAME}`).then(handleResponse),
    fetch(`${CONFIG.API_BASE}/users/${CONFIG.USERNAME}/repos?sort=updated&per_page=100`).then(handleResponse),
    fetch(`${CONFIG.API_BASE}/users/${CONFIG.USERNAME}/followers?per_page=100`).then(handleResponse)
  ]);

  if (!userData) throw new Error("Could not fetch GitHub user. Check your connection or username.");

  const user = userData as GitHubUser;
  const repos = (reposData || []) as GitHubRepo[];
  const followers = (followersData || []) as GitHubUser[];

  const pinnedRepos = await fetch(`https://gh-pinned-repos.egoist.dev/?username=${CONFIG.USERNAME}`)
      .then(r => r.ok ? r.json() : [])
      .then(pins => Array.isArray(pins) ? pins.map((p: any, i: number) => ({
        id: 999000 + i, name: p.repo, full_name: `${p.owner}/${p.repo}`,
        html_url: p.link, description: p.description, language: p.language,
        stargazers_count: parseInt(p.stars) || 0, forks_count: parseInt(p.forks) || 0,
        updated_at: new Date().toISOString(), clone_url: `https://github.com/${p.owner}/${p.repo}.git`,
        default_branch: 'main', topics: []
      })) : []);

  const reposToTag = [...pinnedRepos, ...repos.slice(0, 5)];
  const tagEntries = await Promise.all(
    reposToTag.map(async (r) => [r.name, await fetchTags(r.name)])
  );
  const tags = Object.fromEntries(tagEntries.filter(e => e[1]));
  const stats = calculateStats(user, repos);

  const data = { user, repos, pinnedRepos, followers, tags, stats };
  setCache(data);
  return { ...data, timestamp: Date.now() };
};

export const fetchReadme = async (repoName: string, initialBranch: string = 'main'): Promise<{ content: string; branch: string } | null> => {
  const branches = Array.from(new Set([initialBranch, 'master', 'main'])); 
  for (const b of branches) {
    try {
      const response = await fetch(`https://raw.githubusercontent.com/${CONFIG.USERNAME}/${repoName}/${b}/README.md`);
      if (response.ok) return { content: await response.text(), branch: b };
    } catch { continue; }
  }
  return null;
};

export const analyzeRepo = (repo: GitHubRepo): { roast: string; description: string } => {
  const lang = repo.language || 'Unknown';
  let score = ((repo.stargazers_count || 0) * 3) + ((repo.forks_count || 0) * 2);
  const roast = score > 100 ? 'Double Shot Signature' : score > 50 ? 'Espresso Blend' : score > 20 ? 'Dark Roast' : 'Medium Roast';
  return { roast, description: `A robust ${lang} creation.` };
};
