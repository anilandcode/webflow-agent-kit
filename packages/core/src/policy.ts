// Re-export from the canonical policy module
export {
  evaluatePolicy,
  checkApproval,
  setAuditHook,
  DEFAULT_POLICY,
  type MutationPolicy,
  type PolicyMode,
  type PolicyResult,
  type MutationRequest,
  type AuditEvent,
  type AuditHook,
} from './mutation-policy.js';
