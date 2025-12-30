import type { ParsingStats } from '../types/picorules';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface StatsSummaryProps {
  stats: ParsingStats;
  isLoading: boolean;
}

export function StatsSummary({ stats, isLoading }: StatsSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Loading...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsItems = [
    { label: 'Total Variables', value: stats.totalVariables },
    { label: 'Functional', value: stats.functionalCount },
    { label: 'Conditional', value: stats.conditionalCount },
    { label: 'With Metadata', value: stats.withMetadataCount },
    { label: 'Without Metadata', value: stats.withoutMetadataCount },
    { label: 'Ruleblocks', value: stats.totalRuleblocks },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statsItems.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
