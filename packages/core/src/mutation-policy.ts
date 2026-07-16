import { classifyTool, isWriteOperation } from './tool-classification.js';
import type { MutationClass } from './tool-classification.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PolicyMode = 'read_only' | 'plan_only' | 'require_approval' | 'allow_writes';

export interface MutationPolicy {
  /** The enforcement mode */
  mode: PolicyMode;
  /** Tool groups allowed to mutate. Undefined = all groups allowed (subject to mode) */
  allowedToolGroups?: string[];
  /** Specific tool names to block regardless of mode */
  blockedToolNames?: string[];
  /** Limit mutations to these site IDs */
  allowedSiteIds?: string[];
  /** Max items per single mutation (for bulk operations) */
  maxItemsPerMutation?: number;
  /** Tool names that require explicit approval before execution */
  requireApprovalFor?: string[];
  /**
   * Optional async handler called when a tool requires approval.
   * Return true to approve, false to deny.
   */
  approvalHandler?: (request: MutationRequest) => Promise<boolean>;
}

export interface MutationRequest {
  /** Tool name */
  toolName: string;
  /** Tool group */
  toolGroup: string;
  /** Mutation classification */
  mutationClass: MutationClass;
  /** Extracted site ID (redacted if present in args) */
  siteId: string | null;
  /** Tool arguments with sensitive fields redacted */
  args: Record<string, unknown>;
  /** Estimated item count */
  itemCount: number;
  /** Unique request ID */
  requestId: string;
  /** ISO timestamp */
  timestamp: string;
}

export interface PolicyResult {
  /** Whether the mutation is allowed */
  allowed: boolean;
  /** Reason for denial (empty if allowed) */
  reason: string;
  /** The mode used for evaluation */
  mode: PolicyMode;
  /** Whether approval is required before executing */
  requiresApproval: boolean;
  /** The approval request (null if not required) */
  approvalRequest?: MutationRequest;
}

export interface AuditEvent {
  /** Request ID */
  requestId: string;
  /** Tool name */
  toolName: string;
  /** Decision: 'allowed' | 'denied' | 'blocked' | 'plan_only_blocked' */
  decision: string;
  /** Reason */
  reason: string;
  /** The mutation request */
  request: MutationRequest;
  /** ISO timestamp */
  timestamp: string;
}

/** Called for every policy decision. Set your own handler. */
export type AuditHook = (event: AuditEvent) => void;

// ---------------------------------------------------------------------------
// Sensitive key patterns for redaction
// ---------------------------------------------------------------------------

const SENSITIVE_KEY_PATTERNS = /token|password|secret|key|auth/i;

