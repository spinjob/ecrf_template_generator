import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage.js';
import { insertFormDefinitionSchema } from '../../shared/schema.js';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Create form definition
  if (req.method === 'POST') {
    try {
      const formDef = insertFormDefinitionSchema.parse(req.body);
      const result = await storage.createFormDefinition(formDef);
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      } else {
        console.error('Form creation error:', error);
        return res.status(500).json({ error: 'Failed to create form definition' });
      }
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}