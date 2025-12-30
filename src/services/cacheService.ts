import type { ParsedVariable, ParsingStats } from '../types/picorules';
import type { GitHubFileItem } from '../types/github';

interface CachedData {
  files: GitHubFileItem[];
  variables: ParsedVariable[];
  stats: ParsingStats;
  timestamp: number;
}

const CACHE_KEY = 'picorule-sentry-cache';
const CACHE_VERSION = 'v2'; // Bumped to v2 for template references feature
const CACHE_KEY_WITH_VERSION = `${CACHE_KEY}-${CACHE_VERSION}`;

/**
 * Save data to SessionStorage
 */
export function saveToCache(
  files: GitHubFileItem[],
  variables: ParsedVariable[],
  stats: ParsingStats
): void {
  try {
    const data: CachedData = {
      files,
      variables,
      stats,
      timestamp: Date.now()
    };
    sessionStorage.setItem(CACHE_KEY_WITH_VERSION, JSON.stringify(data));
    console.log('✓ Data cached to SessionStorage');
  } catch (error) {
    console.error('Failed to cache data:', error);
  }
}

/**
 * Load data from SessionStorage
 */
export function loadFromCache(): CachedData | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY_WITH_VERSION);
    if (!cached) return null;

    const data: CachedData = JSON.parse(cached);
    console.log('✓ Loaded data from SessionStorage cache');
    return data;
  } catch (error) {
    console.error('Failed to load cache:', error);
    return null;
  }
}

/**
 * Clear the cache
 */
export function clearCache(): void {
  sessionStorage.removeItem(CACHE_KEY_WITH_VERSION);
  console.log('✓ Cache cleared');
}

/**
 * Get cache age in minutes
 */
export function getCacheAge(): number | null {
  const cached = loadFromCache();
  if (!cached) return null;

  const ageMs = Date.now() - cached.timestamp;
  return Math.floor(ageMs / 60000); // Convert to minutes
}

/**
 * Format timestamp for display
 */
export function formatCacheTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;

  // Show actual time if more than a day old
  return date.toLocaleString();
}