function redactArgs(args: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(args)) {
    if (SENSITIVE_KEY_PATTERNS.test(key)) {
      redacted[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      redacted[key] = redactArgs(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

// ---------------------------------------------------------------------------
// Policy engine
// ---------------------------------------------------------------------------

let requestCounter = 0;

function nextRequestId(): string {
  requestCounter++;
  return `mreq_${Date.now()}_${requestCounter}`;
}

/**
 * Default audit hook (no-op). Replace with your own implementation.
 */
let auditHook: AuditHook = () => {};

export function setAuditHook(hook: AuditHook): void {
  auditHook = hook;
}

/**
 * Default policy for new agent-facing APIs: read_only
 * Backward compatibility: adapter consumers can explicitly set mode: 'allow_writes'
 */
export const DEFAULT_POLICY: MutationPolicy = {
  mode: 'read_only',
};

/**
 * Evaluate a tool call against the mutation policy.
 *
 * @param toolName  The tool name (e.g., 'webflow_create_cms_items')
 * @param args      The raw tool arguments
 * @param policy    The active mutation policy
 * @returns         A PolicyResult indicating whether the call is allowed
 */
export function evaluatePolicy(
  toolName: string,
  args: Record<string, unknown>,
  policy: MutationPolicy = DEFAULT_POLICY,
): PolicyResult {
  const meta = classifyTool(toolName);
  const redacted = redactArgs(args);
  const request: MutationRequest = {
    toolName,
    toolGroup: meta.toolGroup,
    mutationClass: meta.mutationClass,
    siteId: meta.getSiteId(args),
    args: redacted,
    itemCount: meta.getItemCount(args),
    requestId: nextRequestId(),
    timestamp: new Date().toISOString(),
  };

  // --- Read operations are always allowed ---
  if (!isWriteOperation(meta.mutationClass)) {
    const result: PolicyResult = {
      allowed: true,
      reason: 'read operation',
      mode: policy.mode,
      requiresApproval: false,
    };
    emitAudit(result, request);
    return result;
  }

  // --- Blocked tool names (absolute denials) ---
  if (policy.blockedToolNames?.includes(toolName)) {
    const result: PolicyResult = {
      allowed: false,
      reason: `Tool "${toolName}" is blocked`,
      mode: policy.mode,
      requiresApproval: false,
    };
    emitAudit(result, request);
    return result;
  }

  // --- Allowed tool groups check ---
  if (policy.allowedToolGroups && policy.allowedToolGroups.length > 0) {
    if (!policy.allowedToolGroups.includes(meta.toolGroup)) {
      const result: PolicyResult = {
        allowed: false,
        reason: `Tool group "${meta.toolGroup}" is not in the allowed groups`,
        mode: policy.mode,
        requiresApproval: false,
      };
      emitAudit(result, request);
      return result;
    }
  }

  // --- Allowed site IDs check ---
  if (policy.allowedSiteIds && policy.allowedSiteIds.length > 0 && request.siteId) {
    if (!policy.allowedSiteIds.includes(request.siteId)) {
      const result: PolicyResult = {
        allowed: false,
        reason: `Site "${request.siteId}" is not in the allowed sites`,
        mode: policy.mode,
        requiresApproval: false,
      };
      emitAudit(result, request);
      return result;
    }
  }

  // --- Max items per mutation ---
  if (policy.maxItemsPerMutation !== undefined && request.itemCount > policy.maxItemsPerMutation) {
    const result: PolicyResult = {
      allowed: false,
      reason: `Mutation of ${request.itemCount} items exceeds limit of ${policy.maxItemsPerMutation}`,
      mode: policy.mode,
      requiresApproval: false,
    };
    emitAudit(result, request);
    return result;
  }

  // --- Mode-based enforcement ---
  switch (policy.mode) {
    case 'read_only':
      return deny(`Tool "${toolName}" is a write operation; policy mode is read_only`, request);

    case 'plan_only':
      return deny(
        `Tool "${toolName}" is a write operation; policy mode is plan_only. Use plan() or dryRun() instead.`,
        request,
      );

    case 'require_approval': {
      const needsApproval = policy.requireApprovalFor?.includes(toolName) ?? false;

      if (!needsApproval) {
        // Tool is not on the approval list — allow it
        return allow(request);
      }

      // Tool needs approval — but we can't call approvalHandler here synchronously
      // Return a result that says "approval required" — caller handles it
      const presult: PolicyResult = {
        allowed: true,
        reason: `Tool "${toolName}" requires approval`,
        mode: policy.mode,
        requiresApproval: true,
        approvalRequest: request,
      };
      emitAudit(presult, request);
      return presult;
    }

    case 'allow_writes':
      return allow(request);

    default:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return deny(`Unknown policy mode: ${(policy as any).mode}`, request);
  }
}

/**
 * Check if the policy requires additional approval before executing.
 * Returns the approval request if so, null otherwise.
 */
export async function checkApproval(
  result: PolicyResult,
  policy: MutationPolicy,
): Promise<PolicyResult> {
  if (!result.requiresApproval || !result.approvalRequest) {
    return result;
  }

  if (!policy.approvalHandler) {
    return {
      allowed: false,
      reason: 'Approval required but no approvalHandler is configured',
      mode: policy.mode,
      requiresApproval: false,
    };
  }

  const approved = await policy.approvalHandler(result.approvalRequest);
  if (approved) {
    return {
      allowed: true,
      reason: 'Approved by handler',
      mode: policy.mode,
      requiresApproval: false,
    };
  }

  return {
    allowed: false,
    reason: 'Denied by approval handler',
    mode: policy.mode,
    requiresApproval: false,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function allow(request: MutationRequest): PolicyResult {
  const presult: PolicyResult = {
    allowed: true,
    reason: `Allows writes to ${request.toolGroup}`,
    mode: 'allow_writes',
    requiresApproval: false,
  };
  emitAudit(presult, request);
  return presult;
}

function deny(reason: string, request: MutationRequest): PolicyResult {
  const out: PolicyResult = {
    allowed: false,
    reason,
    mode: 'read_only',
    requiresApproval: false,
  };
  emitAudit(out, request);
  return out;
}

function emitAudit(policyResult: PolicyResult, request: MutationRequest): void {
  const event: AuditEvent = {
    requestId: request.requestId,
    toolName: request.toolName,
    decision: policyResult.allowed ? 'allowed' : 'denied',
    reason: policyResult.reason,
    request,
    timestamp: new Date().toISOString(),
  };
  auditHook(event);
}
