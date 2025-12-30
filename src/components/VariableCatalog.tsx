import { useRef, useState } from 'react';
import type { ParsedVariable } from '../types/picorules';
import { Table, TableBody, TableHead, TableHeader, TableRow } from './ui/table';
import { VariableRow } from './VariableRow';

interface VariableCatalogProps {
  variables: ParsedVariable[];
  allVariables: ParsedVariable[];
  isLoading: boolean;
  onNavigateToRuleblock: (ruleblock: string) => void;
}

export function VariableCatalog({ variables, allVariables, isLoading, onNavigateToRuleblock }: VariableCatalogProps) {
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

  // Generate unique ID for each variable
  const getVariableId = (v: ParsedVariable) => `${v.ruleblock}.${v.variable}`;

  // Navigate to a variable by scrolling and highlighting
  const navigateToVariable = (dependency: string) => {
    // Parse dependency: could be "rout_ruleblock.variable" or just "variable"
    let targetRuleblock: string;
    let targetVariable: string;
    let targetId: string;

    if (dependency.startsWith('rout_')) {
      // Cross-ruleblock reference: rout_ckd.ckd -> ckd.ckd
      const parts = dependency.replace('rout_', '').split('.');
      if (parts.length === 2) {
        targetRuleblock = parts[0];
        targetVariable = parts[1];
        targetId = `${targetRuleblock}.${targetVariable}`;
      } else {
        return; // Invalid format
      }
    } else {
      // Same ruleblock reference - search through all variables
      const foundVar = allVariables.find(v => v.variable === dependency);
      if (!foundVar) return;
      targetRuleblock = foundVar.ruleblock;
      targetVariable = foundVar.variable;
      targetId = getVariableId(foundVar);
    }

    // Check if target variable is in the currently displayed (filtered) list
    const isInCurrentView = variables.some(v => getVariableId(v) === targetId);

    if (!isInCurrentView) {
      // Need to change filter to show the target ruleblock
      onNavigateToRuleblock(targetRuleblock);

      // Wait for filter to apply and DOM to update, then scroll
      setTimeout(() => {
        const targetRow = rowRefs.current.get(targetId);
        if (targetRow) {
          targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedRow(targetId);
          setTimeout(() => setHighlightedRow(null), 2000);
        }
      }, 100);
    } else {
      // Target is already visible, just scroll to it
      const targetRow = rowRefs.current.get(targetId);
      if (targetRow) {
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedRow(targetId);
        setTimeout(() => setHighlightedRow(null), 2000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading variables...</div>
      </div>
    );
  }

  if (variables.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">No variables found</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg h-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ruleblock</TableHead>
            <TableHead>Variable</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>EADV Attributes</TableHead>
            <TableHead>Dependencies</TableHead>
            <TableHead>Reportable</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variables.map((v, index) => {
            const variableId = getVariableId(v);
            const isHighlighted = highlightedRow === variableId;

            return (
              <VariableRow
                key={`${v.ruleblock}-${v.variable}-${index}`}
                variable={v}
                isHighlighted={isHighlighted}
                onNavigateToDependency={navigateToVariable}
                rowRef={(el) => {
                  if (el) rowRefs.current.set(variableId, el);
                }}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
