import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toVercelAITools } from '@webflow-agent-kit/vercel-ai';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

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
      model: anthropic('claude-sonnet-4-5'),
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
