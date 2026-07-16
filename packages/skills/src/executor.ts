import type { Skill, StepResult, ExecutionPlan, AuditRecord, ExecutionMode } from './types.js';

export class SkillExecutionError extends Error {
  public readonly stepName: string;
  public readonly internalCause: unknown;

  constructor(message: string, stepName: string, cause?: unknown) {
    super(message);
    this.name = 'SkillExecutionError';
    this.stepName = stepName;
    this.internalCause = cause;
  }
}

export class ConfirmationRequiredError extends Error {
  public readonly skillId: string;

  constructor(skillId: string) {
    super(
      `Skill "${skillId}" requires confirmation before executing mutations. ` +
        'Call plan() first, then execute() with a confirmationToken.',
    );
    this.name = 'ConfirmationRequiredError';
    this.skillId = skillId;
  }
}

/**
 * Creates a simple audit record for a tool call.
 */
export function createAuditRecord(
  toolName: string,
  args: Record<string, unknown>,
  result: unknown,
  success: boolean,
  changedResourceIds: string[] = [],
): AuditRecord {
  return {
    toolName,
    args,
    result,
    success,
    changedResourceIds,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate a confirmation token from a plan.
 * In production, this would be a cryptographic token. For now,
 * it's a hash of the plan's skill ID and step descriptions.
 */
export function generateConfirmationToken(plan: ExecutionPlan): string {
  const payload = JSON.stringify({
    skillId: plan.skillId,
    steps: plan.steps.map((s) => s.name),
    totalMutations: plan.totalMutations,
  });
  // Simple hash — not cryptographically secure, but adequate for this scope
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `confirm_${Math.abs(hash).toString(36)}`;
}

/**
 * Default executor that enforces dry-run → confirm → execute flow.
 */
export class SkillExecutor<TInput, TOutput> {
  constructor(private readonly skill: Skill<TInput, TOutput>) {}

  /**
   * Validate and plan. Always safe — no mutations.
   */
  async validateAndPlan(rawInput: unknown): Promise<{
    input: TInput;
    plan: ExecutionPlan;
  }> {
    const input = this.skill.validateInput(rawInput);
    const plan = await this.skill.plan(input);
    return { input, plan };
  }

  /**
   * Run dry-run. No mutations. Returns what would happen.
   */
  async tryDryRun(input: TInput): Promise<StepResult[]> {
    this.assertMode('dry_run');
    return this.skill.dryRun(input);
  }

  /**
   * Execute with confirmation. Requires a valid confirmation token.
   */
  async execute(
    input: TInput,
    confirmationToken: string,
    mode: ExecutionMode,
  ): Promise<StepResult[]> {
    if (mode !== 'confirmed') {
      throw new ConfirmationRequiredError(this.skill.manifest.id);
    }

    // Validate the token matches the current plan
    const plan = await this.skill.plan(input);
    const expectedToken = generateConfirmationToken(plan);

    if (confirmationToken !== expectedToken) {
      throw new SkillExecutionError(
        'Invalid confirmation token. Call plan() to get a new plan, then re-confirm.',
        'confirmation',
      );
    }

    return this.skill.execute(input, confirmationToken);
  }

  private assertMode(expected: ExecutionMode): void {
    if (this.skill.manifest.defaultMode !== expected) {
      throw new SkillExecutionError(
        `Skill "${this.skill.manifest.id}" default mode is "${this.skill.manifest.defaultMode}", ` +
          `not "${expected}". This should match for dry-run validation.`,
        'mode-assertion',
      );
    }
  }
}
