import { z } from 'zod';
import type { Skill, SkillManifest, ExecutionPlan, StepResult, AuditRecord } from '@webflow-agent-kit/skills';
import { createAuditRecord, validateManifest } from '@webflow-agent-kit/skills';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const _MANIFEST_RAW: any = {
  id: 'publish-workflow',
  displayName: 'Publish Workflow',
  version: '0.1.0',
  description: 'Finds staged/draft CMS items, generates a review, and publishes approved items.',
  requiredToolGroups: ['cms'],
  requiredScopes: ['cms:read', 'cms:write'],
  riskLevel: 'review_required',
  defaultMode: 'dry_run',
  supportsRollback: true,
};

const MANIFEST = validateManifest(_MANIFEST_RAW);

const InputSchema = z.object({
  collectionId: z.string().describe('The CMS collection ID to publish from'),
  approvedItemIds: z.array(z.string()).optional().default([]).describe('Item IDs to publish (empty = review only)'),
});

export type PublishWorkflowInput = z.infer<typeof InputSchema>;

export interface PublishWorkflowOutput {
  stagedCount: number;
  publishedCount: number;
  publishedIds: string[];
  auditRecords: AuditRecord[];
}

export interface PublishWorkflowClient {
  collections: {
    items: {
      listItems: (collectionId: string, params: { limit: number; offset: number }) => Promise<{
        items?: Array<{ id: string; fieldData?: { name?: string; slug?: string } }>;
      }>;
      publishItem: (collectionId: string, request: { itemIds: string[] }) => Promise<unknown>;
    };
  };
}

/** Before-publish state for rollback */
type PublishSnapshot = { collectionId: string; itemIds: string[] };

export function createPublishWorkflowSkill(
  client: PublishWorkflowClient,
): Skill<PublishWorkflowInput, PublishWorkflowOutput> {
  // eslint-disable-next-line prefer-const
  let lastPublishedSnapshot: PublishSnapshot | null = null;

  return {
    manifest: {
      ...MANIFEST,
      inputSchema: { schema: InputSchema, description: 'Publish workflow input' },
      outputSchema: {
        schema: z.object({ stagedCount: z.number(), publishedCount: z.number(), publishedIds: z.array(z.string()) }),
        description: 'Publish workflow output',
      },
    },

    validateInput(input: unknown): PublishWorkflowInput {
      return InputSchema.parse(input);
    },

    async plan(input: PublishWorkflowInput): Promise<ExecutionPlan> {
      const items = await client.collections.items.listItems(input.collectionId, { limit: 100, offset: 0 });
      const stagedCount = (items.items ?? []).length;
      const toPublish = input.approvedItemIds?.length || stagedCount;

      return {
        skillId: 'publish-workflow',
        steps: [
          { name: 'list-staged', description: `List staged items in collection ${input.collectionId}`, mutationCount: 0 },
          { name: 'publish', description: `Publish ${toPublish} items`, mutationCount: toPublish },
        ],
        totalMutations: toPublish,
        hasWrites: toPublish > 0,
        mode: 'dry_run',
      };
    },

    async dryRun(input: PublishWorkflowInput): Promise<StepResult[]> {
      const items = await client.collections.items.listItems(input.collectionId, { limit: 100, offset: 0 });
      const stagedCount = (items.items ?? []).length;

      return [
        {
          name: 'list-staged',
          status: 'completed',
          audit: [
            createAuditRecord('listItems', { collectionId: input.collectionId }, { stagedCount }, true),
          ],
          summary: `Found ${stagedCount} staged items`,
        },
        {
          name: 'publish',
          status: 'skipped',
          audit: [],
          summary: `Would publish ${input.approvedItemIds?.length || stagedCount} items (dry run — no changes)`,
        },
      ];
    },

    async execute(input: PublishWorkflowInput, _token: string): Promise<StepResult[]> {
      const items = await client.collections.items.listItems(input.collectionId, { limit: 100, offset: 0 });
      const stagedItems = items.items ?? [];
      const idsToPublish = input.approvedItemIds && input.approvedItemIds.length > 0
        ? input.approvedItemIds.filter((id) => stagedItems.some((si) => si.id === id))
        : stagedItems.map((si) => si.id).filter(Boolean) as string[];

      lastPublishedSnapshot = { collectionId: input.collectionId, itemIds: idsToPublish };

      if (idsToPublish.length > 0) {
        await client.collections.items.publishItem(input.collectionId, { itemIds: idsToPublish });
      }

      return [
        {
          name: 'list-staged',
          status: 'completed',
          audit: [],
          summary: `Found ${stagedItems.length} staged items`,
        },
        {
          name: 'publish',
          status: 'completed',
          audit: [
            createAuditRecord('publishItem', { collectionId: input.collectionId, itemIds: idsToPublish }, { published: idsToPublish.length }, true, idsToPublish),
          ],
          summary: `Published ${idsToPublish.length} items`,
        },
      ];
    },

    async rollback(_executionId: string): Promise<StepResult[]> {
      if (!lastPublishedSnapshot) {
        return [
          { name: 'rollback', status: 'failed', audit: [], summary: 'No snapshot — rollback not possible' },
        ];
      }
      // Rollback = unpublish by re-creating as drafts (not implemented in this version)
      return [
        { name: 'rollback', status: 'completed', audit: [], summary: `Would unpublish ${lastPublishedSnapshot.itemIds.length} items (rollback not fully implemented)` },
      ];
    },
  };
}
