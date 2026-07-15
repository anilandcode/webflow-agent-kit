# Authentication Guide

webflow-agent-kit supports three authentication modes:

## 1. Environment Variable (Recommended)

Set `WEBFLOW_TOKEN` in your environment:

```bash
export WEBFLOW_TOKEN=your_token_here
```

```typescript
const kit = createWebflowAgentKit({ type: 'env' });
```

The token is read from `process.env.WEBFLOW_TOKEN`. Throws `WebflowAuthError` if not set.

## 2. Site Token (Single-Site)

For single-site integrations, generate a site token from your Webflow project settings:

1. Go to **Site Settings** → **Apps & Integrations** → **API Access**
2. Click **Generate API Token**
3. Copy the token

```typescript
const kit = createWebflowAgentKit({
  type: 'site-token',
  token: 'your-site-token-here',
});
```

Site tokens are scoped to a single site. All operations are limited to that site.

## 3. OAuth (Multi-Site)

For multi-site apps or public applications, use OAuth:

```typescript
const kit = createWebflowAgentKit({
  type: 'oauth',
  accessToken: 'user-oauth-access-token',
});
```

OAuth tokens provide access to all sites in a user's workspace, subject to the [scopes](https://developers.webflow.com/data/docs/oauth-scopes) you requested during authorization.

### OAuth Flow

1. Register an app at [Webflow Designer](https://webflow.com/dashboard/apps)
2. Request scopes matching the tools you need (e.g., `cms:read`, `cms:write`, `sites:read`)
3. Redirect users to `https://webflow.com/oauth/authorize` with your client_id and scopes
4. Exchange the authorization code for an access token
5. Pass the access token to `createWebflowAgentKit`

## Scopes Required by Tool Group

| Tool Group | Required Scopes |
|---|---|
| Sites | `sites:read`, `sites:publish` |
| Pages | `pages:read`, `pages:write` |
| CMS Items | `cms:read`, `cms:write` |
| Collections | `cms:read`, `cms:write` |
| Assets | `assets:read`, `assets:write` |
| Forms | `forms:read`, `forms:write` |
| Ecommerce | `ecommerce:read`, `ecommerce:write` |
| Custom Code | `custom_code:read`, `custom_code:write` |
| Webhooks | `sites:read`, `sites:write` |
| SEO | `sites:write` |

## Error Handling

```typescript
import { WebflowAuthError } from '@webflow-agent-kit/core';

try {
  const kit = createWebflowAgentKit({ type: 'env' });
} catch (error) {
  if (error instanceof WebflowAuthError) {
    console.error('Auth failed:', error.message);
    // Handle missing token
  }
}
```
