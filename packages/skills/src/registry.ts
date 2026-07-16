import type { SkillManifest, RiskLevel, ExecutionMode, ToolGroup, SchemaRef } from './types.js';

const VALID_RISK_LEVELS: RiskLevel[] = ['read_only', 'review_required', 'destructive'];
const VALID_MODES: ExecutionMode[] = ['dry_run', 'confirmed'];

const VALID_TOOL_GROUPS: ToolGroup[] = [
  'sites',
  'pages',
  'cms',
  'collections',
  'assets',
  'forms',
  'custom-code',
  'redirects',
  'seo',
  'webhooks',
  'products',
  'orders',
  'inventory',
  'audit-logs',
  'components',
];

export class SkillValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = 'SkillValidationError';
  }
}

export function validateManifest(manifest: unknown): SkillManifest {
  if (!manifest || typeof manifest !== 'object') {
    throw new SkillValidationError('Manifest must be an object', 'root');
  }

  const m = manifest as Record<string, unknown>;

  // Required string fields
  for (const field of ['id', 'displayName', 'version', 'description'] as const) {
    if (typeof m[field] !== 'string' || !m[field]) {
      throw new SkillValidationError(`Manifest must include non-empty "${field}"`, field);
    }
  }

  // requiredToolGroups
  if (!Array.isArray(m.requiredToolGroups) || m.requiredToolGroups.length === 0) {
    throw new SkillValidationError(
      'Manifest must include non-empty array "requiredToolGroups"',
      'requiredToolGroups',
    );
  }
  for (const group of m.requiredToolGroups) {
    if (!VALID_TOOL_GROUPS.includes(group as ToolGroup)) {
      throw new SkillValidationError(
        `Invalid tool group "${String(group)}". Valid: ${VALID_TOOL_GROUPS.join(', ')}`,
        'requiredToolGroups',
      );
    }
  }

  // requiredScopes
  if (!Array.isArray(m.requiredScopes)) {
    throw new SkillValidationError(
      'Manifest must include "requiredScopes" as a string array',
      'requiredScopes',
    );
  }

  // Risk level
  if (!VALID_RISK_LEVELS.includes(m.riskLevel as RiskLevel)) {
    throw new SkillValidationError(
      `riskLevel must be one of: ${VALID_RISK_LEVELS.join(', ')}`,
      'riskLevel',
    );
  }

  // Default mode
  if (!VALID_MODES.includes(m.defaultMode as ExecutionMode)) {
    throw new SkillValidationError(
      `defaultMode must be one of: ${VALID_MODES.join(', ')}`,
      'defaultMode',
    );
  }

  // supportsRollback
  if (typeof m.supportsRollback !== 'boolean') {
    throw new SkillValidationError('supportsRollback must be a boolean', 'supportsRollback');
  }

  // Schema references (optional: caller may pass their own)
  const inputSchema: SchemaRef = (m.inputSchema as SchemaRef) ?? {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: { parse: (v: any) => v } as any,
    description: 'No input schema provided',
  };

  const outputSchema: SchemaRef = (m.outputSchema as SchemaRef) ?? {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: { parse: (v: any) => v } as any,
    description: 'No output schema provided',
  };

  return {
    id: m.id as string,
    displayName: m.displayName as string,
    version: m.version as string,
    description: m.description as string,
    requiredToolGroups: m.requiredToolGroups as ToolGroup[],
    requiredScopes: m.requiredScopes as string[],
    inputSchema,
    outputSchema,
    riskLevel: m.riskLevel as RiskLevel,
    defaultMode: m.defaultMode as ExecutionMode,
    supportsRollback: m.supportsRollback as boolean,
  };
}
