import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { createServer } from 'http';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/vite';

// Function to create a server-to-vercel adapter
function expressToVercel(app: express.Express) {
  return async (req: VercelRequest, res: VercelResponse) => {
    // Create a mock http server to handle the request and response
    const server = createServer(app);
    
    // We'll create a promise that resolves when Express sends a response
    await new Promise<void>((resolve) => {
      // Override res.end to resolve our promise
      const originalEnd = res.end;
      res.end = function(chunk: any, encoding?: string | (() => void), callback?: () => void) {
        resolve();
        if (typeof encoding === 'function') {
          callback = encoding;
          encoding = undefined;
        }
        return originalEnd.call(this, chunk, encoding as BufferEncoding, callback);
      };
      
      // Let Express handle the request
      server.emit('request', req, res);
    });
  };
}

// This creates a standalone Express app just for Vercel
// without depending on importing the default export from server/index
export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    // Create a new Express app for Vercel
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // Register API routes
    await registerRoutes(app);
    
    // Serve static files if this is a frontend request
    if (!req.url?.startsWith('/api')) {
      serveStatic(app);
    }
    
    // Create a Vercel-compatible handler
    const handler = expressToVercel(app);
    
    // Process the request
    return handler(req, res);
  } catch (error) {
    console.error('API handler error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}