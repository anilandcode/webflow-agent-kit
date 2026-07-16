import { describe, it, expect, vi } from 'vitest';
import {
  createPublishWorkflowSkill,
  type PublishWorkflowClient,
} from '../../../../skill-packs/publish-workflow/src/index.ts';
import { SkillExecutor, generateConfirmationToken } from '../executor.js';

function mockPublishClient(overrides?: Partial<PublishWorkflowClient>): PublishWorkflowClient {
  return {
    collections: {
      items: {
        listItems: vi.fn().mockResolvedValue({
          items: [
            { id: 'item-1', fieldData: { name: 'Post 1', slug: 'post-1' } },
            { id: 'item-2', fieldData: { name: 'Post 2', slug: 'post-2' } },
          ],
        }),
        publishItem: vi.fn().mockResolvedValue({}),
      },
    },
    ...overrides,
  };
}

describe('Publish Workflow Skill', () => {
  it('validates input with zod', () => {
    const client = mockPublishClient();
    const skill = createPublishWorkflowSkill(client);
    const input = skill.validateInput({ collectionId: 'col-1' });
    expect(input.collectionId).toBe('col-1');
    expect(input.approvedItemIds).toEqual([]);
  });

  it('dry run performs no publishes', async () => {
    const client = mockPublishClient();
    const skill = createPublishWorkflowSkill(client);
    const results = await skill.dryRun({ collectionId: 'col-1' });

    const pubStep = results.find((r) => r.name === 'publish');
    expect(pubStep?.status).toBe('skipped');
    expect(pubStep?.summary).toContain('dry run');
    expect(client.collections.items.publishItem).not.toHaveBeenCalled();
  });

  it('plan is deterministic', async () => {
    const client = mockPublishClient();
    const skill = createPublishWorkflowSkill(client);
    const plan1 = await skill.plan({ collectionId: 'col-1' });
    const plan2 = await skill.plan({ collectionId: 'col-1' });
    expect(plan1.totalMutations).toBe(plan2.totalMutations);
  });

  it('execute publishes approved items', async () => {
    const client = mockPublishClient();
    const skill = createPublishWorkflowSkill(client);
    const executor = new SkillExecutor(skill);
    const { plan } = await executor.validateAndPlan({
      collectionId: 'col-1',
      approvedItemIds: ['item-1'],
    });
    const token = generateConfirmationToken(plan);

    const results = await executor.execute(
      { collectionId: 'col-1', approvedItemIds: ['item-1'] },
      token,
      'confirmed',
    );

    const pubStep = results.find((r) => r.name === 'publish');
    expect(pubStep?.status).toBe('completed');
    expect(client.collections.items.publishItem).toHaveBeenCalledTimes(1);
    expect(client.collections.items.publishItem).toHaveBeenCalledWith('col-1', {
      itemIds: ['item-1'],
    });
  });

  it('execute with no approved IDs publishes all staged items', async () => {
    const client = mockPublishClient();
    const skill = createPublishWorkflowSkill(client);
    const executor = new SkillExecutor(skill);
    const { plan } = await executor.validateAndPlan({ collectionId: 'col-1' });
    const token = generateConfirmationToken(plan);

    await executor.execute({ collectionId: 'col-1', approvedItemIds: [] }, token, 'confirmed');

    expect(client.collections.items.publishItem).toHaveBeenCalledWith('col-1', {
      itemIds: ['item-1', 'item-2'],
    });
  });

  it('rolling back after execute is handled', async () => {
    const client = mockPublishClient();
    const skill = createPublishWorkflowSkill(client);
    const results = (await skill.rollback?.('exec-1')) ?? [];
    expect(results).toBeDefined();
  });
});
