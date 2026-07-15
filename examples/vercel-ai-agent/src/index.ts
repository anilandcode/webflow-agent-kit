import 'dotenv/config';
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toVercelAITools } from '@webflow-agent-kit/vercel-ai';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

async function main() {
  // Initialize with WEBFLOW_TOKEN from .env
  const kit = createWebflowAgentKit({ type: 'env' });

  // Get all tools (or specific groups: ['cms', 'sites'])
  const tools = toVercelAITools(kit);

  console.log('🤖 Agent ready. Running...\n');

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5'),
    tools,
    maxSteps: 10,
    prompt: 'List all my Webflow sites and their published status. For each site, tell me how many pages it has.',
  });

  console.log(text);
}

main().catch(console.error);
