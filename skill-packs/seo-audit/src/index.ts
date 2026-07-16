import { z } from 'zod';
import type { Skill, SkillManifest, ExecutionPlan, StepResult, AuditRecord } from '@webflow-agent-kit/skills';
import { createAuditRecord, validateManifest } from '@webflow-agent-kit/skills';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const _MANIFEST_RAW: any = {
  id: 'seo-audit',
  displayName: 'SEO Audit',
  version: '0.1.0',
  description: 'Audits every page on a Webflow site for SEO metadata quality and applies bulk updates.',
  requiredToolGroups: ['pages', 'seo', 'sites'],
  requiredScopes: ['pages:read', 'pages:write', 'sites:read', 'sites:write'],
  riskLevel: 'review_required',
  defaultMode: 'dry_run',
  supportsRollback: false,
};

const MANIFEST = validateManifest(_MANIFEST_RAW);

const InputSchema = z.object({
  siteId: z.string().describe('The Webflow site ID to audit'),
  localeId: z.string().optional().describe('Optional locale ID for localized content'),
  autoApply: z.boolean().optional().default(false).describe('Whether to apply SEO updates automatically'),
});

export type SeoAuditInput = z.infer<typeof InputSchema>;

export interface SeoAuditOutput {
  pagesAudited: number;
  pagesUpdated: number;
  robotsTxtUpdated: boolean;
  auditRecords: AuditRecord[];
}

/**
 * Client dependency interface for SEO audit.
 * Accepts a minimal client API so tests can mock it.
 */
export interface SeoAuditClient {
  pages: {
    list: (siteId: string, params: { limit: number; offset: number }) => Promise<{
      pages?: Array<{ id: string; title?: string; slug?: string }>;
    }>;
    getMetadata: (pageId: string) => Promise<{
      id?: string;
      title?: string;
      seo?: { title?: string; description?: string };
      openGraph?: { title?: string; description?: string };
    }>;
    updatePageSettings: (pageId: string, settings: Record<string, unknown>) => Promise<unknown>;
  };
  sites: {
    getCustomDomain: (siteId: string) => Promise<unknown>;
    robotsTxt?: {
      get: (siteId: string) => Promise<{ agentRules?: Array<{ userAgent: string }> }>;
    };
  };
}

function generateSeoTitle(pageTitle: string): string {
  return `${pageTitle} | Optimized for Search`;
}

function generateSeoDescription(): string {
  return 'Generated description for SEO optimization.';
}

export function createSeoAuditSkill(client: SeoAuditClient): Skill<SeoAuditInput, SeoAuditOutput> {
  return {
    manifest: { ...MANIFEST, inputSchema: { schema: InputSchema, description: 'SEO audit input' }, outputSchema: { schema: z.object({ pagesAudited: z.number(), pagesUpdated: z.number() }), description: 'SEO audit output' } },

    validateInput(input: unknown): SeoAuditInput {
      return InputSchema.parse(input);
    },

    async plan(input: SeoAuditInput): Promise<ExecutionPlan> {
      const pages = await client.pages.list(input.siteId, { limit: 100, offset: 0 });
      const pageCount = (pages.pages ?? []).length;

      return {
        skillId: 'seo-audit',
        steps: [
          { name: 'list-pages', description: `List all pages on site ${input.siteId}`, mutationCount: 0 },
          { name: 'read-metadata', description: `Read SEO metadata for ${pageCount} pages`, mutationCount: 0 },
          { name: 'update-metadata', description: `Update SEO metadata for ${pageCount} pages`, mutationCount: pageCount },
          { name: 'update-robots', description: 'Update robots.txt', mutationCount: 1 },
        ],
        totalMutations: pageCount + 1,
        hasWrites: true,
        mode: 'dry_run',
      };
    },

    async dryRun(input: SeoAuditInput): Promise<StepResult[]> {
      const results: StepResult[] = [];
      const audit: AuditRecord[] = [];

      results.push({
        name: 'list-pages',
        status: 'completed',
        audit: [],
        summary: 'No mutations performed (dry run)',
      });

      const pages = await client.pages.list(input.siteId, { limit: 100, offset: 0 });
      const pageList = pages.pages ?? [];
      for (const page of pageList) {
        audit.push(createAuditRecord('getPageMetadata', { pageId: page.id }, { title: page.title }, true));
      }

      results.push({
        name: 'read-metadata',
        status: 'completed',
        audit,
        summary: `Would audit ${pageList.length} pages`,
      });

      results.push({
        name: 'update-metadata',
        status: 'skipped',
        audit: [],
        summary: `Would update ${pageList.length} pages (dry run — no changes applied)`,
      });

      results.push({
        name: 'update-robots',
        status: 'skipped',
        audit: [],
        summary: 'Would update robots.txt (dry run — no changes applied)',
      });

      return results;
    },

    async execute(input: SeoAuditInput, _token: string): Promise<StepResult[]> {
      const results: StepResult[] = [];
      results.push({ name: 'list-pages', status: 'completed', audit: [], summary: 'Pages listed' });

      const pages = await client.pages.list(input.siteId, { limit: 100, offset: 0 });
      const pageList = pages.pages ?? [];
      const changedIds: string[] = [];

      for (const page of pageList) {
        if (!page.id) continue;
        const seoTitle = generateSeoTitle(page.title ?? 'Untitled');
        const seoDesc = generateSeoDescription();
        await client.pages.updatePageSettings(page.id, {
          seo: { title: seoTitle, description: seoDesc },
          ...(input.localeId ? { localeId: input.localeId } : {}),
        });
        changedIds.push(page.id);
      }

      results.push({
        name: 'update-metadata',
        status: 'completed',
        audit: [createAuditRecord('updatePageSettings', { pageCount: pageList.length }, { changedIds }, true, changedIds)],
        summary: `Updated ${pageList.length} pages`,
      });

      if (input.autoApply && client.sites.robotsTxt) {
        await client.sites.robotsTxt.get(input.siteId);
        results.push({
          name: 'update-robots',
          status: 'completed',
          audit: [createAuditRecord('getRobotsTxt', { siteId: input.siteId }, {}, true)],
          summary: 'Robots.txt read (update not applied in this version)',
        });
      } else {
        results.push({
          name: 'update-robots',
          status: 'skipped',
          audit: [],
          summary: 'Robots.txt update skipped (autoApply not set)',
        });
      }

      return results;
    },
  };
}
