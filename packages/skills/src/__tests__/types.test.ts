import { describe, it, expect } from 'vitest';
import { validateManifest, SkillValidationError } from '../registry';

const minimalValidManifest = {
  id: 'test-skill',
  displayName: 'Test Skill',
  version: '0.1.0',
  description: 'A test skill',
  requiredToolGroups: ['pages'],
  requiredScopes: ['pages:read'],
  riskLevel: 'read_only',
  defaultMode: 'dry_run',
  supportsRollback: false,
};

describe('validateManifest', () => {
  it('accepts a valid minimal manifest', () => {
    const result = validateManifest(minimalValidManifest);
    expect(result.id).toBe('test-skill');
    expect(result.riskLevel).toBe('read_only');
    expect(result.defaultMode).toBe('dry_run');
  });

  it('rejects missing required fields', () => {
    expect(() => validateManifest({})).toThrow(SkillValidationError);
  });

  it('rejects empty id', () => {
    expect(() => validateManifest({ ...minimalValidManifest, id: '' })).toThrow(SkillValidationError);
  });

  it('rejects invalid risk level', () => {
    expect(() => validateManifest({ ...minimalValidManifest, riskLevel: 'moderate' })).toThrow(
      SkillValidationError,
    );
  });

  it('rejects invalid default mode', () => {
    expect(() =>
      validateManifest({ ...minimalValidManifest, defaultMode: 'auto' }),
    ).toThrow(SkillValidationError);
  });

  it('rejects invalid tool groups', () => {
    expect(() =>
      validateManifest({ ...minimalValidManifest, requiredToolGroups: ['not-real'] }),
    ).toThrow(SkillValidationError);
  });

  it('rejects missing requiredToolGroups array', () => {
    expect(() =>
      validateManifest({ ...minimalValidManifest, requiredToolGroups: [] }),
    ).toThrow(SkillValidationError);
  });

  it('rejects non-boolean supportsRollback', () => {
    expect(() =>
      validateManifest({ ...minimalValidManifest, supportsRollback: 'yes' }),
    ).toThrow(SkillValidationError);
  });

  it('accepts destructive risk level', () => {
    const result = validateManifest({
      ...minimalValidManifest,
      riskLevel: 'destructive',
      supportsRollback: true,
    });
    expect(result.riskLevel).toBe('destructive');
  });

  it('accepts review_required risk level', () => {
    const result = validateManifest({ ...minimalValidManifest, riskLevel: 'review_required' });
    expect(result.riskLevel).toBe('review_required');
  });
});
