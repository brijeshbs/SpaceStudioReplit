import { db } from "./db";
import {
  users, projects, floorplans, layouts,
  type User, type UpsertUser,
  type Project, type InsertProject,
  type Floorplan, type InsertFloorplan,
  type Layout, type InsertLayout
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  
  // Floorplans
  getFloorplansByProject(projectId: number): Promise<Floorplan[]>;
  getFloorplan(id: number): Promise<Floorplan | undefined>;
  createFloorplan(floorplan: InsertFloorplan): Promise<Floorplan>;
  updateFloorplanFeatures(id: number, features: any): Promise<Floorplan | undefined>;

  // Layouts
  getLayoutsByFloorplan(floorplanId: number): Promise<Layout[]>;
  getLayout(id: number): Promise<Layout | undefined>;
  createLayout(layout: InsertLayout): Promise<Layout>;
  updateLayout(id: number, updates: Partial<InsertLayout>): Promise<Layout | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  // Floorplans
  async getFloorplansByProject(projectId: number): Promise<Floorplan[]> {
    return await db.select().from(floorplans).where(eq(floorplans.projectId, projectId));
  }

  async getFloorplan(id: number): Promise<Floorplan | undefined> {
    const [floorplan] = await db.select().from(floorplans).where(eq(floorplans.id, id));
    return floorplan;
  }

  async createFloorplan(floorplan: InsertFloorplan): Promise<Floorplan> {
    const [newFloorplan] = await db.insert(floorplans).values(floorplan).returning();
    return newFloorplan;
  }

  async updateFloorplanFeatures(id: number, features: any): Promise<Floorplan | undefined> {
    const [updated] = await db
      .update(floorplans)
      .set({ features })
      .where(eq(floorplans.id, id))
      .returning();
    return updated;
  }

  // Layouts
  async getLayoutsByFloorplan(floorplanId: number): Promise<Layout[]> {
    return await db.select().from(layouts).where(eq(layouts.floorplanId, floorplanId));
  }

  async getLayout(id: number): Promise<Layout | undefined> {
    const [layout] = await db.select().from(layouts).where(eq(layouts.id, id));
    return layout;
  }

  async createLayout(layout: InsertLayout): Promise<Layout> {
    const [newLayout] = await db.insert(layouts).values(layout).returning();
    return newLayout;
  }

  async updateLayout(id: number, updates: Partial<InsertLayout>): Promise<Layout | undefined> {
    const [updated] = await db
      .update(layouts)
      .set(updates)
      .where(eq(layouts.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
