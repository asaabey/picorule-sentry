import type { GitHubFileItem, GitHubRepoConfig } from '../types/github';

/**
 * Get default GitHub configuration from environment variables
 */
function getDefaultConfig(): GitHubRepoConfig {
  return {
    owner: import.meta.env.VITE_GITHUB_OWNER || 'asaabey',
    repo: import.meta.env.VITE_GITHUB_REPO || 'tkc-picorules-rules',
    branch: import.meta.env.VITE_GITHUB_BRANCH || 'master',
    path: import.meta.env.VITE_GITHUB_RULEBLOCK_PATH || 'picodomain_rule_pack/rule_blocks'
  };
}

const DEFAULT_CONFIG: GitHubRepoConfig = getDefaultConfig();

/**
 * Fetch list of files from GitHub repository with optional filter
 */
export async function fetchFileList(
  config: GitHubRepoConfig = DEFAULT_CONFIG,
  fileExtension?: string
): Promise<GitHubFileItem[]> {
  const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${config.branch}`;

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json'
  };

  // Add token if available from environment
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(apiUrl, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const data: GitHubFileItem[] = await response.json();

  // Filter by extension if provided, default to .prb for backward compatibility
  const extension = fileExtension || '.prb';
  return data.filter(item => item.name.endsWith(extension));
}

/**
 * Fetch content of a single file from GitHub
 */
export async function fetchFileContent(
  filePath: string,
  config: GitHubRepoConfig = DEFAULT_CONFIG
): Promise<string> {
  const rawUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${filePath}`;

  const response = await fetch(rawUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${filePath}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

/**
 * Fetch file content with retry logic
 */
export async function fetchFileContentWithRetry(
  filePath: string,
  config: GitHubRepoConfig = DEFAULT_CONFIG,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchFileContent(filePath, config);
    } catch (error) {
      lastError = error as Error;
      // Exponential backoff
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error('Failed to fetch file content');
}

/**
 * Batch fetch file contents with concurrency limit
 */
export async function fetchFileContentsBatch(
  files: GitHubFileItem[],
  config: GitHubRepoConfig = DEFAULT_CONFIG,
  concurrency: number = 5,
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const queue = [...files];
  let completed = 0;

  async function processBatch() {
    while (queue.length > 0) {
      const file = queue.shift();
      if (!file) break;

      try {
        const content = await fetchFileContentWithRetry(file.path, config);
        results.set(file.name, content);
        completed++;
        onProgress?.(completed, files.length);
      } catch (error) {
        console.error(`Failed to fetch ${file.name}:`, error);
      }
    }
  }

  // Create concurrent workers
  const workers = Array.from({ length: concurrency }, () => processBatch());
  await Promise.all(workers);

  return results;
}

/**
 * Fetch list of .txt template files from GitHub repository
 */
export async function fetchTemplateFileList(
  config: GitHubRepoConfig = DEFAULT_CONFIG
): Promise<GitHubFileItem[]> {
  const templatePath = import.meta.env.VITE_GITHUB_TEMPLATE_PATH || 'picodomain_template_pack/template_blocks';

  const templateConfig: GitHubRepoConfig = {
    ...config,
    path: templatePath
  };

  return fetchFileList(templateConfig, '.txt');
}
