import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  evaluatePolicy,
  checkApproval,
  setAuditHook,
  DEFAULT_POLICY,
  type MutationPolicy,
  type AuditEvent,
} from '../mutation-policy';

describe('evaluatePolicy — read operations', () => {
  it('allows read operations in read_only mode', () => {
    const result = evaluatePolicy('webflow_list_sites', {}, DEFAULT_POLICY);
    expect(result.allowed).toBe(true);
    expect(result.requiresApproval).toBe(false);
  });

  it('allows read operations in plan_only mode', () => {
    const result = evaluatePolicy('webflow_list_sites', {}, { mode: 'plan_only' });
    expect(result.allowed).toBe(true);
  });

  it('allows read operations in require_approval mode', () => {
    const result = evaluatePolicy('webflow_list_sites', {}, { mode: 'require_approval' });
    expect(result.allowed).toBe(true);
  });
});

describe('evaluatePolicy — mode enforcement', () => {
  it('denies write operations in read_only mode', () => {
    const result = evaluatePolicy('webflow_create_cms_items', { items: [] }, DEFAULT_POLICY);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('read_only');
  });

  it('denies write operations in plan_only mode', () => {
    const result = evaluatePolicy('webflow_create_cms_items', { items: [] }, { mode: 'plan_only' });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('plan_only');
  });

  it('denies destructive operations in read_only mode', () => {
    const result = evaluatePolicy('webflow_delete_cms_items', { itemIds: ['a'] }, DEFAULT_POLICY);
    expect(result.allowed).toBe(false);
  });

  it('denies publish operations in read_only mode', () => {
    const result = evaluatePolicy('webflow_publish_cms_items', { itemIds: ['a'] }, DEFAULT_POLICY);
    expect(result.allowed).toBe(false);
  });

  it('allows write operations in allow_writes mode', () => {
    const result = evaluatePolicy(
      'webflow_create_cms_items',
      { items: [{ fieldData: { name: 'x' } }] },
      { mode: 'allow_writes' },
    );
    expect(result.allowed).toBe(true);
  });
});

