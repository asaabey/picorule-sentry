import type { GitHubFileItem } from '../types/github';
import { Badge } from './ui/badge';

interface FileListPanelProps {
  files: GitHubFileItem[];
  isLoading: boolean;
  progress: { current: number; total: number };
}

export function FileListPanel({ files, isLoading, progress }: FileListPanelProps) {
  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Rule Blocks</h2>
        <Badge variant="secondary">
          {files.length} files
        </Badge>
      </div>

      {isLoading && (
        <div className="mb-4">
          <div className="text-sm text-muted-foreground">
            Loading {progress.current} / {progress.total}
          </div>
          <div className="w-full bg-secondary rounded-full h-2 mt-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        {files.map((file) => (
          <div
            key={file.sha}
            className="text-sm p-2 rounded hover:bg-secondary cursor-pointer truncate"
            title={file.name}
          >
            {file.name.replace('.prb', '')}
          </div>
        ))}
      </div>
    </div>
  );
}
