import type { VariableMetadata, ParsedVariable, ParsingStats } from '../types/picorules';

/**
 * Parse #define_attribute() directive for a specific variable
 * Returns dict with label, type, is_reportable, is_bi_obj
 */
export function parseDefineAttribute(
  content: string,
  varName: string
): VariableMetadata {
  const pattern = new RegExp(
    `#define_attribute\\(${varName}\\s*,\\s*\\{([^}]+)\\}\\s*\\)`,
    's'
  );
  const match = content.match(pattern);

  if (!match) return {};

  const attrContent = match[1];
  const result: VariableMetadata = {};

  // Extract label
  const labelMatch = attrContent.match(/label\s*:\s*["']([^"']+)["']/);
  if (labelMatch) result.label = labelMatch[1];

  // Extract type
  const typeMatch = attrContent.match(/type\s*:\s*(\d+)/);
  if (typeMatch) result.type = typeMatch[1];

  // Extract is_reportable
  const reportableMatch = attrContent.match(/is_reportable\s*:\s*(\d+)/);
  if (reportableMatch) result.is_reportable = reportableMatch[1];

  // Extract is_bi_obj
  const biObjMatch = attrContent.match(/is_bi_obj\s*:\s*(\d+)/);
  if (biObjMatch) result.is_bi_obj = biObjMatch[1];

  return result;
}

/**
 * Parse #doc() directive for a specific variable
 * Returns description text
 */
export function parseDoc(content: string, varName: string): string {
  const pattern = new RegExp(
    `#doc\\(${varName}\\s*,\\s*\\{([^}]+)\\}\\s*\\)`,
    's'
  );
  const match = content.match(pattern);

  if (!match) return '';

  const docContent = match[1];
  const txtMatch = docContent.match(/txt\s*:\s*["']([^"']+)["']/);

  return txtMatch ? txtMatch[1] : '';
}

/**
 * Parse EADV attribute references from functional statements
 *
 * Patterns:
 * - Single attribute: eadv.lab_ua_acr.val.last()
 * - Multiple attributes: eadv.[icd_n17%,icd_n18%].dt.max()
 * - Wildcard: eadv.[icd_e08%].dt.min()
 */
export function parseEadvAttributes(statement: string): string {
  if (!statement.includes('eadv.')) return '';

  // Multiple attributes: eadv.[attr1,attr2,...]
  const multiPattern = /eadv\.\[([^\]]+)\]/;
  const multiMatch = statement.match(multiPattern);

  if (multiMatch) {
    const attrsStr = multiMatch[1];
    const attrs = attrsStr.split(',').map(attr => attr.trim());
    return attrs.join(',');
  }

  // Single attribute: eadv.attribute_name.
  const singlePattern = /eadv\.([a-zA-Z_][a-zA-Z0-9_%]*)\./;
  const singleMatch = statement.match(singlePattern);

  return singleMatch ? singleMatch[1] : '';
}

/**
 * Parse variable dependencies from statements
 * Returns comma-separated list of variables that this variable depends on
 *
 * Dependency types:
 * 1. Ruleblock bindings: rout_ckd.ckd.val.bind() -> "rout_ckd.ckd"
 * 2. Variable references in conditional statements: { egfr < 60 => ... } -> "egfr"
 * 3. Variable references in functional statements (calculations)
 */
