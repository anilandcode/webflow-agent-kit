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
    console.log('62 tools across 15 API groups:');
    console.log('');
    console.log('  sites         list, get, publish, custom domains');
    console.log('  pages         list, get/update metadata, update static content');
    console.log('  cms           full CRUD + publish + live listing (auto-batched)');
    console.log('  collections   list/get, create/update/delete fields');
    console.log('  assets        list, create (S3 upload), get, delete, folders');
    console.log('  forms         list, get, list/get/update submissions');
    console.log('  ecommerce     12 tools: products (4), orders (5), inventory (3)');
    console.log('  custom-code   get, upsert header/footer scripts, delete');
    console.log('  redirects     list, create, delete (Enterprise)');
    console.log('  seo           robots.txt get/update, well-known files');
    console.log('  webhooks      list, create, get, delete');
    console.log('  components    list, get/update content, get/update properties');
    console.log('  audit-logs    list workspace audit logs');
    console.log('');
    console.log('6 adapters:');
    console.log('  • Vercel AI SDK   @webflow-agent-kit/vercel-ai');
    console.log('  • LangChain       @webflow-agent-kit/langchain');
    console.log('  • Google ADK      @webflow-agent-kit/google-adk');
    console.log('  • MCP Server      @webflow-agent-kit/mcp');
    console.log('  • CLI             @webflow-agent-kit/cli');
    console.log('  • Agnostic Runner @webflow-agent-kit/core (createAgentRunner)');
  });

program.parse();
