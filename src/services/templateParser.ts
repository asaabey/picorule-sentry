export interface TemplateReference {
  templateName: string;
  variableReferences: string[]; // Format: "ruleblock.variable"
}

/**
 * Extract all variable references from a Jinja2 template content
 *
 * Patterns matched:
 * 1. Conditional blocks: {% if ruleblock.variable %}
 * 2. picoformat function: {{ picoformat('ruleblock.variable') }}
 * 3. picodate function: {{ picodate('ruleblock.variable') }}
 * 4. Direct references: ruleblock.variable (with word boundaries)
 *
 * @param content - Template file content
 * @returns Array of unique variable references in "ruleblock.variable" format
 */
export function extractVariableReferences(content: string): string[] {
  const references = new Set<string>();

  // Pattern 1: Conditional blocks - {% if ruleblock.variable ... %}
  // Handles: {% if ruleblock.variable %}, {% if ruleblock.variable == value %}
  const conditionalPattern = /{%\s*if\s+([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*)/g;
  let match;
  while ((match = conditionalPattern.exec(content)) !== null) {
    references.add(match[1]);
  }

  // Pattern 2: picoformat function - {{ picoformat('ruleblock.variable') }}
  const picoformatPattern = /picoformat\(['"]([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*)['"]\)/g;
  while ((match = picoformatPattern.exec(content)) !== null) {
    references.add(match[1]);
  }

  // Pattern 3: picodate function - {{ picodate('ruleblock.variable') }}
  const picodatePattern = /picodate\(['"]([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*)['"]\)/g;
  while ((match = picodatePattern.exec(content)) !== null) {
    references.add(match[1]);
  }

  // Pattern 4: Direct references with word boundaries
  // More conservative to avoid false positives
  // Only match inside {{ }} or {% %} blocks
  const directPatternInBlocks = /[{][{%]\s*([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*)\s*[}%][}]/g;
  while ((match = directPatternInBlocks.exec(content)) !== null) {
    references.add(match[1]);
  }

  return Array.from(references);
}

/**
 * Build a reverse mapping from variable references to template names
 *
 * @param templateReferences - Array of template reference objects
 * @returns Map with keys as "ruleblock.variable" and values as arrays of template filenames
 */
export function buildTemplateReferenceMap(
  templateReferences: TemplateReference[]
): Map<string, string[]> {
  const reverseMap = new Map<string, string[]>();

  for (const template of templateReferences) {
    for (const varRef of template.variableReferences) {
      const existing = reverseMap.get(varRef) || [];
      existing.push(template.templateName);
      reverseMap.set(varRef, existing);
    }
  }

  return reverseMap;
}

/**
 * Parse a single template file and extract variable references
 *
 * @param content - Template file content
 * @param templateName - Name of the template file
 * @returns TemplateReference object
 */
export function parseTemplateFile(
  content: string,
  templateName: string
): TemplateReference {
  const variableReferences = extractVariableReferences(content);

  return {
    templateName,
    variableReferences
  };
}
