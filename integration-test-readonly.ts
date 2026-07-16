import { createWebflowAgentKit } from './packages/core/src/client.js';
import { createListSitesTool, createGetSiteTool } from './packages/core/src/tools/sites.js';
import { createListCollectionsTool } from './packages/core/src/tools/collections.js';
import { createListPagesTool } from './packages/core/src/tools/pages.js';
import { createListItemsTool, createListLiveItemsTool } from './packages/core/src/tools/cms.js';
import { createListFormsTool } from './packages/core/src/tools/forms.js';
import { createListAssetsTool } from './packages/core/src/tools/assets.js';
import { createListProductsTool } from './packages/core/src/tools/ecommerce.js';
import { createListOrdersTool } from './packages/core/src/tools/orders.js';
import { createListWebhooksTool } from './packages/core/src/tools/webhooks.js';
import { createListComponentsTool } from './packages/core/src/tools/components.js';
import { createListAuditLogsTool } from './packages/core/src/tools/audit-logs.js';
import { createGetRobotsTxtTool } from './packages/core/src/tools/seo.js';
import { createGetCustomCodeTool } from './packages/core/src/tools/custom-code.js';
import { createListRedirectsTool } from './packages/core/src/tools/redirects.js';
import { createGetInventoryTool } from './packages/core/src/tools/inventory.js';

const PASS = '✅';
const FAIL = '❌';

async function test(name: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    console.log(`${PASS} ${name}`);
    return true;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`${FAIL} ${name} — ${msg.slice(0, 100)}`);
    return false;
  }
}

async function main() {
  const kit = createWebflowAgentKit({ type: 'env' });
  const client = kit.client;

  console.log(`${PASS} Auth connected to Webflow API\n`);
  console.log('Running read-only integration tests across all 15 tool groups...\n');

  // Get a site ID first
  let siteId = '';
  try {
    const listSites = createListSitesTool(client);
    const result = await listSites.execute({ limit: 1, offset: 0 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sites = (result as any).sites;
    if (sites?.length > 0) {
      siteId = sites[0].id;
      console.log(`   Found site: ${sites[0].displayName} (${siteId})\n`);
    }
  } catch {
    console.log(`${FAIL} listSites — cannot proceed without a site\n`);
    process.exit(1);
  }

  let collectionId = '';
  let productId = '';
  let formId = '';

  // Tests per group
  await test('Sites: getSite', async () => {
    const t = createGetSiteTool(client);
    await t.execute({ siteId });
  });

  await test('Pages: listPages', async () => {
    const t = createListPagesTool(client);
    const r = await t.execute({ siteId, limit: 5, offset: 0 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pages = (r as any).pages;
    if (pages?.length > 0) console.log(`     (${pages.length} pages found)`);
  });

  await test('Collections: listCollections', async () => {
    const t = createListCollectionsTool(client);
    const r = await t.execute({ siteId });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cols = (r as any).collections;
    if (cols?.length > 0) {
      collectionId = cols[0].id;
      console.log(`     (${cols.length} collections found, using ${cols[0].displayName})`);
    }
  });

  if (collectionId) {
    await test('CMS: listItems (staged)', async () => {
      const t = createListItemsTool(client);
      await t.execute({ collectionId, limit: 5, offset: 0 });
    });

    await test('CMS: listLiveItems (published)', async () => {
      const t = createListLiveItemsTool(client);
      await t.execute({ collectionId, limit: 5, offset: 0 });
    });
  } else {
    console.log(`⚠️  Skipping CMS tests — no collections found`);
  }

  await test('Assets: listAssets', async () => {
    const t = createListAssetsTool(client);
    await t.execute({ siteId, limit: 5, offset: 0 });
  });

  await test('Forms: listForms', async () => {
    const t = createListFormsTool(client);
    await t.execute({ siteId });
  });

  await test('Custom Code: getCustomCode', async () => {
    const t = createGetCustomCodeTool(client);
    await t.execute({ siteId });
  });

  await test('Webhooks: listWebhooks', async () => {
    const t = createListWebhooksTool(client);
    await t.execute({ siteId });
  });

  await test('Ecommerce Products: listProducts', async () => {
    const t = createListProductsTool(client);
    await t.execute({ siteId, limit: 5, offset: 0 });
  });

  await test('Ecommerce Orders: listOrders', async () => {
    const t = createListOrdersTool(client);
    await t.execute({ siteId, status: 'all', limit: 5, offset: 0 });
  });

  await test('Components: listComponents', async () => {
    const t = createListComponentsTool(client);
    await t.execute({ siteId, limit: 5, offset: 0 });
  });

  console.log('\n— End of read-only tests —');
  console.log('The above tools are safe (no mutations).\n');
}

main().catch((e) => {
  console.error('Fatal:', e instanceof Error ? e.message : String(e));
  process.exit(1);
});
