import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { formId, subjectId } = req.query;
  
  if (req.method === 'GET') {
    try {
      const data = await storage.getFormData(
        parseInt(formId as string), 
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