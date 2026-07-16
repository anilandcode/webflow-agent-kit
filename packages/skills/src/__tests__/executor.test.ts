import { describe, it, expect, vi } from 'vitest';
import { SkillExecutor, generateConfirmationToken, ConfirmationRequiredError } from '../executor';
import type { Skill, SkillManifest, ExecutionPlan, StepResult, AuditRecord } from '../types';

type TestInput = { name: string };
type TestOutput = { result: string };

function createMockSkill(overrides?: Partial<SkillManifest>): Skill<TestInput, TestOutput> {
  const manifest: SkillManifest = {
    id: 'test-skill',
    displayName: 'Test Skill',
    version: '0.1.0',
    description: 'Test skill for executor tests',
    requiredToolGroups: ['pages'],
    requiredScopes: ['pages:read'],
    riskLevel: 'review_required',
    defaultMode: 'dry_run',
    supportsRollback: false,
    inputSchema: { schema: { parse: (v: unknown) => v as TestInput } as TestInput, description: '' },
    outputSchema: { schema: { parse: (v: unknown) => v as TestOutput } as TestOutput, description: '' },
    ...overrides,
  };

  return {
    manifest,
    validateInput: vi.fn((input: unknown) => input as TestInput),
    plan: vi.fn(async (): Promise<ExecutionPlan> => ({
      skillId: 'test-skill',
      steps: [{ name: 'step-1', description: 'Test step', mutationCount: 1 }],
      totalMutations: 1,
      hasWrites: true,
      mode: 'dry_run',
    })),
    dryRun: vi.fn(async (): Promise<StepResult[]> => [
      { name: 'step-1', status: 'skipped', audit: [], summary: 'Would execute (dry run)' },
    ]),
    execute: vi.fn(async (): Promise<StepResult[]> => [
      {
        name: 'step-1',
        status: 'completed',
        audit: [
          { toolName: 'testTool', args: {}, result: 'ok', success: true, changedResourceIds: ['abc'], timestamp: new Date().toISOString() },
        ],
        summary: 'Executed',
      },
    ]),
  };
}

describe('SkillExecutor', () => {
  it('validates input and returns a plan', async () => {
    const skill = createMockSkill();
    const executor = new SkillExecutor(skill);
    const { input, plan } = await executor.validateAndPlan({ name: 'hello' });
    expect(input.name).toBe('hello');
    expect(plan.totalMutations).toBe(1);
  });

  it('performs dry run without writes', async () => {
    const skill = createMockSkill();
    const executor = new SkillExecutor(skill);
    const results = await executor.tryDryRun({ name: 'hello' });
    expect(results[0].status).toBe('skipped');
    expect(skill.execute).not.toHaveBeenCalled();
  });

  it('rejects execute without confirmation mode', async () => {
    const skill = createMockSkill();
    const executor = new SkillExecutor(skill);

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (executor as any).execute({ name: 'hello' }, 'fake-token', 'dry_run'),
    ).rejects.toThrow(ConfirmationRequiredError);
  });

  it('execute with valid token succeeds', async () => {
    const skill = createMockSkill();
    const executor = new SkillExecutor(skill);
    const { plan } = await executor.validateAndPlan({ name: 'hello' });
    const token = generateConfirmationToken(plan);

    const results = await executor.execute({ name: 'hello' }, token, 'confirmed');
    expect(results[0].status).toBe('completed');
    expect(skill.execute).toHaveBeenCalled();
  });

  it('execute with invalid token fails', async () => {
    const skill = createMockSkill();
    const executor = new SkillExecutor(skill);

    await expect(
      executor.execute({ name: 'hello' }, 'fake-token', 'confirmed'),
    ).rejects.toThrow('Invalid confirmation token');
  });

  it('generateConfirmationToken is stable', () => {
    const plan: ExecutionPlan = {
      skillId: 'test',
      steps: [{ name: 's1', description: 'desc', mutationCount: 1 }],
      totalMutations: 1,
      hasWrites: true,
      mode: 'dry_run',
    };
    const t1 = generateConfirmationToken(plan);
    const t2 = generateConfirmationToken(plan);
    expect(t1).toBe(t2);
  });
});
