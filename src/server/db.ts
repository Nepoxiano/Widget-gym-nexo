let clientInstance: any = null;

async function getClient() {
  if (clientInstance) return clientInstance;

  const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const isNode = typeof process !== 'undefined' && process.release && process.release.name === 'node';

  if (isNode && url.startsWith('file:')) {
    // Local development in Node: load native client to support file: URLs
    // We use a variable to bypass static analysis of bundlers like esbuild on Vercel
    const nodeModuleName = '@libsql/client';
    const { createClient: createNodeClient } = await import(nodeModuleName);
    clientInstance = createNodeClient({ url, authToken });
  } else {
    // Production / Edge: load web-compatible client
    const { createClient: createWebClient } = await import('@libsql/client/web');
    clientInstance = createWebClient({ url, authToken });
  }

  return clientInstance;
}

export const db = {
  execute: async (args: any) => {
    const client = await getClient();
    return client.execute(args);
  },
  batch: async (stmts: any, mode?: any) => {
    const client = await getClient();
    return client.batch(stmts, mode);
  }
};

