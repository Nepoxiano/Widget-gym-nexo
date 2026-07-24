// Detect environment
const isNode = typeof process !== 'undefined' && process.release && process.release.name === 'node';
const url = process.env.TURSO_DATABASE_URL || 'file:local.db';

let createClient;

if (isNode && url.startsWith('file:')) {
  // Local development in Node: load native client to support file: URLs
  // We use a variable to bypass static analysis of bundlers like esbuild on Vercel
  const nodeModuleName = '@libsql/client';
  const { createClient: createNodeClient } = await import(nodeModuleName);
  createClient = createNodeClient;
} else {
  // Production / Edge: load web-compatible client
  const { createClient: createWebClient } = await import('@libsql/client/web');
  createClient = createWebClient;
}

const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  authToken,
});
