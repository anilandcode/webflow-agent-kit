# Authentication

webflow-agent-kit supports three authentication modes.

## 1. Environment Variable (Recommended)

```bash
export WEBFLOW_TOKEN=your_token_here
```

```typescript
const kit = createWebflowAgentKit({ type: 'env' });
```

Throws `WebflowAuthError` if `WEBFLOW_TOKEN` is not set.

## 2. Site Token (Single-Site)

Generate a site token from Webflow:

1. Go to **Site Settings** → **Apps & Integrations** → **API Access**
2. Click **Generate API Token**
3. Select scopes matching your needs (see scope table below)
4. Copy the token immediately — it will not be shown again

```typescript
const kit = createWebflowAgentKit({ type: 'site-token', token: 'xxx' });
```

Site tokens are scoped to a single site. All API calls are limited to that site.

### Rotating a Site Token

1. Generate a new token with the same scopes
2. Deploy the new token to your environment
3. Verify the new token works
4. Delete the old token from Webflow Site Settings → API Access

## 3. OAuth (Multi-Site Apps)

For apps that need access to multiple sites:

```typescript
const kit = createWebflowAgentKit({ type: 'oauth', accessToken: 'xxx' });
```

### OAuth Setup

1. Register an app at the [Webflow Designer](https://webflow.com/dashboard/apps)
2. Configure a redirect URI (e.g., `https://yourapp.com/oauth/callback`)
3. Request scopes matching the tool groups you need:

```
sites:read sites:write pages:read pages:write cms:read cms:write
```

4. Redirect users to:

```
https://webflow.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&scope=SCOPES&redirect_uri=YOUR_REDIRECT
```

5. Exchange the authorization code for an access token (POST to Webflow's token endpoint)
6. Pass the access token to `createWebflowAgentKit`

### Token Storage

- **Never** commit OAuth tokens to source control
- Store tokens in environment-specific secret managers
- Webflow access tokens do not expire, but can be revoked from the Webflow Dashboard → Apps & Integrations
- Implement token rotation on your own schedule

### Token Revocation

Users can revoke OAuth access from their Webflow Dashboard → Apps & Integrations. If your app receives a 401, prompt the user to re-authorize.

## Scopes Required by Tool Group

Generate tokens with the minimum required scopes for defense in depth:

| Tool Group | Minimum Scope |
|---|---|
| Sites (read) | `sites:read` |
| Sites (publish) | `sites:publish` |
| Pages (read) | `pages:read` |
| Pages (write) | `pages:write` |
| CMS (read) | `cms:read` |
| CMS (write) | `cms:write` |
| Assets (read) | `assets:read` |
| Assets (write) | `assets:write` |
| Forms (read) | `forms:read` |
| Forms (write) | `forms:write` |
| Ecommerce (read) | `ecommerce:read` |
| Ecommerce (write) | `ecommerce:write` |
| Custom Code (read) | `custom_code:read` |
| Custom Code (write) | `custom_code:write` |
| Webhooks | `sites:read`, `sites:write` |
| SEO | `sites:write` |

A token with only `cms:read` cannot create, update, or delete CMS items — the Webflow API will reject those calls before webflow-agent-kit's policy layer runs.

## Webflow Plan Limitations

| Plan | API Rate Limit | Notes |
|---|---|---|
| Free / Starter | 60 req/min | Basic Data API access |
| CMS | 120 req/min | Includes CMS collections |
| Business | 120 req/min | Full Data API access |
| Enterprise | 120+ req/min | All endpoints including redirects, robots.txt, well-known files |

Enterprise-only endpoints (redirects, robots.txt, well-known files) return 403 errors on non-Enterprise plans.

## Error Handling

```typescript
import { WebflowAuthError } from '@webflow-agent-kit/core';

try {
  const kit = createWebflowAgentKit({ type: 'env' });
} catch (error) {
  if (error instanceof WebflowAuthError) {
    console.error('Auth failed:', error.message);
  }
}
```

See [Troubleshooting](troubleshooting.md) for authentication error resolution.
