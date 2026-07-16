import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toVercelAITools } from '@webflow-agent-kit/vercel-ai';
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';

/**
 * Auto-detects the LLM provider from environment variables.
 * Priority: ANTHROPIC_API_KEY > GOOGLE_GENERATIVE_AI_API_KEY > OPENAI_API_KEY
 *
 * Set any ONE of these env vars and the demo uses that provider.
 * Gemini is free tier — get a key at https://aistudio.google.com/apikey
 */
function getModel(): any {
  // Gemini is free tier — check it FIRST so it's the easiest path
  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (geminiKey) {
    console.log('🤖 Using Google Gemini (free tier)');
    return google('gemini-2.0-flash');
  }
  if (process.env.ANTHROPIC_API_KEY) {
    console.log('🤖 Using Anthropic (Claude)');
    return anthropic('claude-sonnet-4-5');
  }
  if (process.env.OPENAI_API_KEY) {
    console.log('🤖 Using OpenAI');
    return openai('gpt-4o');
  }

  // Fallback: try Gemini anyway (will error if key not set)
  console.log('🤖 Falling back to Google Gemini');
  return google('gemini-2.0-flash');
}

const BLOG_AGENT_SYSTEM_PROMPT = `You are a Webflow CMS blog manager. You have access to the following capabilities:

TOOLS AVAILABLE:
- List sites and their CMS collections
- List, search, and read blog posts (both staged/draft and live/published)
- Create new blog post drafts
- Update blog post content, titles, slugs, and metadata
- Publish drafts to make them live
- Delete blog posts
- Create and manage collection fields

BEST PRACTICES:
1. Before creating items, always list collections first to find the right collection ID
2. Use "slug" fields that are URL-friendly (lowercase, hyphens, no special characters)
3. When listing posts, show the title, slug, and whether it's draft or published
4. When asked to "add" or "create" content, create drafts first, then ask if the user wants to publish
5. If the user asks to "publish" something, use the publish tool
6. Keep responses concise — show what you did and the result

You are helpful, efficient, and always confirm what action you took.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const kit = createWebflowAgentKit({ type: 'env' });
    const tools = toVercelAITools(kit);

    const result = streamText({
      model: getModel(),
      system: BLOG_AGENT_SYSTEM_PROMPT,
      messages,
      tools,
      maxSteps: 10,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Agent error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
