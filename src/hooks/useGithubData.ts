import { useState, useEffect } from 'react';
import type { GitHubFileItem, GitHubRepoConfig } from '../types/github';
import type { ParsedVariable, ParsingStats } from '../types/picorules';
import { fetchFileList, fetchFileContentsBatch } from '../services/githubApi';
import { extractVariablesFromContent, calculateStats } from '../services/parser';
import { loadFromCache, saveToCache } from '../services/cacheService';

interface UseGithubDataReturn {
  files: GitHubFileItem[];
  variables: ParsedVariable[];
  stats: ParsingStats;
  isLoading: boolean;
  progress: { current: number; total: number };
  error: string | null;
  refetch: () => Promise<void>;
  lastFetchTime: number | null;
  isFromCache: boolean;
}

export function useGithubData(
  config?: GitHubRepoConfig
): UseGithubDataReturn {
  const [files, setFiles] = useState<GitHubFileItem[]>([]);
  const [variables, setVariables] = useState<ParsedVariable[]>([]);
  const [stats, setStats] = useState<ParsingStats>({
    totalVariables: 0,
    functionalCount: 0,
    conditionalCount: 0,
    withMetadataCount: 0,
    withoutMetadataCount: 0,
    totalRuleblocks: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const fetchData = async (forceRefresh = false) => {
    // Try to load from cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = loadFromCache();
      if (cached) {
        setFiles(cached.files);
        setVariables(cached.variables);
        setStats(cached.stats);
        setLastFetchTime(cached.timestamp);
        setIsFromCache(true);
        console.log('✓ Loaded from cache');
        return;
      }
    }

    // Fetch from GitHub
    setIsLoading(true);
    setError(null);
    setProgress({ current: 0, total: 0 });
    setIsFromCache(false);

    try {
      // Fetch file list
      const fileList = await fetchFileList(config);
      setFiles(fileList);
      setProgress({ current: 0, total: fileList.length });

      // Fetch all file contents
      const contents = await fetchFileContentsBatch(
        fileList,
        config,
        5,
        (current, total) => setProgress({ current, total })
      );

      // Parse all files
      const allVariables: ParsedVariable[] = [];
      contents.forEach((content, filename) => {
        const ruleblockName = filename.replace('.prb', '');
        const vars = extractVariablesFromContent(content, ruleblockName);
        allVariables.push(...vars);
      });

      const calculatedStats = calculateStats(allVariables);

      setVariables(allVariables);
      setStats(calculatedStats);

      // Save to cache
      const timestamp = Date.now();
      saveToCache(fileList, allVariables, calculatedStats);
      setLastFetchTime(timestamp);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return {
    files,
    variables,
    stats,
    isLoading,
    progress,
    error,
    refetch: () => fetchData(true), // Force refresh
    lastFetchTime,
    isFromCache
  };
}
