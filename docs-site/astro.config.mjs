import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'webflow-agent-kit',
      description: 'Open-source AI agent toolkit for Webflow — 62 tools, 6 framework adapters',
      editLink: {
        baseUrl: 'https://github.com/anilpervaiz/webflow-agent-kit/edit/main/docs-site/',
      },
      social: {
        github: 'https://github.com/anilpervaiz/webflow-agent-kit',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'Quick Start', slug: 'getting-started/quickstart' },
          ],
        },
        {
          label: 'Authentication',
          items: [
            { label: 'Overview', slug: 'authentication/overview' },
            { label: 'OAuth Guide', slug: 'authentication/oauth' },
          ],
        },
        {
          label: 'Tools',
          collapsed: false,
          items: [
            { label: 'Overview', slug: 'tools/overview' },
            { label: 'Sites', slug: 'tools/sites' },
            { label: 'Pages', slug: 'tools/pages' },
            { label: 'CMS Items', slug: 'tools/cms' },
            { label: 'Collections', slug: 'tools/collections' },
            { label: 'Ecommerce', slug: 'tools/ecommerce' },
            { label: 'Forms & Assets', slug: 'tools/forms-assets' },
            { label: 'SEO & Webhooks', slug: 'tools/seo-webhooks' },
          ],
        },
        {
          label: 'Adapters',
          items: [
            { label: 'Vercel AI SDK', slug: 'adapters/vercel-ai' },
            { label: 'LangChain', slug: 'adapters/langchain' },
            { label: 'Google ADK', slug: 'adapters/google-adk' },
            { label: 'MCP Server', slug: 'adapters/mcp' },
            { label: 'CLI', slug: 'adapters/cli' },
          ],
        },
        {
          label: 'Examples',
          items: [
            { label: 'Chat Demo', slug: 'examples/chat-demo' },
            { label: 'Skill Packs', slug: 'examples/skill-packs' },
          ],
        },
        {
          label: 'Contributing',
          items: [
            { label: 'Development', slug: 'contributing/development' },
            { label: 'Adding Tools', slug: 'contributing/adding-tools' },
          ],
        },
      ],
    }),
  ],
});
