import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../../server/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id, subjectId } = req.query;
  
  if (req.method === 'GET') {
    try {
      const data = await storage.getFormData(
        parseInt(id as string), 
        subjectId as string
      );
      
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error retrieving form data:', error);
      return res.status(500).json({ error: 'Failed to retrieve form data' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}