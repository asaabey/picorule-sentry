import { VariableCatalog } from './components/VariableCatalog';
import { FilterBar } from './components/FilterBar';
import { StatsSummary } from './components/StatsSummary';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { useGithubData } from './hooks/useGithubData';
import { useVariableFilter } from './hooks/useVariableFilter';
import { formatCacheTimestamp } from './services/cacheService';

function App() {
  const { variables, stats, isLoading, loadingStatus, progress, error, refetch, lastFetchTime, isFromCache } = useGithubData();
  const { filters, setFilters, filteredVariables, ruleblockOptions } = useVariableFilter(variables);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
        {/* App Name */}
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Picorule Sentry
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Variable Catalog
          </p>
        </div>

        {/* Navigation Items / Loading Status */}
        <nav className="flex-1 p-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Loading Progress
              </div>
              <div className="space-y-2">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {loadingStatus}
                </div>
                {progress.total > 0 && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {progress.total > 0 && `${progress.current} / ${progress.total} files`}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-500 italic">
              Navigation items coming soon...
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-white dark:bg-gray-800 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Variable catalog extraction for Picorules
              </p>
              {isFromCache && lastFetchTime && (
                <Badge variant="secondary" className="text-xs">
                  Cached: {formatCacheTimestamp(lastFetchTime)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                onClick={() => refetch()}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? 'Refreshing...' : 'Refresh from GitHub'}
              </Button>
            </div>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <StatsSummary stats={stats} isLoading={isLoading} />
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            ruleblockOptions={ruleblockOptions}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-6 py-4">
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <div className="text-sm text-destructive">{error}</div>
            </div>
          </div>
        )}

        {/* Variable Catalog Table */}
        <div className="flex-1 overflow-hidden px-6 py-4">
          <VariableCatalog
            variables={filteredVariables}
            allVariables={variables}
            isLoading={isLoading}
            onNavigateToRuleblock={(ruleblock) => {
              setFilters({ ...filters, ruleblock });
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
