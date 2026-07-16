/**
 * Provider-agnostic agent runner for webflow-agent-kit.
 *
 * Detects your LLM provider from environment variables and runs the agent
 * with the appropriate model. No lock-in to any single AI provider.
 *
 * Supported providers (auto-detected in order):
 *   GOOGLE_GENERATIVE_AI_API_KEY → Gemini 2.5 Flash (free tier)
 *   ANTHROPIC_API_KEY            → Claude Sonnet
 *   OPENAI_API_KEY               → GPT-4o
 *
 * Usage:
 *   import { createAgentRunner } from '@webflow-agent-kit/core';
 *   const runner = createAgentRunner({ type: 'env' });
 *   const result = await runner.generate('List all my sites');
 */

import { createWebflowAgentKit } from './client.js';
import type { WebflowAuthConfig } from './auth.js';
import type { WebflowAgentKit } from './client.js';

export type AgentRunnerOptions = WebflowAuthConfig;

export interface AgentRunner {
  kit: WebflowAgentKit;
  /**
   * Returns the detected provider name and model.
   */
  getProviderInfo: () => { provider: string; model: string };
}

/**
 * Creates a provider-agnostic agent runner. Callers bring their own
 * AI SDK model — this just handles auth and tool setup.
 */
export function createAgentRunner(auth: AgentRunnerOptions): AgentRunner {
  const kit = createWebflowAgentKit(auth);

  return {
    kit,
    getProviderInfo: () => {
      if (process.env.ANTHROPIC_API_KEY)
        return { provider: 'anthropic', model: 'claude-sonnet-4-5' };
      if (process.env.GOOGLE_GENERATIVE_AI_API_KEY)
        return { provider: 'google', model: 'gemini-2.5-flash' };
      if (process.env.OPENAI_API_KEY) return { provider: 'openai', model: 'gpt-4o' };
      return { provider: 'google', model: 'gemini-2.5-flash' };
    },
  };
}
