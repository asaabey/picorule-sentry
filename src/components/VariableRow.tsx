import { useState } from 'react';
import type { ParsedVariable } from '../types/picorules';
import { TableCell, TableRow } from './ui/table';
import { Badge } from './ui/badge';

interface VariableRowProps {
  variable: ParsedVariable;
  isHighlighted: boolean;
  onNavigateToDependency: (dependency: string) => void;
  rowRef?: (el: HTMLTableRowElement | null) => void;
}

export function VariableRow({ variable: v, isHighlighted, onNavigateToDependency, rowRef }: VariableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Render dependency links
  const renderDependencies = (dependencies: string) => {
    if (!dependencies) return <span className="text-gray-400 text-xs">none</span>;

    const deps = dependencies.split(',').map(d => d.trim());

    return (
      <div className="flex flex-wrap gap-1">
        {deps.map((dep, idx) => (
          <button
            key={idx}
            onClick={() => onNavigateToDependency(dep)}
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-xs font-mono"
            title={`Click to navigate to ${dep}`}
          >
            {dep}
            {idx < deps.length - 1 && ','}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <TableRow
        ref={rowRef}
        className={`${
          isHighlighted
            ? 'bg-yellow-100 dark:bg-yellow-900/30 transition-colors duration-500'
            : v.statement_type === 'functional'
              ? 'bg-blue-50 dark:bg-blue-950/50'
              : 'bg-amber-50 dark:bg-amber-950/50'
        } ${isExpanded ? 'border-b-0' : ''}`}
      >
        <TableCell className="font-medium text-sm">{v.ruleblock}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title={isExpanded ? "Hide statement" : "Show statement"}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
            <span className="font-mono text-sm font-semibold">{v.variable}</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={v.statement_type === 'functional' ? 'default' : 'secondary'}>
            {v.statement_type}
          </Badge>
        </TableCell>
        <TableCell className="text-sm">{v.label || <span className="text-gray-400 text-xs">no label</span>}</TableCell>
        <TableCell className="font-mono text-xs">
          {v.eadv_attributes || <span className="text-gray-400 text-xs">none</span>}
        </TableCell>
        <TableCell className="max-w-xs text-sm">
          {renderDependencies(v.depends_on)}
        </TableCell>
        <TableCell>
          {v.is_reportable === '1' ? (
            <Badge variant="outline" className="text-xs">Yes</Badge>
          ) : (
            <span className="text-gray-400 text-xs">no</span>
          )}
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className={`${
          isHighlighted
            ? 'bg-yellow-100 dark:bg-yellow-900/30 transition-colors duration-500'
            : v.statement_type === 'functional'
              ? 'bg-blue-50 dark:bg-blue-950/50'
              : 'bg-amber-50 dark:bg-amber-950/50'
        } border-t-0`}>
          <TableCell colSpan={7} className="py-3">
            <div className="ml-8">
              <div className={`text-xs font-semibold mb-2 uppercase tracking-wide ${
                v.statement_type === 'functional'
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-amber-700 dark:text-amber-300'
              }`}>
                {v.statement_type === 'functional' ? 'Functional Statement' : 'Conditional Statement'}
              </div>
              <pre className={`text-sm p-4 rounded-lg border overflow-x-auto font-mono shadow-sm ${
                v.statement_type === 'functional'
                  ? 'bg-white dark:bg-blue-950 border-blue-200 dark:border-blue-700'
                  : 'bg-white dark:bg-amber-950 border-amber-200 dark:border-amber-700'
              }`}>
                {v.statement}
              </pre>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
