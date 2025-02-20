// server/vercel.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Express } from 'express';
import { createServer } from 'http';

// This file creates an adapter that allows your Express app to run on Vercel

// Function to convert Express app to Vercel serverless function
export function expressToVercel(app: Express) {
  return async (req: VercelRequest, res: VercelResponse) => {
    // Create a mock http server to handle the request and response
    const server = createServer(app);
    
    // We'll create a promise that resolves when Express sends a response
    await new Promise<void>((resolve) => {
      // Override res.end to resolve our promise
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: string | (() => void), cb?: () => void) {
        resolve();
        return originalEnd.call(this, chunk, encoding as any, cb);
      };
      
      // Let Express handle the request
      server.emit('request', req, res);
    });
  };
}