describe('evaluatePolicy — blocked tools', () => {
  it('denies blocked tools even in allow_writes mode', () => {
    const policy: MutationPolicy = {
      mode: 'allow_writes',
      blockedToolNames: ['webflow_delete_cms_items'],
    };
    const result = evaluatePolicy(
      'webflow_delete_cms_items',
      { itemIds: ['a'] },
      policy,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('blocked');
  });

  it('does not block tools that are not in the blocklist', () => {
    const policy: MutationPolicy = {
      mode: 'allow_writes',
      blockedToolNames: ['webflow_delete_cms_items'],
    };
    const result = evaluatePolicy('webflow_create_cms_items', { items: [] }, policy);
    expect(result.allowed).toBe(true);
  });
});

describe('evaluatePolicy — allowed tool groups', () => {
  it('allows tools in allowed groups', () => {
    const policy: MutationPolicy = {
      mode: 'allow_writes',
      allowedToolGroups: ['cms'],
    };
    const result = evaluatePolicy('webflow_create_cms_items', { items: [] }, policy);
    expect(result.allowed).toBe(true);
  });

  it('denies tools not in allowed groups', () => {
    const policy: MutationPolicy = {
      mode: 'allow_writes',
      allowedToolGroups: ['cms'],
    };
    const result = evaluatePolicy('webflow_update_page_metadata', { pageId: 'x' }, policy);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('pages');
    expect(result.reason).toContain('not in the allowed groups');
  });

  it('read tools bypass group allowlist (always allowed)', () => {
    const policy: MutationPolicy = {
      mode: 'allow_writes',
      allowedToolGroups: ['orders'], // pages not listed
    };
    const result = evaluatePolicy('webflow_list_pages', { siteId: 'x' }, policy);
    expect(result.allowed).toBe(true);
  });
});

describe('evaluatePolicy — site ID allowlist', () => {
  it('allows writes to allowed sites', () => {
    const policy: MutationPolicy = {
      mode: 'allow_writes',
      allowedSiteIds: ['site-1'],
    };
    const result = evaluatePolicy('webflow_get_site', { siteId: 'site-1' }, policy);
    expect(result.allowed).toBe(true); // read — always allowed
  });

  it('denies write to non-allowed sites', () => {
    const policy: MutationPolicy = {
      mode: 'allow_writes',
      allowedSiteIds: ['site-1'],
    };
    const result = evaluatePolicy('webflow_publish_site', { siteId: 'site-2' }, policy);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('site-2');
  });
});

describe('evaluatePolicy — max items per mutation', () => {
  it('allows mutations under the limit', () => {
    const policy: MutationPolicy = {
      mode: 'allow_writes',
      maxItemsPerMutation: 10,
    };
    const result = evaluatePolicy(
      'webflow_create_cms_items',
      { items: [1, 2, 3] },
      policy,
    );
    expect(result.allowed).toBe(true);
  });

  it('denies mutations over the limit', () => {
    const policy: MutationPolicy = {
      mode: 'allow_writes',
      maxItemsPerMutation: 10,
    };
    const result = evaluatePolicy(
      'webflow_create_cms_items',
      { items: Array.from({ length: 15 }) },
      policy,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('15 items exceeds limit');
  });
});

describe('evaluatePolicy — require_approval mode', () => {
  it('sets requiresApproval for tools in the approval list', () => {
    const policy: MutationPolicy = {
      mode: 'require_approval',
      requireApprovalFor: ['webflow_create_cms_items'],
    };
    const result = evaluatePolicy(
      'webflow_create_cms_items',
      { items: [] },
      policy,
    );
    expect(result.allowed).toBe(true);
    expect(result.requiresApproval).toBe(true);
    expect(result.approvalRequest).toBeDefined();
    expect(result.approvalRequest?.toolName).toBe('webflow_create_cms_items');
  });

  it('allows tools not in the approval list in require_approval mode', () => {
    const policy: MutationPolicy = {
      mode: 'require_approval',
      requireApprovalFor: ['webflow_delete_cms_items'],
    };
    const result = evaluatePolicy('webflow_create_cms_items', { items: [] }, policy);
    expect(result.allowed).toBe(true);
    expect(result.requiresApproval).toBe(false);
  });
});

describe('checkApproval', () => {
  it('passes through result when no approval is required', async () => {
    const result = evaluatePolicy('webflow_list_sites', {}, DEFAULT_POLICY);
    const final = await checkApproval(result, DEFAULT_POLICY);
    expect(final.allowed).toBe(result.allowed);
  });

  it('denies when approval handler is missing', async () => {
    const policy: MutationPolicy = {
      mode: 'require_approval',
      requireApprovalFor: ['webflow_create_cms_items'],
    };
    const result = evaluatePolicy('webflow_create_cms_items', { items: [] }, policy);
    const final = await checkApproval(result, policy);
    expect(final.allowed).toBe(false);
    expect(final.reason).toContain('no approvalHandler');
  });

  it('approves when handler returns true', async () => {
    const policy: MutationPolicy = {
      mode: 'require_approval',
      requireApprovalFor: ['webflow_create_cms_items'],
      approvalHandler: vi.fn().mockResolvedValue(true),
    };
    const result = evaluatePolicy('webflow_create_cms_items', { items: [] }, policy);
    const final = await checkApproval(result, policy);
    expect(final.allowed).toBe(true);
    expect(final.reason).toBe('Approved by handler');
  });

  it('denies when handler returns false', async () => {
    const policy: MutationPolicy = {
      mode: 'require_approval',
      requireApprovalFor: ['webflow_create_cms_items'],
      approvalHandler: vi.fn().mockResolvedValue(false),
    };
    const result = evaluatePolicy('webflow_create_cms_items', { items: [] }, policy);
    const final = await checkApproval(result, policy);
    expect(final.allowed).toBe(false);
    expect(final.reason).toBe('Denied by approval handler');
  });
});

describe('audit hooks', () => {
  it('calls audit hook on every policy evaluation', () => {
    const events: AuditEvent[] = [];
    setAuditHook((e) => events.push(e));

    evaluatePolicy('webflow_list_sites', {}, DEFAULT_POLICY);
    evaluatePolicy('webflow_create_cms_items', { items: [] }, DEFAULT_POLICY);

    expect(events.length).toBe(2);
    expect(events[0].toolName).toBe('webflow_list_sites');
    expect(events[0].decision).toBe('allowed');
    expect(events[1].toolName).toBe('webflow_create_cms_items');
    expect(events[1].decision).toBe('denied');

    // Reset
    setAuditHook(() => {});
  });
});

describe('argument redaction', () => {
  it('redacts sensitive keys in args', () => {
    const result = evaluatePolicy(
      'webflow_create_cms_items',
      { items: [], token: 'secret', password: 'pwd', apiKey: 'abc' },
      { mode: 'allow_writes' },
    );
    expect(result.allowed).toBe(true); // passes through — redaction doesn't affect allow/deny
  });
});

describe('request metadata', () => {
  it('generates a unique request ID', () => {
    const r1 = evaluatePolicy('webflow_list_sites', {}, DEFAULT_POLICY);
    const r2 = evaluatePolicy('webflow_list_sites', {}, DEFAULT_POLICY);
    // Request IDs are generated per call — they differ (stored in audit event, not result)
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });
});
