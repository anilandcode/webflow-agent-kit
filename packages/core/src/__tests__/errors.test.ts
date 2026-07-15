import { describe, it, expect } from 'vitest';
import {
  WebflowAgentError,
  RateLimitError,
  NotFoundError,
  isRateLimitError,
  isNotFoundError,
  isWebflowAgentError,
} from '../errors';

describe('errors', () => {
  it('creates WebflowAgentError', () => {
    const err = new WebflowAgentError('test error');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(WebflowAgentError);
    expect(err.message).toBe('test error');
    expect(isWebflowAgentError(err)).toBe(true);
  });

  it('creates RateLimitError', () => {
    const err = new RateLimitError('rate limited', 5000);
    expect(err).toBeInstanceOf(WebflowAgentError);
    expect(err).toBeInstanceOf(RateLimitError);
    expect(err.retryAfterMs).toBe(5000);
    expect(isRateLimitError(err)).toBe(true);
  });

  it('creates NotFoundError', () => {
    const err = new NotFoundError('not found', 'site', '123');
    expect(err).toBeInstanceOf(WebflowAgentError);
    expect(err).toBeInstanceOf(NotFoundError);
    expect(err.resourceType).toBe('site');
    expect(err.resourceId).toBe('123');
    expect(isNotFoundError(err)).toBe(true);
  });

  it('isWebflowAgentError returns false for regular errors', () => {
    expect(isWebflowAgentError(new Error('regular'))).toBe(false);
  });
});
