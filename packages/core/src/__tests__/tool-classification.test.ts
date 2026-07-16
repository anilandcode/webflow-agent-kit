import { describe, it, expect, beforeEach } from 'vitest';
import { classifyTool, isWriteOperation, getToolClassSummary } from '../tool-classification';
import type { MutationClass } from '../tool-classification';

describe('classifyTool', () => {
  it('classifies read tools correctly', () => {
    const meta = classifyTool('webflow_list_sites');
    expect(meta.mutationClass).toBe('read');
    expect(meta.toolGroup).toBe('sites');
  });

  it('classifies write tools correctly', () => {
    const meta = classifyTool('webflow_create_cms_items');
    expect(meta.mutationClass).toBe('write');
    expect(meta.toolGroup).toBe('cms');
  });

  it('classifies destructive tools correctly', () => {
    const meta = classifyTool('webflow_delete_cms_items');
    expect(meta.mutationClass).toBe('destructive');
  });

  it('classifies publish tools correctly', () => {
    const meta = classifyTool('webflow_publish_cms_items');
    expect(meta.mutationClass).toBe('publish');
  });

  it('returns destructive for unknown tools', () => {
    const meta = classifyTool('unknown_tool');
    expect(meta.mutationClass).toBe('destructive');
    expect(meta.toolGroup).toBe('unknown');
  });

  it('getItemCount returns correct count for arrays', () => {
    const meta = classifyTool('webflow_create_cms_items');
    expect(meta.getItemCount({ items: [1, 2, 3] })).toBe(3);
  });

  it('getItemCount returns 1 for non-arrays', () => {
    const meta = classifyTool('webflow_create_cms_items');
    expect(meta.getItemCount({})).toBe(1);
  });

  it('getSiteId extracts siteId from args', () => {
    const meta = classifyTool('webflow_get_site');
    expect(meta.getSiteId({ siteId: 'site-123' })).toBe('site-123');
  });
});

describe('isWriteOperation', () => {
  it('returns false for read', () => {
    expect(isWriteOperation('read')).toBe(false);
  });

  it.each(['write', 'destructive', 'publish'] as MutationClass[])(
    'returns true for %s',
    (mclass) => {
      expect(isWriteOperation(mclass)).toBe(true);
    },
  );
});

describe('getToolClassSummary', () => {
  it('returns 62 tools', () => {
    const summary = getToolClassSummary();
    expect(summary.length).toBe(62);
  });

  it('every tool has a valid mutationClass', () => {
    const valid: MutationClass[] = ['read', 'write', 'destructive', 'publish'];
    for (const tool of getToolClassSummary()) {
      expect(valid).toContain(tool.mutationClass);
    }
  });

  it('all known groups are present', () => {
    const groups = new Set(getToolClassSummary().map((t) => t.toolGroup));
    expect(groups.has('sites')).toBe(true);
    expect(groups.has('cms')).toBe(true);
    expect(groups.has('ecommerce-products')).toBe(false); // stored as 'products'
    expect(groups.has('products')).toBe(true);
  });
});
