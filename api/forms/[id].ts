import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    try {
      const formId = parseInt(id as string);
      const form = await storage.getFormDefinition(formId);
      
      if (!form) {
        return res.status(404).json({ error: 'Form not found' });
      }
      
      return res.status(200).json(form);
    } catch (error) {
      console.error('Error fetching form:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}