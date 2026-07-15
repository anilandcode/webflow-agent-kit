import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createListAuditLogsTool(client: WebflowClient) {
  return {
    name: 'webflow_list_audit_logs',
    description:
      'List workspace audit logs. Shows all actions taken in the workspace with timestamps, actor info, and action types. Useful for security and compliance auditing.',
    inputSchema: z.object({
      workspaceId: z.string().describe('The workspace ID'),
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
      fromDate: z.string().optional().describe('ISO date filter (e.g., 2026-01-01)'),
      toDate: z.string().optional().describe('ISO date filter'),
    }),
    execute: async ({
      workspaceId,
      limit,
      offset,
      fromDate,
      toDate,
    }: {
      workspaceId: string;
      limit: number;
      offset: number;
      fromDate?: string;
      toDate?: string;
    }) => {
      const request: Record<string, unknown> = { limit, offset };
      if (fromDate) request.fromDate = fromDate;
      if (toDate) request.toDate = toDate;
      const logs = await client.workspaces.auditLogs.getWorkspaceAuditLogs(workspaceId, request);
      return logs;
    },
  };
}

export function createAuditLogTools(client: WebflowClient) {
  return {
    listAuditLogs: createListAuditLogsTool(client),
  };
}
