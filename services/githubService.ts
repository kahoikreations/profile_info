
import { GitHubRepo, GitHubUser, CoffeeStats } from '../types';

const CONFIG = {
  USERNAME: 'pro-grammer-SD',
  API_BASE: 'https://api.github.com',
  PINNED_API: 'https://pinned.berrysauce.dev/get',
  CACHE_KEY: 'gh_portfolio_v4',
  ETAG_CACHE_KEY: 'gh_etags_v4',
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

const getETagCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.ETAG_CACHE_KEY) || '{}');
  } catch { return {}; }
};

const saveToETagCache = (url: string, etag: string, data: any) => {
  try {
    const cache = getETagCache();
    cache[url] = { etag, data, timestamp: Date.now() };
    localStorage.setItem(CONFIG.ETAG_CACHE_KEY, JSON.stringify(cache));
  } catch (e) { console.warn('ETag cache full', e); }
};

const handleResponse = async (response: Response, url: string) => {
  if (response.status === 304) {
    const cache = getETagCache();
    return cache[url]?.data || null;
  }

  if (response.status === 301 || response.status === 302 || response.status === 307) {
    const newUrl = response.headers.get('location');
    if (newUrl) return fetchWithETag(newUrl);
  }

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const resetHeader = response.headers.get('x-ratelimit-reset');
      
      let resetTime: number;
      if (retryAfter) {
        resetTime = Math.floor(Date.now() / 1000) + parseInt(retryAfter, 10);
      } else if (resetHeader) {
        resetTime = parseInt(resetHeader, 10);
      } else {
        resetTime = Math.floor(Date.now() / 1000) + 60;
      }
      
      throw new RateLimitError('The Barista is on break (Rate Limit Reached)', resetTime);
    }
    console.warn(`API Error ${response.status} at ${url}`);
    return null;
  }

  const data = await response.json();
  const etag = response.headers.get('etag');
  if (etag) {
    saveToETagCache(url, etag, data);
  }
  return data;
};

const fetchWithETag = async (url: string) => {
  const cache = getETagCache();
  const cachedItem = cache[url];
  
  const headers: Record<string, string> = {};
  if (cachedItem?.etag) {
    headers['if-none-match'] = cachedItem.etag;
  }

  const response = await fetch(url, { headers });
  return handleResponse(response, url);
};

const fetchPinnedRepos = async (): Promise<GitHubRepo[]> => {
  try {
    const response = await fetch(`${CONFIG.PINNED_API}/${CONFIG.USERNAME}`);
    if (!response.ok) return [];
    
    const pinned = await response.json();
    if (!Array.isArray(pinned)) return [];

    return pinned.map((repo: any) => ({
      id: Math.random(),
      name: repo.name,
      full_name: `${repo.author}/${repo.name}`,
      html_url: `https://github.com/${repo.author}/${repo.name}`,
      description: repo.description,
      language: repo.language,
      stargazers_count: repo.stars,
      forks_count: repo.forks,
      open_issues_count: 0, // Pinned API doesn't provide this, but we'll sync with REST repos later
      updated_at: new Date().toISOString(),
      topics: [],
      clone_url: `https://github.com/${repo.author}/${repo.name}.git`,
      default_branch: 'main',
      repoImage: `https://opengraph.githubassets.com/1/${repo.author}/${repo.name}`
    }));
  } catch (e) {
    console.error('Pinned API Fetch Error:', e);
    return [];
  }
};

const fetchTags = async (repoName: string): Promise<string | null> => {
  try {
    const url = `${CONFIG.API_BASE}/repos/${CONFIG.USERNAME}/${repoName}/tags?per_page=1`;
    const tags = await fetchWithETag(url);
    return tags?.[0]?.name || null;
  } catch { return null; }
};

export const fetchRepoParticipation = async (repoName: string): Promise<{ all: number[]; owner: number[] } | null> => {
  try {
    const url = `${CONFIG.API_BASE}/repos/${CONFIG.USERNAME}/${repoName}/stats/participation`;
    const response = await fetch(url);
    if (response.status === 202) return null; 
    return await handleResponse(response, url);
  } catch { return null; }
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

  const [userData, reposData, followersData, pinnedReposData] = await Promise.all([
    fetchWithETag(`${CONFIG.API_BASE}/users/${CONFIG.USERNAME}`),
    fetchWithETag(`${CONFIG.API_BASE}/users/${CONFIG.USERNAME}/repos?sort=updated&per_page=100`),
    fetchWithETag(`${CONFIG.API_BASE}/users/${CONFIG.USERNAME}/followers?per_page=100`),
    fetchPinnedRepos()
  ]);

  if (!userData) throw new Error("Could not fetch GitHub user. Check connection.");

  const user = userData as GitHubUser;
  const rawRepos = (reposData || []) as any[];
  
  // Map regular repos to include repoImage and open_issues_count
  const repos: GitHubRepo[] = rawRepos.map(r => ({
    ...r,
    repoImage: `https://opengraph.githubassets.com/1/${r.full_name}`,
    open_issues_count: r.open_issues_count || 0
  }));

  const followers = (followersData || []) as GitHubUser[];

  // Sync pinned repos with real issue counts from the repos list if possible
  const pinnedRepos: GitHubRepo[] = pinnedReposData.map(p => {
    const fullRepo = repos.find(r => r.name === p.name);
    return fullRepo ? { ...fullRepo, repoImage: p.repoImage } : p;
  });

  const finalPinned = pinnedRepos.length > 0 
    ? pinnedRepos 
    : [...repos].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)).slice(0, 6);

  const reposToTag = [...finalPinned, ...repos.slice(0, 5)];
  const tagEntries = await Promise.all(
    reposToTag.map(async (r) => [r.name, await fetchTags(r.name)])
  );
  const tags = Object.fromEntries(tagEntries.filter(e => e[1]));
  const stats = calculateStats(user, repos);

  const data = { user, repos, pinnedRepos: finalPinned, followers, tags, stats };
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
