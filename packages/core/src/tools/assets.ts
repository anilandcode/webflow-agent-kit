import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createListAssetsTool(client: WebflowClient) {
  return {
    name: 'webflow_list_assets',
    description:
      'List all assets (images, documents, files) uploaded to a Webflow site. Use to browse available media before referencing assets in CMS items.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
    }),
    execute: async ({
      siteId,
      limit,
      offset,
    }: {
      siteId: string;
      limit: number;
      offset: number;
    }) => {
      const response = await client.assets.list(siteId, { limit, offset });
      return response;
    },
  };
}

export function createCreateAssetTool(client: WebflowClient) {
  return {
    name: 'webflow_create_asset',
    description:
      'Create asset metadata to prepare for uploading a file to Webflow. Returns an uploadUrl and uploadDetails for an S3 POST. After this call, use the returned uploadUrl to POST the file data to Amazon S3.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      fileName: z.string().describe('The file name including extension (e.g., hero-image.png)'),
      fileHash: z.string().describe('MD5 hash of the file content'),
    }),
    execute: async ({
      siteId,
      fileName,
      fileHash,
    }: {
      siteId: string;
      fileName: string;
      fileHash: string;
    }) => {
      const uploadInfo = await client.assets.create(siteId, { fileName, fileHash });
      return uploadInfo;
    },
  };
}

export function createGetAssetTool(client: WebflowClient) {
  return {
    name: 'webflow_get_asset',
    description: 'Get details about a single asset by its ID.',
    inputSchema: z.object({
      assetId: z.string().describe('The asset ID'),
    }),
    execute: async ({ assetId }: { assetId: string }) => {
      const asset = await client.assets.get(assetId);
      return { asset };
    },
  };
}

export function createDeleteAssetTool(client: WebflowClient) {
  return {
    name: 'webflow_delete_asset',
    description: 'Delete an asset from a Webflow site. This action cannot be undone.',
    inputSchema: z.object({
      assetId: z.string().describe('The asset ID to delete'),
    }),
    execute: async ({ assetId }: { assetId: string }) => {
      await client.assets.delete(assetId);
      return { deleted: true, assetId };
    },
  };
}

export function createListAssetFoldersTool(client: WebflowClient) {
  return {
    name: 'webflow_list_asset_folders',
    description: 'List all asset folders in a Webflow site. Asset folders organize uploaded files.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
    }),
    execute: async ({ siteId }: { siteId: string }) => {
      const folders = await client.assets.listFolders(siteId);
      return folders;
    },
  };
}

export function createAssetTools(client: WebflowClient) {
  return {
    listAssets: createListAssetsTool(client),
    createAsset: createCreateAssetTool(client),
    getAsset: createGetAssetTool(client),
    deleteAsset: createDeleteAssetTool(client),
    listAssetFolders: createListAssetFoldersTool(client),
  };
}
