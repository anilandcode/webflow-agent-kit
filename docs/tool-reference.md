# Tool Reference

Complete reference for all 57 tools across 14 groups in webflow-agent-kit.

## Sites

Tools for managing Webflow sites.

### `webflow_list_sites`

List all Webflow sites in your workspace.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | number | No | 50 | Max sites to return (1–100) |
| `offset` | number | No | 0 | Pagination offset |

### `webflow_get_site`

Get detailed information about a specific site.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `siteId` | string | Yes | The Webflow site ID |

### `webflow_publish_site`

Publish a Webflow site to all or specific domains.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `siteId` | string | Yes | The site ID to publish |
| `domains` | string[] | No | Specific domains to publish to |

### `webflow_get_custom_domains`

Get all custom domains for a site.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `siteId` | string | Yes | The site ID |

## Pages

Tools for managing Webflow pages.

### `webflow_list_pages`

List all pages in a site.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `siteId` | string | Yes | — | The site ID |
| `limit` | number | No | 100 | Max pages (1–100) |
| `offset` | number | No | 0 | Pagination offset |

### `webflow_get_page_metadata`

Get a page's SEO metadata and settings.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `siteId` | string | Yes | The site ID |
| `pageId` | string | Yes | The page ID |

### `webflow_update_page_metadata`

Update a page's SEO title, meta description, and Open Graph settings.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `siteId` | string | Yes | The site ID |
| `pageId` | string | Yes | The page ID |
| `seo.title` | string | No | SEO title tag |
| `seo.metaDescription` | string | No | Meta description |
| `openGraph.title` | string | No | OG title |
| `openGraph.description` | string | No | OG description |

### `webflow_update_static_content`

Update static (non-CMS) content on a page.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `siteId` | string | Yes | The site ID |
| `pageId` | string | Yes | The page ID |
| `content` | Record | Yes | Content key-value pairs |

## CMS Items

Tools for managing CMS content (blog posts, products, etc.).

### `webflow_list_cms_items`

List staged CMS items in a collection.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `collectionId` | string | Yes | — | Collection ID |
| `limit` | number | No | 100 | Max items (1–100) |
| `offset` | number | No | 0 | Pagination offset |

### `webflow_list_live_cms_items`

List live (published) CMS items.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `collectionId` | string | Yes | — | Collection ID |
| `limit` | number | No | 100 | Max items (1–100) |
| `offset` | number | No | 0 | Pagination offset |

### `webflow_get_cms_item`

Get a single CMS item by ID.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `collectionId` | string | Yes | Collection ID |
| `itemId` | string | Yes | Item ID |

### `webflow_create_cms_items`

Create one or more CMS items (max 100).

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `collectionId` | string | Yes | — | Collection ID |
| `items` | array | Yes | — | Array of items |
| `items[].fieldData` | Record | Yes | — | Field key-value pairs |
| `items[].isDraft` | boolean | No | true | Create as draft |
| `publishImmediately` | boolean | No | false | Publish after creation |

### `webflow_update_cms_items`

Update one or more CMS items by ID.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `collectionId` | string | Yes | — | Collection ID |
| `items` | array | Yes | — | Array of items to update |
| `items[].id` | string | Yes | — | Item ID |
| `items[].fieldData` | Record | Yes | — | Updated fields |
| `publishImmediately` | boolean | No | false | Publish after update |

### `webflow_delete_cms_items`

Delete one or more CMS items. **Cannot be undone.**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `collectionId` | string | Yes | Collection ID |
| `itemIds` | string[] | Yes | Item IDs to delete (max 100) |

### `webflow_publish_cms_items`

Publish staged CMS items to make them live.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `collectionId` | string | Yes | Collection ID |
| `itemIds` | string[] | Yes | Item IDs to publish (max 100) |

## Collections

Tools for managing CMS collections.

### `webflow_list_collections`

List all CMS collections in a site.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `siteId` | string | Yes | The site ID |

### `webflow_get_collection`

Get full details of a collection including its schema.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `collectionId` | string | Yes | The collection ID |

## Error Types

All errors extend `WebflowAgentError`:

- `WebflowAuthError` — Authentication configuration error
- `RateLimitError` — API rate limit hit with `retryAfterMs`
- `NotFoundError` — Resource not found with `resourceType` and `resourceId`
- `ValidationError` — Zod schema validation failed
