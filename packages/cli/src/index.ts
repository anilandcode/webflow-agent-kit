#!/usr/bin/env node
import { Command } from 'commander';
import { createWebflowAgentKit, createSiteTools } from '@webflow-agent-kit/core';

const program = new Command();

program
  .name('wfak')
  .description('Webflow Agent Kit CLI — run Webflow tasks from the terminal')
  .version('0.0.1');

program
  .command('auth')
  .description('Check or configure Webflow authentication')
  .action(() => {
    const token = process.env.WEBFLOW_TOKEN;
    if (token) {
      console.log('✅ WEBFLOW_TOKEN is set');
      console.log(`   Token: ${token.slice(0, 6)}...${token.slice(-4)}`);
    } else {
      console.log('❌ WEBFLOW_TOKEN is not set');
      console.log('   Set it with: export WEBFLOW_TOKEN=your_token_here');
    }
  });

program
  .command('sites')
  .description('List all Webflow sites')
  .option('-l, --limit <number>', 'Max sites to return', '50')
  .action(async (options) => {
    try {
      const kit = createWebflowAgentKit({ type: 'env' });
      const { listSites } = createSiteTools(kit.client);
      const result = await listSites.execute({
        limit: parseInt(options.limit, 10),
        offset: 0,
      });
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('run <prompt>')
  .description('Run an agent task with a natural language prompt')
  .action(async (prompt: string) => {
    console.log(`Running agent task: "${prompt}"`);
    console.log('(Full agent execution coming in Phase 2)');
    console.log('For now, use the specific commands: wfak sites, wfak pages, wfak auth');
  });

program
  .command('tools')
  .description('List available tools')
  .action(() => {
    console.log('Available tool groups:');
    console.log('  sites      — List, get, publish sites and domains');
    console.log('  pages      — List, get, update page metadata and static content');
    console.log('  cms        — Full CMS item CRUD (staged + live)');
    console.log('  collections — List and get collection schemas');
    console.log('');
    console.log('Use these tools through:');
    console.log('  • Vercel AI SDK:    @webflow-agent-kit/vercel-ai');
    console.log('  • LangChain:        @webflow-agent-kit/langchain');
    console.log('  • MCP Server:       @webflow-agent-kit/mcp');
    console.log('  • CLI:              @webflow-agent-kit/cli');
  });

program.parse();
