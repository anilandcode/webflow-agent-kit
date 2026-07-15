import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolveToken, WebflowAuthError } from '../auth';

describe('resolveToken', () => {
  beforeEach(() => {
    delete process.env.WEBFLOW_TOKEN;
  });

  it('resolves site-token config', () => {
    const token = resolveToken({ type: 'site-token', token: 'abc123' });
    expect(token).toBe('abc123');
  });

  it('resolves oauth config', () => {
    const token = resolveToken({ type: 'oauth', accessToken: 'oauth-abc' });
    expect(token).toBe('oauth-abc');
  });

  it('resolves env config when WEBFLOW_TOKEN is set', () => {
    process.env.WEBFLOW_TOKEN = 'env-token-123';
    const token = resolveToken({ type: 'env' });
    expect(token).toBe('env-token-123');
  });

  it('throws WebflowAuthError when env config has no token', () => {
    expect(() => resolveToken({ type: 'env' })).toThrow(WebflowAuthError);
  });
});
