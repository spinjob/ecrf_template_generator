import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { formDataValidationSchema, insertFormDefinitionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post('/api/forms', async (req, res) => {
    try {
      const formDef = insertFormDefinitionSchema.parse(req.body);
      const result = await storage.createFormDefinition(formDef);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create form definition' });
      }
    }
  });

  app.get('/api/forms/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const form = await storage.getFormDefinition(id);
    if (!form) {
      res.status(404).json({ error: 'Form not found' });
      return;
    }
    res.json(form);
  });

  app.post('/api/forms/:formId/data', async (req, res) => {
    try {
      const formData = formDataValidationSchema.parse(req.body);
      const result = await storage.saveFormData({
        ...formData,
        formDefinitionId: parseInt(req.params.formId),
        lastUpdated: new Date().toISOString()
      });
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to save form data' });
      }
    }
  });

  app.get('/api/forms/:formId/data/:subjectId', async (req, res) => {
    const { formId, subjectId } = req.params;
    const data = await storage.getFormData(parseInt(formId), subjectId);
    res.json(data);
  });

  const httpServer = createServer(app);
  return httpServer;
}
