import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Register AI Routes
  registerChatRoutes(app);
  registerImageRoutes(app);

  // === Projects ===
  app.get(api.projects.list.path, async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.post(api.projects.create.path, async (req, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject(input);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.projects.get.path, async (req, res) => {
    const project = await storage.getProject(Number(req.params.id));
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  });

  // === Floorplans ===
  app.post(api.floorplans.create.path, async (req, res) => {
    try {
      // In a real app, we would handle file upload here using multer
      // For now, we assume body contains image URL
      const projectId = Number(req.params.projectId);
      const input = api.floorplans.create.input.parse({ ...req.body, projectId });
      const floorplan = await storage.createFloorplan(input);
      res.status(201).json(floorplan);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.floorplans.get.path, async (req, res) => {
    const floorplan = await storage.getFloorplan(Number(req.params.id));
    if (!floorplan) {
      return res.status(404).json({ message: 'Floorplan not found' });
    }
    res.json(floorplan);
  });

  app.post(api.floorplans.detect.path, async (req, res) => {
    // Mock AI detection logic
    const floorplanId = Number(req.params.id);
    const floorplan = await storage.getFloorplan(floorplanId);
    if (!floorplan) {
       return res.status(404).json({ message: 'Floorplan not found' });
    }

    // Simulate AI detection delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const detectedFeatures = {
      walls: [{ x1: 0, y1: 0, x2: 100, y2: 0, type: 'concrete' }],
      columns: [{ x: 50, y: 50, radius: 5 }],
      windows: [],
      core: []
    };

    const updated = await storage.updateFloorplanFeatures(floorplanId, detectedFeatures);
    res.json(updated);
  });

  // === Layouts ===
  app.get(api.layouts.list.path, async (req, res) => {
    const layouts = await storage.getLayoutsByFloorplan(Number(req.params.floorplanId));
    res.json(layouts);
  });

  app.post(api.layouts.generate.path, async (req, res) => {
    try {
      const floorplanId = Number(req.params.floorplanId);
      const { name, preferences } = req.body;
      
      // Simulate AI Generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const layout = await storage.createLayout({
        floorplanId,
        name: name || `Generated Layout ${Date.now()}`,
        zoningData: { zones: [] },
        furnitureData: { items: [] },
        kpiScores: {
          spaceEfficiency: Math.random() * 100,
          costEfficiency: Math.random() * 100,
          carbonEfficiency: Math.random() * 100,
          productivityIndex: Math.random() * 100,
          collaborationScore: Math.random() * 100,
          comfortIndex: Math.random() * 100,
        },
        isFrozen: false,
        thumbnailUrl: null // Could generate this
      });
      res.status(201).json(layout);
    } catch (err) {
      res.status(500).json({ message: "Failed to generate layout" });
    }
  });

  app.get(api.layouts.get.path, async (req, res) => {
     const layout = await storage.getLayout(Number(req.params.id));
     if (!layout) {
       return res.status(404).json({ message: 'Layout not found' });
     }
     res.json(layout);
  });

  app.put(api.layouts.update.path, async (req, res) => {
    const layout = await storage.updateLayout(Number(req.params.id), req.body);
    if (!layout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    res.json(layout);
  });

  return httpServer;
}
