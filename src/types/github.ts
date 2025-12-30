export interface GitHubFileItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
}

export interface GitHubRepoConfig {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}
