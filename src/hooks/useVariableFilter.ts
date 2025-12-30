import { useMemo, useState } from 'react';
import type { ParsedVariable } from '../types/picorules';

interface FilterOptions {
  searchTerm: string;
  ruleblock: string;
  statementType: 'all' | 'functional' | 'conditional';
  hasMetadata: 'all' | 'yes' | 'no';
  isReportable: 'all' | 'yes' | 'no';
}

export function useVariableFilter(variables: ParsedVariable[]) {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    ruleblock: 'all',
    statementType: 'all',
    hasMetadata: 'all',
    isReportable: 'all'
  });

  const filteredVariables = useMemo(() => {
    return variables.filter(v => {
      // Search term filter
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const matchesSearch =
          v.variable.toLowerCase().includes(term) ||
          v.label.toLowerCase().includes(term) ||
          v.description.toLowerCase().includes(term) ||
          v.ruleblock.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Ruleblock filter
      if (filters.ruleblock !== 'all' && v.ruleblock !== filters.ruleblock) {
        return false;
      }

      // Statement type filter
      if (filters.statementType !== 'all' && v.statement_type !== filters.statementType) {
        return false;
      }

      // Has metadata filter
      if (filters.hasMetadata === 'yes' && !v.label) return false;
      if (filters.hasMetadata === 'no' && v.label) return false;

      // Is reportable filter
      if (filters.isReportable === 'yes' && v.is_reportable !== '1') return false;
      if (filters.isReportable === 'no' && v.is_reportable === '1') return false;

      return true;
    });
  }, [variables, filters]);

  const ruleblockOptions = useMemo(() => {
    const ruleblocks = new Set(variables.map(v => v.ruleblock));
    return Array.from(ruleblocks).sort();
  }, [variables]);

  return {
    filters,
    setFilters,
    filteredVariables,
    ruleblockOptions
  };
}
