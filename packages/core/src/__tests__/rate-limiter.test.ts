import { describe, it, expect } from 'vitest';
import { RateLimiter } from '../rate-limiter';

describe('RateLimiter', () => {
  it('creates a rate limiter with default config', () => {
    const limiter = new RateLimiter();
    expect(limiter.config.maxRequests).toBe(60);
    expect(limiter.config.windowMs).toBe(60_000);
    expect(limiter.config.maxRetries).toBe(3);
  });

  it('creates a rate limiter with custom config', () => {
    const limiter = new RateLimiter({ maxRequests: 120, maxRetries: 5 });
    expect(limiter.config.maxRequests).toBe(120);
    expect(limiter.config.maxRetries).toBe(5);
  });

  it('executes a function through the rate limiter', async () => {
    const limiter = new RateLimiter();
    const result = await limiter.acquire(async () => 'success');
    expect(result).toBe('success');
  });
});
