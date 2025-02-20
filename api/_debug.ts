// api/_debug.ts - Use this to verify module loading
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as serverIndex from '../server/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // List all exports from server/index
  const exports = Object.keys(serverIndex);
  
  // Return debugging information
  return res.status(200).json({
    message: 'Vercel module loading diagnostic',
    serverIndexExports: exports,
    hasDefaultExport: 'default' in serverIndex,
    moduleType: 'ESM',
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'unknown'
  });
}