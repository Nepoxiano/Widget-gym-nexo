import { serve } from '@hono/node-server';
import app from './index';

const port = 3000;
console.log(`Server starting...
Hono API running locally at http://localhost:${port}
Press Ctrl+C to stop.`);

serve({
  fetch: app.fetch,
  port,
});
