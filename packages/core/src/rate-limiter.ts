import { RateLimitError } from './errors.js';

export interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
  maxRetries?: number;
  baseBackoffMs?: number;
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  maxRequests: 60,
  windowMs: 60_000,
  maxRetries: 3,
  baseBackoffMs: 1_000,
};

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  readonly config: RateLimiterConfig;

  constructor(config?: Partial<RateLimiterConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.tokens = this.config.maxRequests;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const newTokens = Math.floor((elapsed / this.config.windowMs) * this.config.maxRequests);
    if (newTokens > 0) {
      this.tokens = Math.min(this.config.maxRequests, this.tokens + newTokens);
      this.lastRefill = now;
    }
  }

  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    let attempt = 0;
    const maxRetries = this.config.maxRetries ?? 3;
    const baseBackoffMs = this.config.baseBackoffMs ?? 1_000;

    while (true) {
      this.refill();

      if (this.tokens > 0) {
        this.tokens--;
        try {
          return await fn();
        } catch (error: unknown) {
          if (this.isHttp429(error)) {
            const retryAfterMs = this.getRetryAfterMs(error);
            attempt++;
            if (attempt > maxRetries) {
              throw new RateLimitError(
                `Rate limit exceeded after ${maxRetries} retries`,
                retryAfterMs,
              );
            }
            const backoff = retryAfterMs || baseBackoffMs * Math.pow(2, attempt - 1);
            await this.sleep(backoff);
            continue;
          }
          throw error;
        }
      }

      const waitMs = Math.ceil(
        (this.config.windowMs / this.config.maxRequests) * (this.config.maxRequests - this.tokens),
      );
      await this.sleep(Math.max(waitMs, 100));
    }
  }

  private isHttp429(error: unknown): boolean {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      return (error as Record<string, unknown>).statusCode === 429;
    }
    return false;
  }

  private getRetryAfterMs(error: unknown): number {
    if (error && typeof error === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const headers = (error as any).response?.headers;
      if (headers && typeof headers === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const retryAfter = (headers as any)['retry-after'] as string | undefined;
        if (retryAfter) {
          return parseInt(retryAfter, 10) * 1000;
        }
      }
    }
    return 0;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
