import 'dotenv/config';
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toLangChainTools } from '@webflow-agent-kit/langchain';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';

async function main() {
  const kit = createWebflowAgentKit({ type: 'env' });

  const tools = toLangChainTools(kit, ['cms', 'pages', 'sites']);

  const llm = new ChatOpenAI({ model: 'gpt-4o', temperature: 0 });

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a Webflow CMS expert. Use the available tools to manage Webflow content.'],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}'],
  ]);

  const agent = createToolCallingAgent({ llm, tools, prompt });
  const executor = new AgentExecutor({ agent, tools, verbose: true });

  console.log('🤖 LangChain Agent ready.\n');

  const result = await executor.invoke({
    input: 'List all my Webflow sites. For each site, list its CMS collections.',
  });

  console.log('\nResult:', result.output);
}

main().catch(console.error);
