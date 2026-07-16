import { describe, it, expect, vi } from 'vitest';
import {
  createSeoAuditSkill,
  type SeoAuditClient,
} from '../../../../skill-packs/seo-audit/src/index.ts';
import { SkillExecutor, generateConfirmationToken } from '../executor.js';

function mockSeoClient(overrides?: Partial<SeoAuditClient>): SeoAuditClient {
  return {
    pages: {
      list: vi.fn().mockResolvedValue({
        pages: [
          { id: 'page-1', title: 'Home', slug: 'home' },
          { id: 'page-2', title: 'About', slug: 'about' },
        ],
      }),
      getMetadata: vi.fn().mockResolvedValue({ id: 'page-1', title: 'Home' }),
      updatePageSettings: vi.fn().mockResolvedValue({}),
    },
    sites: {
      getCustomDomain: vi.fn().mockResolvedValue([]),
      robotsTxt: {
        get: vi.fn().mockResolvedValue({}),
      },
    },
    ...overrides,
  };
}

describe('SEO Audit Skill', () => {
  it('validates input with zod', () => {
    const client = mockSeoClient();
    const skill = createSeoAuditSkill(client);
    const input = skill.validateInput({ siteId: 'site-1' });
    expect(input.siteId).toBe('site-1');
    expect(input.autoApply).toBe(false);
  });

  it('rejects invalid input', () => {
    const client = mockSeoClient();
    const skill = createSeoAuditSkill(client);
    expect(() => skill.validateInput({})).toThrow();
  });

  it('dry run performs no writes', async () => {
    const client = mockSeoClient();
    const skill = createSeoAuditSkill(client);
    const results = await skill.dryRun({ siteId: 'site-1' });

    // Update step should be skipped
    const updateStep = results.find((r) => r.name === 'update-metadata');
    expect(updateStep?.status).toBe('skipped');
    expect(updateStep?.summary).toContain('dry run');

    // No writes should have been called
    expect(client.pages.updatePageSettings).not.toHaveBeenCalled();
  });

  it('plan is deterministic', async () => {
    const client = mockSeoClient();
    const skill = createSeoAuditSkill(client);
    const plan1 = await skill.plan({ siteId: 'site-1' });
    const plan2 = await skill.plan({ siteId: 'site-1' });
    expect(plan1.totalMutations).toBe(plan2.totalMutations);
    expect(plan1.steps.length).toBe(plan2.steps.length);
  });

  it('execute updates pages with confirmation', async () => {
    const client = mockSeoClient();
    const skill = createSeoAuditSkill(client);
    const executor = new SkillExecutor(skill);
    const { plan } = await executor.validateAndPlan({ siteId: 'site-1' });
    const token = generateConfirmationToken(plan);

    const results = await executor.execute({ siteId: 'site-1' }, token, 'confirmed');

    const updateStep = results.find((r) => r.name === 'update-metadata');
    expect(updateStep?.status).toBe('completed');
    expect(client.pages.updatePageSettings).toHaveBeenCalledTimes(2);
  });

  it('execute without confirmation fails', async () => {
    const client = mockSeoClient();
    const skill = createSeoAuditSkill(client);
    const executor = new SkillExecutor(skill);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(
      (executor as any).execute({ siteId: 'site-1' }, 'fake', 'dry_run'),
    ).rejects.toThrow();
    expect(client.pages.updatePageSettings).not.toHaveBeenCalled();
  });

  it('dry run lists pages but skips mutations', async () => {
    const client = mockSeoClient();
    const skill = createSeoAuditSkill(client);
    const results = await skill.dryRun({ siteId: 'site-1' });

    expect(client.pages.list).toHaveBeenCalled();
    expect(client.pages.updatePageSettings).not.toHaveBeenCalled();
    expect(results).toHaveLength(4);
  });
});
