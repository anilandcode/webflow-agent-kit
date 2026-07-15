import type { WebflowClient } from 'webflow-api';
import { createClient, type WebflowAuthConfig } from './auth.js';
import { RateLimiter, type RateLimiterConfig } from './rate-limiter.js';

export interface WebflowAgentKitConfig {
  auth: WebflowAuthConfig;
  rateLimit?: Partial<RateLimiterConfig>;
}

export class WebflowAgentKit {
  public readonly client: WebflowClient;
  public readonly rateLimiter: RateLimiter;
  public readonly authConfig: WebflowAuthConfig;

  constructor(config: WebflowAgentKitConfig) {
    this.authConfig = config.auth;
    this.client = createClient(config.auth);
    this.rateLimiter = new RateLimiter(config.rateLimit);
  }

  get rateLimitConfig(): RateLimiterConfig | undefined {
    return this.rateLimiter.config;
  }
}

export function createWebflowAgentKit(
  config: WebflowAuthConfig | WebflowAgentKitConfig,
): WebflowAgentKit {
  if ('auth' in config) {
    return new WebflowAgentKit(config);
  }
  return new WebflowAgentKit({ auth: config });
}
