import { GitHubRepo, GitHubUser } from '../types';

// ARCHITECTURE CONFIGURATION
const CONFIG = {
  USERNAME: 'pro-grammer-SD',
  // In production, this should point to a backend proxy (e.g., '/api/github')
  // to enforce server-side caching and request deduplication.
  API_BASE: 'https://api.github.com',
  STATIC_SNAPSHOT_URL: '/github_data.json', // CI/CD generated snapshot
  CACHE_KEY: 'gh_portfolio_v2',
  CACHE_TTL: 60 * 60 * 1000, // 60 Minutes
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
  timestamp: number;
}

// --- Internal Utilities ---

const getCache = (): PortfolioData | null => {
  try {
    const raw = localStorage.getItem(CONFIG.CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.timestamp > CONFIG.CACHE_TTL) {
      localStorage.removeItem(CONFIG.CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const setCache = (data: Omit<PortfolioData, 'timestamp'>) => {
  try {
    const payload = { ...data, timestamp: Date.now() };
    localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Cache quota exceeded', e);
  }
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      const resetHeader = response.headers.get('x-ratelimit-reset');
      const resetTime = resetHeader ? parseInt(resetHeader, 10) : Math.floor(Date.now() / 1000) + 3600;
      throw new RateLimitError('API Rate Limit Exceeded', resetTime);
    }
    throw new Error(`GitHub API Error: ${response.statusText}`);
  }
  return response.json();
};

// --- Individual Fetchers (Internal) ---

const fetchProfile = async (): Promise<GitHubUser> => {
  const response = await fetch(`${CONFIG.API_BASE}/users/${CONFIG.USERNAME}`);
  return handleResponse(response);
};

const fetchRepos = async (): Promise<GitHubRepo[]> => {
  const response = await fetch(`${CONFIG.API_BASE}/users/${CONFIG.USERNAME}/repos?sort=updated&per_page=100`);
  return handleResponse(response);
};

const fetchPinnedRepos = async (): Promise<GitHubRepo[]> => {
  // Strategy: Try 3rd party, then fallback to API
  try {
    const response = await fetch(`https://gh-pinned-repos.egoist.dev/?username=${CONFIG.USERNAME}`);
    if (response.ok) {
      const pinnedData = await response.json();
      if (Array.isArray(pinnedData) && pinnedData.length > 0) {
        return pinnedData.map((pin: any, index: number) => ({
          id: 999000 + index,
          name: pin.repo,
          full_name: `${pin.owner}/${pin.repo}`,
          html_url: pin.link,
          description: pin.description,
          language: pin.language,
          stargazers_count: parseInt(pin.stars) || 0,
          forks_count: parseInt(pin.forks) || 0,
          updated_at: new Date().toISOString(),
          clone_url: `https://github.com/${pin.owner}/${pin.repo}.git`,
          default_branch: 'main',
          topics: []
        }));
      }
    }
  } catch (e) {
    console.warn("Pinned proxy failed", e);
  }
  // Fallback
  const response = await fetch(`${CONFIG.API_BASE}/users/${CONFIG.USERNAME}/repos?sort=stargazers_count&direction=desc&per_page=6`);
  return handleResponse(response);
};

const fetchFollowers = async (): Promise<GitHubUser[]> => {
  // Lite fetch: minimal data to save bandwidth and secondary calls
  const response = await fetch(`${CONFIG.API_BASE}/users/${CONFIG.USERNAME}/followers?per_page=12`);
  const simpleUsers = await handleResponse(response);
  return simpleUsers.map((u: any) => ({
    id: u.id,
    login: u.login,
    avatar_url: u.avatar_url,
    html_url: u.html_url,
    name: u.login,
    bio: "Coffee Club Member",
    public_repos: 0,
    followers: 0,
    following: 0,
    created_at: new Date().toISOString()
  }));
};

// --- Main Service Method ---

export const getPortfolioData = async (forceRefresh = false): Promise<PortfolioData> => {
  // 1. Check Local Cache (Level 1 Defense)
  if (!forceRefresh) {
    const cached = getCache();
    if (cached) return cached;
  }

  // 2. Try Static Snapshot (Level 2 Defense - CI/CD Generated)
  try {
    const snapshot = await fetch(CONFIG.STATIC_SNAPSHOT_URL);
    if (snapshot.ok) {
      const data: PortfolioData = await snapshot.json();
      // Validate snapshot freshness if needed, or just use it
      setCache(data);
      return data;
    }
  } catch (e) {
    // Snapshot missing, proceed to network
  }

  // 3. Network Fetch (Level 3 - The API)
  // Use Promise.all to fetch concurrently but safely
  try {
    const [user, repos, pinnedRepos, followers] = await Promise.all([
      fetchProfile(),
      fetchRepos(),
      fetchPinnedRepos(),
      fetchFollowers()
    ]);

    const data = { user, repos, pinnedRepos, followers };
    setCache(data);
    return { ...data, timestamp: Date.now() };

  } catch (error) {
    // If rate limited, try to return stale cache even if expired
    if (error instanceof RateLimitError) {
       const staleRaw = localStorage.getItem(CONFIG.CACHE_KEY);
       if (staleRaw) {
         console.warn("Rate limit hit, serving stale cache.");
         return JSON.parse(staleRaw);
       }
    }
    throw error;
  }
};

// --- Helper Methods ---

// Uses raw.githubusercontent.com - Does not consume API Rate Limit
export const fetchReadme = async (repoName: string, branch: string = 'main'): Promise<string | null> => {
  const branches = [branch, 'master', 'main'];
  for (const b of branches) {
    const url = `https://raw.githubusercontent.com/${CONFIG.USERNAME}/${repoName}/${b}/README.md`;
    try {
      const response = await fetch(url);
      if (response.ok) return await response.text();
    } catch (e) { continue; }
  }
  return null;
};

export const analyzeRepo = (repo: GitHubRepo): { roast: string; description: string } => {
  // Same logic as before, purely client-side
  const lang = repo.language || 'Unknown';
  const stars = repo.stargazers_count;
  const forks = repo.forks_count;
  let score = stars * 3 + forks * 2;
  if (repo.description && repo.description.length > 50) score += 5;
  if (repo.topics && repo.topics.length > 0) score += 5;

  let roast = 'Light Roast';
  let descTemplate = 0;

  if (score < 5) { roast = 'Light Roast'; descTemplate = 0; }
  else if (score >= 5 && score < 20) { roast = 'Medium Roast'; descTemplate = 1; }
  else if (score >= 20 && score < 50) { roast = 'Dark Roast'; descTemplate = 2; }
  else if (score >= 50 && score < 100) { roast = 'Espresso Blend'; descTemplate = 3; }
  else { roast = 'Double Shot Signature'; descTemplate = 4; }

  const descriptions = [
    [`A delicate ${lang} brew with subtle notes.`, `Light and airy ${lang} project.`, `Freshly ground ${lang} concepts.`],
    [`A balanced ${lang} blend.`, `Medium-bodied ${lang} architecture.`, `Classic ${lang} flavor profile.`],
    [`Bold ${lang} flavors.`, `Deep-roasted ${lang} logic.`, `A robust ${lang} creation.`],
    [`Intense ${lang} energy.`, `Concentrated ${lang} power.`, `High-caffeine ${lang} solution.`],
    [`The Master's Reserve: Premium ${lang}.`, `Award-winning ${lang} profile.`, `The ultimate ${lang} experience.`]
  ];

  const tierDescs = descriptions[descTemplate];
  return { roast, description: tierDescs[repo.id % tierDescs.length] };
};