# Safety and Mutations — webflow-agent-kit

> **Default policy:** All AI agent APIs default to `read_only`. Write operations must be explicitly enabled.

## Mutation Policy

Every tool call is evaluated against a `MutationPolicy` before execution. The policy is framework-agnostic — it applies to MCP, Vercel AI SDK, LangChain, and CLI adapters identically.

### Policy Modes

| Mode | Behavior |
|---|---|
| `read_only` | All write/create/delete/publish operations are denied. Reads always pass. **This is the default for agent-facing APIs.** |
| `plan_only` | Write operations are denied. The caller should use `plan()` or `dryRun()` methods to preview changes. |
| `require_approval` | Tools in `requireApprovalFor` list require an `approvalHandler` callback before executing. Other tools are allowed. |
| `allow_writes` | All writes pass (subject to group allowlists, site allowlists, blocklists, and item limits). |

### Configuration

```typescript
import { evaluatePolicy } from '@webflow-agent-kit/core';
import type { MutationPolicy } from '@webflow-agent-kit/core';

const policy: MutationPolicy = {
  mode: 'allow_writes',
  allowedToolGroups: ['cms', 'pages'],  // Only allow CMS and page mutations
  allowedSiteIds: ['site-123'],          // Only mutate this site
  blockedToolNames: ['webflow_delete_cms_items'],  // Never allow deletions
  maxItemsPerMutation: 50,               // Cap bulk operations
  requireApprovalFor: ['webflow_publish_site'],    // Require manual approval to publish
  approvalHandler: async (request) => {
    console.log('Approval requested:', request.toolName);
    return true; // Replace with real approval logic
  },
};
```

### Adapter Integration

**MCP Server:** The MCP server evaluates policy before every tool call. Set `WEBFLOW_MUTATION_MODE` env var:

```bash
export WEBFLOW_MUTATION_MODE=read_only  # Default
export WEBFLOW_MUTATION_MODE=allow_writes
```

**Vercel AI SDK:** Call `evaluatePolicy()` before `generateText()`:

```typescript
import { evaluatePolicy } from '@webflow-agent-kit/core';

// Wrap tool execution...
const policyResult = evaluatePolicy(toolName, args, policy);
if (!policyResult.allowed) {
  return { error: policyResult.reason };
}
```

**LangChain / Google ADK:** Same pattern — call `evaluatePolicy()` before executing any tool.

## Tool Classification

Every one of the 62 tools is classified:

| Class | Count | Examples |
|---|---|---|
| **read** | 35 | listSites, getSite, listPages, getItem, listOrders, getInventory, getWebhook |
| **write** | 17 | createItems, updatePageMetadata, updateProduct, createWebhook, uploadWellKnownFile |
| **destructive** | 8 | deleteItems, deleteAsset, deleteWebhook, deleteRedirect, deleteCustomCode, fulfillOrder, unfulfillOrder |
| **publish** | 2 | publishSite, publishItems |

## Least-Privilege Site Tokens

Webflow site tokens can be scoped to specific permissions. Generate tokens with the minimum required scopes:

| Tool Group | Minimum Scope |
|---|---|
| read-only CMS reads | `cms:read` |
| creating/updating CMS | `cms:write` |
| publishing | `sites:publish` |
| custom code | `custom_code:write` |
| ecommerce | `ecommerce:read`, `ecommerce:write` |

A token with only `cms:read` cannot create or delete items — the Webflow API will reject those calls before webflow-agent-kit's policy layer even runs. Combine token scoping with the mutation policy for defense in depth.

## Staged vs Live CMS

Webflow has two CMS states:

- **Staged** — items exist in the CMS but are not visible on the published site. Creating with `isDraft: true` creates staged items.
- **Live** — items are visible to site visitors. Created via `createItemLive` or by calling `publishItem` on staged items.

Mutations on live items are immediately visible to end users. The `publish` classification exists specifically to gate this transition. Never publish without review unless your policy explicitly allows it.

## Irreversible Actions

These actions **cannot be undone** without a site backup:

| Tool | Effect |
|---|---|
| `webflow_delete_cms_items` | Permanently removes items and their field data |
| `webflow_delete_asset` | Permanently removes an uploaded file |
| `webflow_delete_custom_code` | Removes all custom code scripts from a site |
| `webflow_delete_redirect` | Permanently removes a 301 redirect rule |
| `webflow_delete_webhook` | Deletes a webhook configuration |
| `webflow_fulfill_order` | Marks an order as fulfilled (can be unfulfilled, but customer notifications may have been sent) |
| `webflow_delete_collection_field` | Permanently removes a field and its data from every item in the collection |

These tools are classified as `destructive`. Never allow them in `read_only` or `plan_only` mode. Require explicit approval for any automation that calls them.

## Audit Hooks

Every policy decision fires an audit hook. Replace the default no-op hook with your own:

```typescript
import { setAuditHook } from '@webflow-agent-kit/core';

setAuditHook((event) => {
  console.log(`[${event.decision}] ${event.toolName}`, event.reason);
  // Send to your observability platform, database, or log aggregator
});
```

Audit events include:
- `requestId` — unique per call
- `toolName` — the tool being called
- `decision` — `allowed` or `denied`
- `reason` — human-readable explanation
- `request` — the full MutationRequest with redacted args

No specific database or vendor is required — the hook is a plain function.
