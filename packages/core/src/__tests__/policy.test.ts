import { describe, it, expect, vi } from 'vitest';
import { evaluatePolicy, checkApproval, setAuditHook, DEFAULT_POLICY } from '../policy.js';
import { classifyTool, isWriteOperation } from '../tool-metadata.js';
import { setAuditHook as auditSetAuditHook } from '../audit.js';
import type { MutationPolicy } from '../mutation-policy.js';
import type { AuditEvent } from '../mutation-policy.js';

describe('policy.ts — re-exports', () => {
  it('DEFAULT_POLICY mode is read_only', () => {
    expect(DEFAULT_POLICY.mode).toBe('read_only');
  });

  it('evaluatePolicy allows reads in read_only', () => {
    const r = evaluatePolicy('webflow_list_sites', {}, DEFAULT_POLICY);
    expect(r.allowed).toBe(true);
  });

  it('evaluatePolicy denies writes in read_only', () => {
    const r = evaluatePolicy('webflow_create_cms_items', { items: [] }, DEFAULT_POLICY);
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('read_only');
  });

  it('evaluatePolicy allows writes in allow_writes mode', () => {
    const r = evaluatePolicy('webflow_create_cms_items', { items: [] }, { mode: 'allow_writes' });
    expect(r.allowed).toBe(true);
  });

  it('evaluatePolicy denies blocked tools', () => {
    const policy: MutationPolicy = {
      mode: 'allow_writes',
      blockedToolNames: ['webflow_delete_cms_items'],
    };
    const r = evaluatePolicy('webflow_delete_cms_items', { itemIds: ['x'] }, policy);
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('blocked');
  });

  it('evaluatePolicy denies unapproved groups', () => {
    const policy: MutationPolicy = {
      mode: 'allow_writes',
      allowedToolGroups: ['cms'],
    };
    const r = evaluatePolicy('webflow_update_page_metadata', { pageId: 'x' }, policy);
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('pages');
  });

  it('evaluatePolicy denies unapproved sites', () => {
    const policy: MutationPolicy = {
      mode: 'allow_writes',
      allowedSiteIds: ['site-1'],
    };
    const r = evaluatePolicy('webflow_publish_site', { siteId: 'site-2' }, policy);
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('site-2');
  });

  it('evaluatePolicy denies over bulk limit', () => {
    const policy: MutationPolicy = {
      mode: 'allow_writes',
      maxItemsPerMutation: 5,
    };
    const r = evaluatePolicy('webflow_create_cms_items', { items: [1, 2, 3, 4, 5, 6, 7] }, policy);
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('exceeds limit');
  });

  it('evaluatePolicy requires approval for listed tools', () => {
    const policy: MutationPolicy = {
      mode: 'require_approval',
      requireApprovalFor: ['webflow_create_cms_items'],
    };
    const r = evaluatePolicy('webflow_create_cms_items', { items: [] }, policy);
    expect(r.requiresApproval).toBe(true);
    expect(r.approvalRequest).toBeDefined();
  });

  it('checkApproval approves when handler returns true', async () => {
    const policy: MutationPolicy = {
      mode: 'require_approval',
      requireApprovalFor: ['webflow_create_cms_items'],
      approvalHandler: vi.fn().mockResolvedValue(true),
    };
    const r = evaluatePolicy('webflow_create_cms_items', { items: [] }, policy);
    const final = await checkApproval(r, policy);
    expect(final.allowed).toBe(true);
    expect(final.reason).toBe('Approved by handler');
  });

  it('checkApproval denies when handler returns false', async () => {
    const policy: MutationPolicy = {
      mode: 'require_approval',
      requireApprovalFor: ['webflow_create_cms_items'],
      approvalHandler: vi.fn().mockResolvedValue(false),
    };
    const r = evaluatePolicy('webflow_create_cms_items', { items: [] }, policy);
    const final = await checkApproval(r, policy);
    expect(final.allowed).toBe(false);
    expect(final.reason).toBe('Denied by approval handler');
  });

  it('audit hook fires on every decision', () => {
    const events: AuditEvent[] = [];
    setAuditHook((e) => events.push(e));

    evaluatePolicy('webflow_list_sites', {}, DEFAULT_POLICY);
    evaluatePolicy('webflow_create_cms_items', { items: [] }, DEFAULT_POLICY);

    expect(events.length).toBe(2);
    expect(events[0].decision).toBe('allowed');
    expect(events[1].decision).toBe('denied');

    setAuditHook(() => {});
  });
});

describe('tool-metadata.ts — re-exports', () => {
  it('classifyTool returns metadata for known tools', () => {
    const meta = classifyTool('webflow_list_sites');
    expect(meta.mutationClass).toBe('read');
    expect(meta.toolGroup).toBe('sites');
  });

  it('classifyTool returns destructive for unknown tools', () => {
    const meta = classifyTool('nonexistent_tool');
    expect(meta.mutationClass).toBe('destructive');
  });

  it('isWriteOperation returns false for read', () => {
    expect(isWriteOperation('read')).toBe(false);
  });

  it('isWriteOperation returns true for write/destructive/publish', () => {
    expect(isWriteOperation('write')).toBe(true);
    expect(isWriteOperation('destructive')).toBe(true);
    expect(isWriteOperation('publish')).toBe(true);
  });
});

describe('audit.ts — re-exports', () => {
  it('setAuditHook accepts a handler', () => {
    const handler = vi.fn();
    auditSetAuditHook(handler);
    // Fire an event
    evaluatePolicy('webflow_list_sites', {}, DEFAULT_POLICY);
    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as AuditEvent;
    expect(event.toolName).toBe('webflow_list_sites');
    expect(event.decision).toBe('allowed');

    auditSetAuditHook(() => {});
  });
});

describe('secret redaction', () => {
  it('redacts sensitive keys in args', () => {
    const r = evaluatePolicy(
      'webflow_create_cms_items',
      { items: [], token: 'secret123', password: 'hunter2', apiKey: 'abc' },
      { mode: 'allow_writes' },
    );
    expect(r.allowed).toBe(true);
    // The policy result itself doesn't expose args directly, but the audit event does.
    // Verify no crash — redaction is tested in mutation-policy.test.ts
  });
});
