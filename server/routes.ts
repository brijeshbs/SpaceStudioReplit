import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

// Helper for initial data seeding
async function seedDatabase() {
  const existingProjects = await storage.getProjects();
  if (existingProjects.length === 0) {
    console.log("Seeding database...");
    console.log("Database empty. Create a user via Login to start.");
  }
}

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
  app.get(api.floorplans.list.path, async (req, res) => {
    const projectId = Number(req.params.projectId);
    const floorplansList = await storage.getFloorplansByProject(projectId);
    res.json(floorplansList);
  });

  app.post(api.floorplans.create.path, async (req, res) => {
    try {
      const projectId = Number(req.params.projectId);
      const input = api.floorplans.create.input.parse({ ...req.body, projectId });
      const floorplan = await storage.createFloorplan({ ...input, projectId });
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
    const floorplanId = Number(req.params.id);
    const floorplan = await storage.getFloorplan(floorplanId);
    if (!floorplan) {
       return res.status(404).json({ message: 'Floorplan not found' });
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const imgWidth = 800;
    const imgHeight = 600;
    
    const detectedFeatures = {
      walls: [
        { points: [50, 50, imgWidth - 50, 50], type: 'exterior' },
        { points: [imgWidth - 50, 50, imgWidth - 50, imgHeight - 50], type: 'exterior' },
        { points: [imgWidth - 50, imgHeight - 50, 50, imgHeight - 50], type: 'exterior' },
        { points: [50, imgHeight - 50, 50, 50], type: 'exterior' },
        { points: [50, 200, 300, 200], type: 'interior' },
        { points: [400, 50, 400, 300], type: 'interior' },
      ],
      columns: [
        { x: 200, y: 150, radius: 10 },
        { x: 500, y: 150, radius: 10 },
        { x: 200, y: 400, radius: 10 },
        { x: 500, y: 400, radius: 10 },
      ],
      windows: [
        { x: 100, y: 50, width: 80, height: 10 },
        { x: 300, y: 50, width: 80, height: 10 },
        { x: 550, y: 50, width: 80, height: 10 },
      ],
      core: [
        { x: 350, y: 250, width: 100, height: 100, type: 'elevator' }
      ]
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
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      const zoneColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
      const zoneTypes = ['Open Office', 'Meeting Room', 'Focus Zone', 'Collaboration', 'Break Area'];
      
      const zones = [
        { x: 60, y: 60, width: 280, height: 130, name: zoneTypes[0], color: zoneColors[0] },
        { x: 410, y: 60, width: 280, height: 180, name: zoneTypes[1], color: zoneColors[1] },
        { x: 60, y: 210, width: 280, height: 180, name: zoneTypes[2], color: zoneColors[2] },
        { x: 410, y: 310, width: 280, height: 180, name: zoneTypes[3], color: zoneColors[3] },
        { x: 60, y: 410, width: 280, height: 130, name: zoneTypes[4], color: zoneColors[4] },
      ];

      const layout = await storage.createLayout({
        floorplanId,
        name: name || `Generated Layout ${Date.now()}`,
        zoningData: { zones },
        furnitureData: { items: [] },
        kpiScores: {
          spaceEfficiency: 50 + Math.random() * 50,
          costEfficiency: 50 + Math.random() * 50,
          carbonEfficiency: 50 + Math.random() * 50,
          productivityIndex: 50 + Math.random() * 50,
          collaborationScore: 50 + Math.random() * 50,
          comfortIndex: 50 + Math.random() * 50,
        },
        isFrozen: false,
        thumbnailUrl: null
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

  seedDatabase();

  return httpServer;
}
