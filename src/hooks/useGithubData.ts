import { useState, useEffect } from 'react';
import type { GitHubFileItem, GitHubRepoConfig } from '../types/github';
import type { ParsedVariable, ParsingStats } from '../types/picorules';
import { fetchFileList, fetchFileContentsBatch, fetchTemplateFileList } from '../services/githubApi';
import { extractVariablesFromContent, calculateStats } from '../services/parser';
import { loadFromCache, saveToCache } from '../services/cacheService';
import { parseTemplateFile, buildTemplateReferenceMap, type TemplateReference } from '../services/templateParser';

interface UseGithubDataReturn {
  files: GitHubFileItem[];
  variables: ParsedVariable[];
  stats: ParsingStats;
  isLoading: boolean;
  progress: { current: number; total: number };
  loadingStatus: string;
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
    totalRuleblocks: 0,
    withTemplateReferencesCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [loadingStatus, setLoadingStatus] = useState<string>('');
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
      // Fetch ruleblock file list
      setLoadingStatus('Fetching ruleblock file list...');
      const fileList = await fetchFileList(config);
      setFiles(fileList);

      // Fetch template file list
      setLoadingStatus('Fetching template file list...');
      const templateFileList = await fetchTemplateFileList(config);
      const totalFiles = fileList.length + templateFileList.length;
      setProgress({ current: 0, total: totalFiles });

      // Fetch all ruleblock contents
      setLoadingStatus(`Downloading ${fileList.length} ruleblocks...`);
      const contents = await fetchFileContentsBatch(
        fileList,
        config,
        5,
        (current) => {
          setProgress({ current, total: totalFiles });
          setLoadingStatus(`Downloading ruleblocks (${current}/${fileList.length})...`);
        }
      );

      // Parse all ruleblock files
      setLoadingStatus('Parsing ruleblocks...');
      const allVariables: ParsedVariable[] = [];
      contents.forEach((content, filename) => {
        const ruleblockName = filename.replace('.prb', '');
        const vars = extractVariablesFromContent(content, ruleblockName);
        allVariables.push(...vars);
      });

      // Fetch all template contents
      setLoadingStatus(`Downloading ${templateFileList.length} templates...`);
      const templateContents = await fetchFileContentsBatch(
        templateFileList,
        config,
        5,
        (current) => {
          const offset = fileList.length;
          setProgress({ current: offset + current, total: totalFiles });
          setLoadingStatus(`Downloading templates (${current}/${templateFileList.length})...`);
        }
      );

      // Parse all template files for variable references
      setLoadingStatus('Parsing templates...');
      const templateReferences: TemplateReference[] = [];
      templateContents.forEach((content, filename) => {
        const templateRef = parseTemplateFile(content, filename);
        templateReferences.push(templateRef);
      });

      // Build reverse map: variable -> templates
      setLoadingStatus('Building template reference map...');
      const templateMap = buildTemplateReferenceMap(templateReferences);

      // Join template references with variables
      setLoadingStatus('Joining template references with variables...');
      allVariables.forEach(variable => {
        const key = `${variable.ruleblock}.${variable.variable}`;
        const templates = templateMap.get(key) || [];
        variable.referenced_in_templates = templates.join(',');
      });

      const calculatedStats = calculateStats(allVariables);

      setVariables(allVariables);
      setStats(calculatedStats);

      // Save to cache
      setLoadingStatus('Saving to cache...');
      const timestamp = Date.now();
      saveToCache(fileList, allVariables, calculatedStats);
      setLastFetchTime(timestamp);
      setLoadingStatus('Complete!');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
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
    loadingStatus,
    error,
    refetch: () => fetchData(true), // Force refresh
    lastFetchTime,
    isFromCache
  };
}
