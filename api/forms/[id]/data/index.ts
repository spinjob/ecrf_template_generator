import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../../server/storage.js';
import { formDataValidationSchema } from '../../../../shared/schema.js';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  
  // Save form data
  if (req.method === 'POST') {
    try {
      const formData = formDataValidationSchema.parse(req.body);
      const result = await storage.saveFormData({
        ...formData,
        formDefinitionId: parseInt(id as string),
        lastUpdated: new Date().toISOString()
      });
      
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      } else {
        console.error('Form data save error:', error);
        return res.status(500).json({ error: 'Failed to save form data' });
      }
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}