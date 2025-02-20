import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { expressToVercel } from './vercel';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize app with all routes
let appInstance: express.Express | null = null;
let serverInstance: any = null;

// Setup for both local development and Vercel
const setupApp = async () => {
  // Register API routes
  const server = await registerRoutes(app);
  serverInstance = server;

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Check if running on Vercel or in development
  const isVercel = process.env.VERCEL === '1';
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev && !isVercel) {
    // Development mode - setup Vite HMR
    await setupVite(app, server);
    
    // Start the local server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      log(`serving on port ${PORT}`);
    });
  } else if (!isDev && !isVercel) {
    // Production mode but not on Vercel - serve static assets
    serveStatic(app);
    
    // Start the local server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      log(`serving on port ${PORT}`);
    });
  } else {
    // On Vercel - serve static assets
    serveStatic(app);
  }

  appInstance = app;
  return app;
};

// Initialize the app immediately
setupApp().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Get the initialized app, waiting if necessary
const getApp = async () => {
  if (appInstance) return appInstance;
  
  // Wait for app to initialize if it hasn't yet
  return setupApp();
};

// Export the Vercel handler as a named export
export const vercelHandler = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const app = await getApp();
    return expressToVercel(app)(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Also export as default for ESM compatibility
export default vercelHandler;