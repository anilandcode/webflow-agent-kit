import { describe, it, expect, vi } from 'vitest';
import { createWebflowAgentKit } from '../client';
import {
  createListSitesTool,
  createListPagesTool,
  createListItemsTool,
  createListCollectionsTool,
  createListAssetsTool,
  createListFormsTool,
  createGetCustomCodeTool,
  createListRedirectsTool,
  createGetRobotsTxtTool,
  createListWebhooksTool,
  createListProductsTool,
  createListOrdersTool,
  createGetInventoryTool,
  createListAuditLogsTool,
  createListComponentsTool,
} from '../tools';

describe('all tool groups — integration smoke', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mk(overrides?: Record<string, any>) {
    const defaults = {
      sites: {
        list: vi.fn().mockResolvedValue({ sites: [{ id: 's1' }] }),
        get: vi.fn().mockResolvedValue({ id: 's1' }),
        publish: vi.fn().mockResolvedValue({}),
        getCustomDomain: vi.fn().mockResolvedValue([]),
        robotsTxt: { get: vi.fn().mockResolvedValue({}), put: vi.fn().mockResolvedValue({}) },
        redirects: {
          list: vi.fn().mockResolvedValue({ redirects: [] }),
          create: vi.fn(),
          delete: vi.fn(),
        },
        scripts: {
          getCustomCode: vi.fn().mockResolvedValue({ scripts: [] }),
          upsertCustomCode: vi.fn(),
          deleteCustomCode: vi.fn(),
        },
        wellKnown: { put: vi.fn().mockResolvedValue({}) },
      },
      pages: {
        list: vi.fn().mockResolvedValue({ pages: [{ id: 'p1' }] }),
        getMetadata: vi.fn().mockResolvedValue({}),
        updatePageSettings: vi.fn(),
        updateStaticContent: vi.fn(),
      },
      collections: {
        list: vi.fn().mockResolvedValue({ collections: [{ id: 'c1' }] }),
        get: vi.fn().mockResolvedValue({}),
        fields: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
        items: {
          listItems: vi.fn().mockResolvedValue({ items: [] }),
          listItemsLive: vi.fn().mockResolvedValue({ items: [] }),
          getItem: vi.fn().mockResolvedValue({}),
          createItem: vi.fn().mockResolvedValue({}),
          updateItems: vi.fn(),
          deleteItems: vi.fn(),
          publishItem: vi.fn(),
        },
      },
      assets: {
        list: vi.fn().mockResolvedValue({ assets: [] }),
        create: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
        listFolders: vi.fn(),
      },
      forms: {
        list: vi.fn().mockResolvedValue({ forms: [] }),
        get: vi.fn(),
        listSubmissions: vi.fn(),
        getSubmission: vi.fn(),
        updateSubmission: vi.fn(),
      },
      webhooks: {
        list: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
      },
      products: {
        list: vi.fn().mockResolvedValue({}),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      orders: {
        list: vi.fn().mockResolvedValue({ orders: [] }),
        get: vi.fn(),
        update: vi.fn(),
        updateFulfill: vi.fn(),
        updateUnfulfill: vi.fn(),
      },
      inventory: { list: vi.fn().mockResolvedValue({ quantity: 5 }), update: vi.fn() },
      ecommerce: { getSettings: vi.fn().mockResolvedValue({}) },
      components: {
        list: vi.fn().mockResolvedValue({ components: [] }),
        getContent: vi.fn(),
        updateContent: vi.fn(),
        getProperties: vi.fn(),
        updateProperties: vi.fn(),
      },
      workspaces: { auditLogs: { getWorkspaceAuditLogs: vi.fn().mockResolvedValue({}) } },
    };
    return { ...defaults, ...overrides };
  }

  it('sites list works', async () => {
    const c = mk();
    const r = await createListSitesTool(c).execute({ limit: 50, offset: 0 });
    expect(r).toBeDefined();
  });

  it('pages list works', async () => {
    const c = mk();
    const r = await createListPagesTool(c).execute({ siteId: 's1', limit: 100, offset: 0 });
    expect(r).toBeDefined();
  });

  it('cms list works', async () => {
    const c = mk();
    const r = await createListItemsTool(c).execute({ collectionId: 'c1', limit: 100, offset: 0 });
    expect(r).toBeDefined();
  });

  it('collections list works', async () => {
    const c = mk();
    const r = await createListCollectionsTool(c).execute({ siteId: 's1' });
    expect(r).toBeDefined();
  });

  it('assets list works', async () => {
    const c = mk();
    const r = await createListAssetsTool(c).execute({ siteId: 's1', limit: 50, offset: 0 });
    expect(r).toBeDefined();
  });

  it('forms list works', async () => {
    const c = mk();
    const r = await createListFormsTool(c).execute({ siteId: 's1' });
    expect(r).toBeDefined();
  });

  it('custom code get works', async () => {
    const c = mk();
    const r = await createGetCustomCodeTool(c).execute({ siteId: 's1' });
    expect(r).toBeDefined();
  });

  it('redirects list works', async () => {
    const c = mk();
    const r = await createListRedirectsTool(c).execute({ siteId: 's1' });
    expect(r).toBeDefined();
  });

  it('seo robots.txt get works', async () => {
    const c = mk();
    const r = await createGetRobotsTxtTool(c).execute({ siteId: 's1' });
    expect(r).toBeDefined();
  });

  it('webhooks list works', async () => {
    const c = mk();
    const r = await createListWebhooksTool(c).execute({ siteId: 's1' });
    expect(r).toBeDefined();
  });

  it('products list works', async () => {
    const c = mk();
    const r = await createListProductsTool(c).execute({ siteId: 's1', limit: 50, offset: 0 });
    expect(r).toBeDefined();
  });

  it('orders list works', async () => {
    const c = mk();
    const r = await createListOrdersTool(c).execute({
      siteId: 's1',
      status: 'all',
      limit: 50,
      offset: 0,
    });
    expect(r).toBeDefined();
  });

  it('inventory get works', async () => {
    const c = mk();
    const r = await createGetInventoryTool(c).execute({ skuCollectionId: 'sc1', skuId: 'sku1' });
    expect(r).toBeDefined();
  });

  it('audit logs list works', async () => {
    const c = mk();
    const r = await createListAuditLogsTool(c).execute({
      workspaceId: 'ws1',
      limit: 50,
      offset: 0,
    });
    expect(r).toBeDefined();
  });

  it('components list works', async () => {
    const c = mk();
    const r = await createListComponentsTool(c).execute({ siteId: 's1', limit: 50, offset: 0 });
    expect(r).toBeDefined();
  });
});
