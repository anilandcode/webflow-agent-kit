import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'webflow-agent-kit',
      description: 'Open-source AI agent toolkit for Webflow — 62 tools, 6 framework adapters',
      editLink: {
        baseUrl: 'https://github.com/anilandcode/webflow-agent-kit/edit/main/docs-site/',
      },
      social: {
        github: 'https://github.com/anilandcode/webflow-agent-kit',
      },
      sidebar: [
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' },
        },
        {
          label: 'Tools',
          autogenerate: { directory: 'tools' },
        },
        {
          label: 'Examples',
          autogenerate: { directory: 'examples' },
        },
      ],
    }),
  ],
});
