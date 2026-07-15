# Rate Limiting

Webflow enforces API rate limits:

- **Free / Starter**: 60 requests per minute
- **CMS / Business**: 120 requests per minute

webflow-agent-kit includes a built-in rate limiter that handles this transparently.

## How It Works

The `RateLimiter` class implements a **token bucket** algorithm:

1. Each API call consumes one token
2. Tokens refill at the configured rate (60 or 120 per minute)
3. If no tokens are available, the call waits until the next refill
4. If a `429 Too Many Requests` response is received, the limiter uses **exponential backoff** based on the `Retry-After` header

## Default Configuration

```typescript
const config = {
  maxRequests: 60,        // 60 requests per window
  windowMs: 60_000,       // 1 minute window
  maxRetries: 3,          // Max retries on 429
  baseBackoffMs: 1_000,   // Starting backoff: 1 second
};
```

## Custom Configuration

```typescript
import { createWebflowAgentKit } from '@webflow-agent-kit/core';

// For CMS/Business plans with 120 rpm limit
const kit = createWebflowAgentKit({
  auth: { type: 'env' },
  rateLimit: {
    maxRequests: 120,    // 120 requests per minute
    maxRetries: 5,       // Up to 5 retries
    baseBackoffMs: 500,  // Start with 500ms backoff
  },
});

// Or create a standalone rate limiter
import { RateLimiter } from '@webflow-agent-kit/core';

const limiter = new RateLimiter({
  maxRequests: 120,
  windowMs: 60_000,
});

// Wrap any async function
const result = await limiter.acquire(() => client.sites.list());
```

## Error Handling

When rate limits are exhausted, a `RateLimitError` is thrown:

```typescript
import { isRateLimitError } from '@webflow-agent-kit/core';

try {
  await someTool.execute(params);
} catch (error) {
  if (isRateLimitError(error)) {
    console.log(`Rate limited. Retry after ${error.retryAfterMs}ms`);
  }
}
```

## Agent Best Practices

When using webflow-agent-kit with LLM agents:

1. **Limit `maxSteps`** to prevent infinite loops (10–15 is usually enough)
2. **Use tool group filtering** — import only the tool groups your agent needs
3. **Set realistic expectations** in your prompts — "fetch the last 5 posts" not "fetch all posts"
4. **Monitor rate usage** with logs or observability tools
