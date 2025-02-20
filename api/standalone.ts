import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { createServer } from 'http';
import { expressToVercel } from '../server/vercel.js';
import { registerRoutes } from '../server/routes.js';
import { serveStatic } from '../server/vite.js';

// This creates a standalone Express app just for Vercel
// without depending on importing the default export from server/index
export default async function (req: VercelRequest, res: VercelResponse) {
  // Create a new Express app for Vercel
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // Register API routes
  await registerRoutes(app);
  
  // Serve static files
  serveStatic(app);
  
  // Create a Vercel-compatible handler
  const handler = expressToVercel(app);
  
  // Process the request
  return handler(req, res);
}