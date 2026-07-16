/** Classification of a tool's mutation level */
export type MutationClass = 'read' | 'write' | 'destructive' | 'publish';

/** Tool metadata for the policy layer */
export interface ToolMeta {
  /** The tool's prefix-matched name (e.g., 'webflow_create_cms_items') */
  name: string;
  /** Mutation classification */
  mutationClass: MutationClass;
  /** Tool group this belongs to */
  toolGroup: string;
  /** Extract siteId from tool arguments, or null if not applicable */
  getSiteId: (args: Record<string, unknown>) => string | null;
  /** Extract estimated item count from arguments (for bulk mutations) */
  getItemCount: (args: Record<string, unknown>) => number;
}

/**
 * All 62 tools classified by mutation level.
 *
 * Rules:
 *   read        — no data changes; safe for any policy mode
 *   write       — creates, updates, or modifies data; reversible with effort
 *   destructive — deletes data; cannot be undone without backups
 *   publish     — makes staged content live; visible to end-users immediately
 */

const TOOL_CLASSIFICATIONS: Record<string, Omit<ToolMeta, 'name'>> = {
  // Sites
  webflow_list_sites: {
    mutationClass: 'read',
    toolGroup: 'sites',
    getSiteId: () => null,
    getItemCount: () => 0,
  },
  webflow_get_site: {
    mutationClass: 'read',
    toolGroup: 'sites',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_publish_site: {
    mutationClass: 'publish',
    toolGroup: 'sites',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_get_custom_domains: {
    mutationClass: 'read',
    toolGroup: 'sites',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },

  // Pages
  webflow_list_pages: {
    mutationClass: 'read',
    toolGroup: 'pages',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_get_page_metadata: {
    mutationClass: 'read',
    toolGroup: 'pages',
    getSiteId: () => null,
    getItemCount: () => 0,
  },
  webflow_update_page_metadata: {
    mutationClass: 'write',
    toolGroup: 'pages',
    getSiteId: () => null,
    getItemCount: () => 1,
  },
  webflow_update_static_content: {
    mutationClass: 'write',
    toolGroup: 'pages',
    getSiteId: () => null,
    getItemCount: () => 1,
  },

  // CMS Items
  webflow_list_cms_items: {
    mutationClass: 'read',
    toolGroup: 'cms',
    getSiteId: () => null,
    getItemCount: () => 0,
  },
  webflow_get_cms_item: {
    mutationClass: 'read',
    toolGroup: 'cms',
    getSiteId: () => null,
    getItemCount: () => 0,
  },
  webflow_create_cms_items: {
    mutationClass: 'write',
    toolGroup: 'cms',
    getSiteId: () => null,
    getItemCount: (a) => (Array.isArray(a.items) ? a.items.length : 1),
  },
  webflow_update_cms_items: {
    mutationClass: 'write',
    toolGroup: 'cms',
    getSiteId: () => null,
    getItemCount: (a) => (Array.isArray(a.items) ? a.items.length : 1),
  },
  webflow_delete_cms_items: {
    mutationClass: 'destructive',
    toolGroup: 'cms',
    getSiteId: () => null,
    getItemCount: (a) => (Array.isArray(a.itemIds) ? a.itemIds.length : 1),
  },
  webflow_publish_cms_items: {
    mutationClass: 'publish',
    toolGroup: 'cms',
    getSiteId: () => null,
    getItemCount: (a) => (Array.isArray(a.itemIds) ? a.itemIds.length : 1),
  },
  webflow_list_live_cms_items: {
    mutationClass: 'read',
    toolGroup: 'cms',
    getSiteId: () => null,
    getItemCount: () => 0,
  },

  // Collections
  webflow_list_collections: {
    mutationClass: 'read',
    toolGroup: 'collections',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_get_collection: {
    mutationClass: 'read',
    toolGroup: 'collections',
    getSiteId: () => null,
    getItemCount: () => 0,
  },
  webflow_create_collection_field: {
    mutationClass: 'write',
    toolGroup: 'collections',
    getSiteId: () => null,
    getItemCount: () => 1,
  },
  webflow_update_collection_field: {
    mutationClass: 'write',
    toolGroup: 'collections',
    getSiteId: () => null,
    getItemCount: () => 1,
  },
  webflow_delete_collection_field: {
    mutationClass: 'destructive',
    toolGroup: 'collections',
    getSiteId: () => null,
    getItemCount: () => 1,
  },

  // Assets
  webflow_list_assets: {
    mutationClass: 'read',
    toolGroup: 'assets',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_create_asset: {
    mutationClass: 'write',
    toolGroup: 'assets',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 1,
  },
  webflow_get_asset: {
    mutationClass: 'read',
    toolGroup: 'assets',
    getSiteId: () => null,
    getItemCount: () => 0,
  },
  webflow_delete_asset: {
    mutationClass: 'destructive',
    toolGroup: 'assets',
    getSiteId: () => null,
    getItemCount: () => 1,
  },
  webflow_list_asset_folders: {
    mutationClass: 'read',
    toolGroup: 'assets',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },

  // Forms
  webflow_list_forms: {
    mutationClass: 'read',
    toolGroup: 'forms',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_get_form: {
    mutationClass: 'read',
    toolGroup: 'forms',
    getSiteId: () => null,
    getItemCount: () => 0,
  },
  webflow_list_form_submissions: {
    mutationClass: 'read',
    toolGroup: 'forms',
    getSiteId: () => null,
    getItemCount: () => 0,
  },
  webflow_get_form_submission: {
    mutationClass: 'read',
    toolGroup: 'forms',
    getSiteId: () => null,
    getItemCount: () => 0,
  },
  webflow_update_form_submission: {
    mutationClass: 'write',
    toolGroup: 'forms',
    getSiteId: () => null,
    getItemCount: () => 1,
  },

  // Ecommerce Products
  webflow_list_products: {
    mutationClass: 'read',
    toolGroup: 'products',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_get_product: {
    mutationClass: 'read',
    toolGroup: 'products',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_create_product: {
    mutationClass: 'write',
    toolGroup: 'products',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 1,
  },
  webflow_update_product: {
    mutationClass: 'write',
    toolGroup: 'products',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 1,
  },

  // Ecommerce Orders
  webflow_list_orders: {
    mutationClass: 'read',
    toolGroup: 'orders',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_get_order: {
    mutationClass: 'read',
    toolGroup: 'orders',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_update_order: {
    mutationClass: 'write',
    toolGroup: 'orders',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 1,
  },
  webflow_fulfill_order: {
    mutationClass: 'destructive',
    toolGroup: 'orders',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 1,
  },
  webflow_unfulfill_order: {
    mutationClass: 'destructive',
    toolGroup: 'orders',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 1,
  },

  // Ecommerce Inventory
  webflow_get_inventory: {
    mutationClass: 'read',
    toolGroup: 'inventory',
    getSiteId: () => null,
    getItemCount: () => 0,
  },
  webflow_update_inventory: {
    mutationClass: 'write',
    toolGroup: 'inventory',
    getSiteId: () => null,
    getItemCount: () => 1,
  },
  webflow_get_ecommerce_settings: {
    mutationClass: 'read',
    toolGroup: 'inventory',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },

  // Custom Code
  webflow_get_custom_code: {
    mutationClass: 'read',
    toolGroup: 'custom-code',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_upsert_custom_code: {
    mutationClass: 'destructive',
    toolGroup: 'custom-code',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: (a) => (Array.isArray(a.scripts) ? a.scripts.length : 1),
  },
  webflow_delete_custom_code: {
    mutationClass: 'destructive',
    toolGroup: 'custom-code',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },

  // Redirects
  webflow_list_redirects: {
    mutationClass: 'read',
    toolGroup: 'redirects',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_create_redirect: {
    mutationClass: 'write',
    toolGroup: 'redirects',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 1,
  },
  webflow_delete_redirect: {
    mutationClass: 'destructive',
    toolGroup: 'redirects',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 1,
  },

  // SEO
  webflow_get_robots_txt: {
    mutationClass: 'read',
    toolGroup: 'seo',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_update_robots_txt: {
    mutationClass: 'write',
    toolGroup: 'seo',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_get_well_known_files: {
    mutationClass: 'read',
    toolGroup: 'seo',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_upload_well_known_file: {
    mutationClass: 'write',
    toolGroup: 'seo',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 1,
  },

  // Webhooks
  webflow_list_webhooks: {
    mutationClass: 'read',
    toolGroup: 'webhooks',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_create_webhook: {
    mutationClass: 'write',
    toolGroup: 'webhooks',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 1,
  },
  webflow_get_webhook: {
    mutationClass: 'read',
    toolGroup: 'webhooks',
    getSiteId: () => null,
    getItemCount: () => 0,
  },
  webflow_delete_webhook: {
    mutationClass: 'destructive',
    toolGroup: 'webhooks',
    getSiteId: () => null,
    getItemCount: () => 1,
  },

  // Components
  webflow_list_components: {
    mutationClass: 'read',
    toolGroup: 'components',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_get_component_content: {
    mutationClass: 'read',
    toolGroup: 'components',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_update_component_content: {
    mutationClass: 'write',
    toolGroup: 'components',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: (a) => (Array.isArray(a.nodes) ? a.nodes.length : 1),
  },
  webflow_get_component_properties: {
    mutationClass: 'read',
    toolGroup: 'components',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: () => 0,
  },
  webflow_update_component_properties: {
    mutationClass: 'write',
    toolGroup: 'components',
    getSiteId: (a) => (a.siteId as string) || null,
    getItemCount: (a) => (Array.isArray(a.properties) ? a.properties.length : 1),
  },

  // Audit Logs
  webflow_list_audit_logs: {
    mutationClass: 'read',
    toolGroup: 'audit-logs',
    getSiteId: () => null,
    getItemCount: () => 0,
  },
};

/**
 * Returns the full classification metadata for a tool by name.
 * Throws if the tool is not in the registry.
 */
export function classifyTool(toolName: string): ToolMeta {
  const meta = TOOL_CLASSIFICATIONS[toolName];
  if (!meta) {
    // Default: unknown tools are treated as destructive for safety
    return {
      name: toolName,
      mutationClass: 'destructive',
      toolGroup: 'unknown',
      getSiteId: () => null,
      getItemCount: () => 0,
    };
  }
  return { name: toolName, ...meta };
}

/**
 * Returns true if the mutation class performs writes (write, destructive, or publish).
 */
export function isWriteOperation(mclass: MutationClass): boolean {
  return mclass !== 'read';
}

/**
 * Returns the classification summary for all 62 tools.
 */
export function getToolClassSummary(): Array<{
  name: string;
  mutationClass: MutationClass;
  toolGroup: string;
}> {
  return Object.entries(TOOL_CLASSIFICATIONS).map(([name, meta]) => ({
    name,
    mutationClass: meta.mutationClass,
    toolGroup: meta.toolGroup,
  }));
}
