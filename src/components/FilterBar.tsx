import { Input } from './ui/input';

interface FilterBarProps {
  filters: {
    searchTerm: string;
    ruleblock: string;
    statementType: 'all' | 'functional' | 'conditional';
    hasMetadata: 'all' | 'yes' | 'no';
    isReportable: 'all' | 'yes' | 'no';
  };
  setFilters: (filters: any) => void;
  ruleblockOptions: string[];
}

export function FilterBar({ filters, setFilters, ruleblockOptions }: FilterBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div>
        <Input
          placeholder="Search..."
          value={filters.searchTerm}
          onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
        />
      </div>

      <div>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={filters.ruleblock}
          onChange={(e) => setFilters({ ...filters, ruleblock: e.target.value })}
        >
          <option value="all">All Ruleblocks</option>
          {ruleblockOptions.map((rb) => (
            <option key={rb} value={rb}>{rb}</option>
          ))}
        </select>
      </div>

      <div>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={filters.statementType}
          onChange={(e) => setFilters({ ...filters, statementType: e.target.value })}
        >
          <option value="all">All Types</option>
          <option value="functional">Functional</option>
          <option value="conditional">Conditional</option>
        </select>
      </div>

      <div>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={filters.hasMetadata}
          onChange={(e) => setFilters({ ...filters, hasMetadata: e.target.value })}
        >
          <option value="all">All Metadata</option>
          <option value="yes">With Metadata</option>
          <option value="no">Without Metadata</option>
        </select>
      </div>

      <div>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={filters.isReportable}
          onChange={(e) => setFilters({ ...filters, isReportable: e.target.value })}
        >
          <option value="all">All Reportable</option>
          <option value="yes">Reportable</option>
          <option value="no">Not Reportable</option>
        </select>
      </div>
    </div>
  );
}
