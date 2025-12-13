import { GitHubRepo, GitHubUser } from '../types';

const BASE_URL = 'https://api.github.com';
const USERNAME = 'pro-grammer-SD';

export const fetchProfile = async (): Promise<GitHubUser> => {
  const response = await fetch(`${BASE_URL}/users/${USERNAME}`);
  if (!response.ok) throw new Error('Failed to fetch user profile');
  return response.json();
};

export const fetchRepos = async (): Promise<GitHubRepo[]> => {
  const response = await fetch(`${BASE_URL}/users/${USERNAME}/repos?sort=updated&per_page=100`);
  if (!response.ok) throw new Error('Failed to fetch repositories');
  const repos = await response.json();
  return repos;
};

// Fetch pinned repositories with fallback to Official GitHub API (Top Starred)
export const fetchPinnedRepos = async (): Promise<GitHubRepo[]> => {
    // Strategy 1: Try 3rd party proxy to get actual pinned repos (scraped)
    try {
        const response = await fetch(`https://gh-pinned-repos.egoist.dev/?username=${USERNAME}`);
        if (response.ok) {
            const pinnedData = await response.json();
            
            if (Array.isArray(pinnedData) && pinnedData.length > 0) {
                 // Map the pinned data structure to our GitHubRepo structure partially
                return pinnedData.map((pin: any, index: number) => ({
                    id: 999000 + index, // Fake ID
                    name: pin.repo,
                    full_name: `${pin.owner}/${pin.repo}`,
                    html_url: pin.link,
                    description: pin.description,
                    language: pin.language,
                    stargazers_count: parseInt(pin.stars) || 0,
                    forks_count: parseInt(pin.forks) || 0,
                    updated_at: new Date().toISOString(), // Fallback
                    clone_url: `https://github.com/${pin.owner}/${pin.repo}.git`,
                    default_branch: 'main', // Assumption
                    topics: []
                }));
            }
        }
    } catch (e) {
        console.warn("Proxy failed, falling back to GitHub API sorting", e);
    }

    // Strategy 2: Fallback to Official GitHub API (Top Starred) if proxy fails or returns empty
    try {
        // Fetch top 6 repos sorted by stars
        const response = await fetch(`${BASE_URL}/users/${USERNAME}/repos?sort=stargazers_count&direction=desc&per_page=6`);
        if (!response.ok) throw new Error('Failed to fetch fallback repos');
        const fallbackRepos = await response.json();
        return fallbackRepos;
    } catch (e) {
        console.warn("Fallback fetch failed", e);
        return [];
    }
};

export const fetchFollowers = async (): Promise<GitHubUser[]> => {
    // Fetch first 12 followers
    const response = await fetch(`${BASE_URL}/users/${USERNAME}/followers?per_page=12`);
    if (!response.ok) throw new Error('Failed to fetch followers');
    const simpleUsers = await response.json();

    // The followers endpoint doesn't return bio/name, so we fetch details for these users
    // We limit to 12 to be kind to the rate limit
    const detailedUsers = await Promise.all(
        simpleUsers.map(async (u: any) => {
            try {
                const r = await fetch(u.url);
                if (r.ok) return await r.json();
                return u;
            } catch (e) {
                return u;
            }
        })
    );
    return detailedUsers;
};

export const fetchReadme = async (repoName: string, branch: string = 'main'): Promise<string | null> => {
  const branches = [branch, 'master'];
  
  for (const b of branches) {
    const url = `https://raw.githubusercontent.com/${USERNAME}/${repoName}/${b}/README.md`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.text();
      }
    } catch (e) {
      console.warn(`Could not fetch README for ${repoName} on branch ${b}`);
    }
  }
  return null;
};

export const analyzeRepo = (repo: GitHubRepo): { roast: string; description: string } => {
  const lang = repo.language || 'Unknown';
  const stars = repo.stargazers_count;
  const forks = repo.forks_count;
  
  // Calculate a "Quality Score"
  let score = stars * 3 + forks * 2;
  
  if (repo.description && repo.description.length > 50) score += 5;
  if (repo.topics && repo.topics.length > 0) score += 5;

  let roast = 'Light Roast';
  let descTemplate = 0;

  if (score < 5) {
      roast = 'Light Roast'; // Mild, beginner, or new
      descTemplate = 0;
  } else if (score >= 5 && score < 20) {
      roast = 'Medium Roast'; // Balanced, standard
      descTemplate = 1;
  } else if (score >= 20 && score < 50) {
      roast = 'Dark Roast'; // Bold, popular
      descTemplate = 2;
  } else if (score >= 50 && score < 100) {
      roast = 'Espresso Blend'; // Intense, high activity
      descTemplate = 3;
  } else {
      roast = 'Double Shot Signature'; // The best of the best
      descTemplate = 4;
  }

  const descriptions = [
    [
        `A delicate ${lang} brew with subtle notes.`,
        `Light and airy ${lang} project, perfect for a morning start.`,
        `Freshly ground ${lang} concepts, steeping gently.`
    ],
    [
        `A balanced ${lang} blend with a smooth body.`,
        `Medium-bodied ${lang} architecture with a pleasant finish.`,
        `Classic ${lang} flavor profile, reliable and tasty.`
    ],
    [
        `Bold ${lang} flavors with a rich, full body.`,
        `Deep-roasted ${lang} logic for the refined palate.`,
        `A robust ${lang} creation with lingering complexity.`
    ],
    [
        `Intense ${lang} energy packed into every byte.`,
        `Concentrated ${lang} power, not for the faint of heart.`,
        `A high-caffeine ${lang} solution for heavy workloads.`
    ],
    [
        `The Master's Reserve: Premium ${lang} beans, perfectly extracted.`,
        `Award-winning ${lang} profile with complex undertones.`,
        `The ultimate ${lang} experience. Pure liquid gold.`
    ]
  ];

  // Pick a random description from the appropriate roast level tier
  const tierDescs = descriptions[descTemplate];
  const selectedDesc = tierDescs[repo.id % tierDescs.length]; // Deterministic random
  
  return {
    roast,
    description: selectedDesc
  };
};