export function parseVariableDependencies(
  statement: string,
  varName: string
): string {
  const dependencies: string[] = [];

  // Pattern 1: Ruleblock bindings - rout_<ruleblock>.<variable>.val.bind()
  const ruleblockPattern = /rout_([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\./g;
  let match;
  while ((match = ruleblockPattern.exec(statement)) !== null) {
    dependencies.push(`rout_${match[1]}.${match[2]}`);
  }

  // Keywords to exclude
  const keywords = new Set([
    'and', 'or', 'not', 'where', 'sysdate', 'coalesce', 'greatest', 'least',
    'least_date', 'round', 'ceil', 'floor', 'abs', 'nvl', 'decode',
    'case', 'when', 'then', 'else', 'end', 'concat', 'substr', 'instr',
    'eadv', 'val', 'dt', 'att', 'eid'
  ]);

  // Clean statement
  let cleanedStatement = statement.replace(
    /rout_[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*\./g,
    ''
  );
  cleanedStatement = cleanedStatement.replace(/eadv\.[^\s]+/g, '');
  cleanedStatement = cleanedStatement.replace(/\.[a-zA-Z_]+\([^)]*\)/g, '');

  // Find variable-like tokens
  const varPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
  while ((match = varPattern.exec(cleanedStatement)) !== null) {
    const token = match[1];
    if (
      !keywords.has(token.toLowerCase()) &&
      token !== varName &&
      token.length > 1 &&
      !/^\d+$/.test(token)
    ) {
      dependencies.push(token);
    }
  }

  // Remove duplicates while preserving order
  const uniqueDeps = [...new Set(dependencies)];
  return uniqueDeps.join(',');
}

/**
 * Remove comments from Picorules content
 */
function removeComments(content: string): string {
  // Remove // style comments
  let cleaned = content.replace(/\/\/.*?$/gm, '');
  // Remove /* */ style comments
  cleaned = cleaned.replace(/\/\*.*?\*\//gs, '');
  return cleaned;
}

/**
 * Extract all variables from a .prb file content
 */
export function extractVariablesFromContent(
  content: string,
  ruleblockName: string
): ParsedVariable[] {
  const variables: ParsedVariable[] = [];

  // Remove comments
  const cleanContent = removeComments(content);

  // Split by semicolon
  const statements = cleanContent.split(';');

  for (const statement of statements) {
    const trimmedStatement = statement.trim();
    if (!trimmedStatement || trimmedStatement.startsWith('#')) continue;

    // Check for functional statement (=>)
    const functionalMatch = trimmedStatement.match(
      /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=>/
    );

    if (functionalMatch) {
      const varName = functionalMatch[1];
      const attributes = parseDefineAttribute(content, varName);
      const description = parseDoc(content, varName);
      const eadvAttrs = parseEadvAttributes(trimmedStatement);
      const dependencies = parseVariableDependencies(trimmedStatement, varName);

      variables.push({
        ruleblock: ruleblockName,
        variable: varName,
        statement_type: 'functional',
        statement: trimmedStatement,
        label: attributes.label || '',
        description: description,
        type: attributes.type || '',
        is_reportable: attributes.is_reportable || '',
        is_bi_obj: attributes.is_bi_obj || '',
        eadv_attributes: eadvAttrs,
        depends_on: dependencies,
        referenced_in_templates: ''
      });
      continue;
    }

    // Check for conditional statement (:)
    const conditionalMatch = trimmedStatement.match(
      /^([a-zA-Z_][a-zA-Z0-9_]*)\s*:/
    );

    if (conditionalMatch) {
      const varName = conditionalMatch[1];
      const attributes = parseDefineAttribute(content, varName);
      const description = parseDoc(content, varName);
      const dependencies = parseVariableDependencies(trimmedStatement, varName);

      variables.push({
        ruleblock: ruleblockName,
        variable: varName,
        statement_type: 'conditional',
        statement: trimmedStatement,
        label: attributes.label || '',
        description: description,
        type: attributes.type || '',
        is_reportable: attributes.is_reportable || '',
        is_bi_obj: attributes.is_bi_obj || '',
        eadv_attributes: '',  // Conditional statements don't query EADV
        depends_on: dependencies,
        referenced_in_templates: ''
      });
    }
  }

  return variables;
}

/**
 * Calculate statistics from parsed variables
 */
export function calculateStats(
  variables: ParsedVariable[]
): ParsingStats {
  return {
    totalVariables: variables.length,
    functionalCount: variables.filter(v => v.statement_type === 'functional').length,
    conditionalCount: variables.filter(v => v.statement_type === 'conditional').length,
    withMetadataCount: variables.filter(v => v.label !== '').length,
    withoutMetadataCount: variables.filter(v => v.label === '').length,
    totalRuleblocks: new Set(variables.map(v => v.ruleblock)).size,
    withTemplateReferencesCount: variables.filter(v => v.referenced_in_templates !== '').length
  };
}
