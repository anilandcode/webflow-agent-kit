#!/usr/bin/env node

/**
 * MCP Protocol Smoke Test
 *
 * Spawns the built MCP server with a fake token, performs the MCP
 * initialize + tools/list JSON-RPC handshake over stdio, and asserts
 * the server responds correctly.
 *
 * Exit code: 0 on success, 1 on any failure.
 *
 * Usage:
 *   node packages/mcp/scripts/smoke-test.mjs
 */

import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..', '..');
const SERVER_PATH = join(ROOT, 'packages', 'mcp', 'dist', 'server.js');

const TIMEOUT_MS = 10_000;

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function log(msg) {
  console.log(`  ${msg}`);
}

function send(proc, request) {
  const line = JSON.stringify(request) + '\n';
  proc.stdin.write(line);
}

async function main() {
  log('Starting MCP server...');

  const proc = spawn('node', [SERVER_PATH], {
    env: { ...process.env, WEBFLOW_TOKEN: 'fake-ci-token' },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let timeout;
  let output = '';
  let resolveWith;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const promise = new Promise((resolve, _reject) => {
    resolveWith = resolve;
    timeout = setTimeout(() => {
      proc.kill();
      fail('Timeout: MCP server did not respond within 10 seconds');
    }, TIMEOUT_MS);
  });

  proc.on('error', (err) => {
    clearTimeout(timeout);
    fail(`MCP server failed to start: ${err.message}`);
  });

  proc.on('exit', (code) => {
    clearTimeout(timeout);
    if (code !== null && code !== 0) {
      fail(`MCP server exited with code ${code}. Output: ${output.slice(0, 300)}`);
    }
  });

  proc.stdout.on('data', (chunk) => {
    output += chunk.toString();

    // MCP servers typically respond after initialize
    if (output.includes('"result"')) {
      clearTimeout(timeout);
      resolveWith(output);
    }

    // Error response
    if (output.includes('"error"') && output.includes('"code"')) {
      // Some errors are expected with a fake token at the Webflow level,
      // but the MCP protocol handshake itself must succeed.
      // The initialize response must contain "result" before any Webflow-level errors.
      if (output.includes('"method":"initialize"') || output.includes('"id":1')) {
        // Keep waiting for the result
      } else {
        clearTimeout(timeout);
        resolveWith(output);
      }
    }
  });

  proc.stderr.on('data', (_stderrChunk) => {
    // stderr from the server is not a failure — MCP runs on stdout
    // But don't let it accumulate unbounded
  });

  // Step 1: Initialize
  log('Sending initialize request...');
  send(proc, {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'smoke-test', version: '1.0.0' },
    },
  });

  // Wait for initialize response
  const initOutput = await promise;
  log('Received response');

  // Assert initialize succeeded
  let initResult;
  try {
    const lines = initOutput.trim().split('\n');
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.id === 1) {
          initResult = parsed;
          break;
        }
      } catch {
        // Not JSON — skip
      }
    }
  } catch {
    fail(`Could not parse initialize response. Output: ${initOutput.slice(0, 300)}`);
  }

  if (!initResult) {
    fail(`No initialize response found. Output: ${initOutput.slice(0, 300)}`);
  }

  if (initResult.error) {
    fail(`Initialize returned error: ${JSON.stringify(initResult.error)}`);
  }

  if (!initResult.result) {
    fail(`Initialize response missing result. Full: ${JSON.stringify(initResult).slice(0, 200)}`);
  }

  log(`✅ Initialize OK — server: ${initResult.result.serverInfo?.name || 'unknown'}`);

  // Step 2: tools/list
  log('Sending tools/list request...');

  let toolsResult;
  const toolsPromise = new Promise((resolve, _reject) => {
    const t = setTimeout(() => {
      proc.kill();
      fail('Timeout: tools/list did not respond');
    }, TIMEOUT_MS);

    proc.stdout.on('data', (chunk) => {
      output += chunk.toString();
      try {
        const lines = output.trim().split('\n');
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.id === 2) {
              clearTimeout(t);
              toolsResult = parsed;
              resolve(parsed);
              return;
            }
          } catch {
            // Not JSON — skip
          }
        }
      } catch {
        // Skip
      }
    });
  });

  send(proc, {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {},
  });

  await toolsPromise;

  if (!toolsResult) {
    proc.kill();
    fail('No tools/list response received');
  }

  if (toolsResult.error) {
    proc.kill();
    fail(`tools/list returned error: ${JSON.stringify(toolsResult.error)}`);
  }

  const tools = toolsResult.result?.tools ?? [];
  if (tools.length === 0) {
    proc.kill();
    fail('tools/list returned 0 tools');
  }

  log(`✅ tools/list returned ${tools.length} tools`);

  // Assert webflow_list_sites is present
  const siteTool = tools.find((t) => t.name === 'webflow_list_sites');
  if (!siteTool) {
    proc.kill();
    fail(`webflow_list_sites not found in ${tools.length} tools. Tool names: ${tools.map((t) => t.name).slice(0, 10).join(', ')}`);
  }

  log(`✅ webflow_list_sites found in tools`);
  log(`✅ MCP Protocol Smoke passed`);

  proc.kill();
  process.exit(0);
}

main().catch((e) => {
  console.error(`❌ Unexpected error: ${e.message}`);
  process.exit(1);
});
