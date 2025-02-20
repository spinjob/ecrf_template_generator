import { VercelRequest, VercelResponse } from '@vercel/node';
import vercelHandler from '../server/index.js';

// This is the main entry point for API requests
export default async function (req: VercelRequest, res: VercelResponse) {
  return vercelHandler(req, res);
}