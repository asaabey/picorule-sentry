export interface VariableMetadata {
  label?: string;
  type?: string;
  is_reportable?: string;
  is_bi_obj?: string;
}

export interface ParsedVariable {
  ruleblock: string;
  variable: string;
  statement_type: 'functional' | 'conditional';
  statement: string;
  label: string;
  description: string;
  type: string;
  is_reportable: string;
  is_bi_obj: string;
  eadv_attributes: string;
  depends_on: string;
}

export interface RuleblockFile {
  name: string;
  path: string;
  content?: string;
  variables?: ParsedVariable[];
  isLoading: boolean;
  error?: string;
}

export interface ParsingStats {
  totalVariables: number;
  functionalCount: number;
  conditionalCount: number;
  withMetadataCount: number;
  withoutMetadataCount: number;
  totalRuleblocks: number;
}
