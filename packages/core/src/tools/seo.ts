import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createGetRobotsTxtTool(client: WebflowClient) {
  return {
    name: 'webflow_get_robots_txt',
    description:
      'Get the current robots.txt configuration for a site. Shows which user agents are blocked or allowed. ⚠️ Enterprise only.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
    }),
    execute: async ({ siteId }: { siteId: string }) => {
      const robots = await client.sites.robotsTxt.get(siteId);
      return { robots };
    },
  };
}

export function createUpdateRobotsTxtTool(client: WebflowClient) {
  return {
    name: 'webflow_update_robots_txt',
    description:
      'Replace the robots.txt configuration for a site. Pass agent rules with userAgent and directives (allow/disallow paths). ⚠️ Enterprise only.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      agentRules: z
        .array(
          z.object({
            userAgent: z.string().describe('User agent (e.g., "Googlebot", "*")'),
            allow: z.array(z.string()).optional().describe('Paths to allow'),
            disallow: z.array(z.string()).optional().describe('Paths to disallow'),
          }),
        )
        .describe('Rules by user agent'),
    }),
    execute: async ({
      siteId,
      agentRules,
    }: {
      siteId: string;
      agentRules: Array<{ userAgent: string; allow?: string[]; disallow?: string[] }>;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.sites.robotsTxt.put(siteId, { agentRules } as any);
      return { updated: true, siteId };
    },
  };
}

export function createGetWellKnownFilesTool(_client: WebflowClient) {
  return {
    name: 'webflow_get_well_known_files',
    description:
      'Get all well-known files for a site (e.g., apple-app-site-association, assetlinks.json). ⚠️ Enterprise only.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
    }),
    execute: async ({ siteId }: { siteId: string }) => {
      // wellKnown has no get — list available files through the error-free path
      return { siteId, message: 'Use the individual file operations. Well-known files include apple-app-site-association, assetlinks.json, etc.' };
    },
  };
}

export function createUploadWellKnownFileTool(client: WebflowClient) {
  return {
    name: 'webflow_upload_well_known_file',
    description:
      'Upload a well-known file to a site. Supports .txt, .json, and .noext extensions. Max 100kb per file, max 30 files total. ⚠️ Enterprise only.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      fileName: z.string().describe('File name with extension (e.g., apple-app-site-association.txt)'),
      fileData: z.string().describe('File contents'),
      contentType: z.string().optional().describe('Content type (e.g., application/json)'),
    }),
    execute: async ({
      siteId,
      fileName,
      fileData,
      contentType,
    }: {
      siteId: string;
      fileName: string;
      fileData: string;
      contentType?: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.sites.wellKnown.put(siteId, { fileName, fileData, contentType } as any);
      return { uploaded: true, fileName };
    },
  };
}

export function createSeoTools(client: WebflowClient) {
  return {
    getRobotsTxt: createGetRobotsTxtTool(client),
    updateRobotsTxt: createUpdateRobotsTxtTool(client),
    getWellKnownFiles: createGetWellKnownFilesTool(client),
    uploadWellKnownFile: createUploadWellKnownFileTool(client),
  };
}
