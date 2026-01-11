import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";
export * from "./models/chat";

// === TABLE DEFINITIONS ===

// Users table is imported from ./models/auth

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  companyType: text("company_type").notNull(), // Tech, Finance, Creative
  headcount: integer("headcount").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const floorplans = pgTable("floorplans", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  originalFilename: text("original_filename").notNull(),
  scale: doublePrecision("scale").default(1.0), // pixels per meter
  features: jsonb("features").$type<{
    walls: any[];
    columns: any[];
    windows: any[];
    core: any[];
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const layouts = pgTable("layouts", {
  id: serial("id").primaryKey(),
  floorplanId: integer("floorplan_id").references(() => floorplans.id).notNull(),
  name: text("name").notNull(),
  zoningData: jsonb("zoning_data").$type<any>(), // Zones definitions
  furnitureData: jsonb("furniture_data").$type<any>(), // Placed furniture
  kpiScores: jsonb("kpi_scores").$type<{
    spaceEfficiency: number;
    costEfficiency: number;
    carbonEfficiency: number;
    productivityIndex: number;
    collaborationScore: number;
    comfortIndex: number;
  }>(),
  isFrozen: boolean("is_frozen").default(false),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertFloorplanSchema = createInsertSchema(floorplans).omit({ id: true, createdAt: true });
export const insertLayoutSchema = createInsertSchema(layouts).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Floorplan = typeof floorplans.$inferSelect;
export type InsertFloorplan = z.infer<typeof insertFloorplanSchema>;

export type Layout = typeof layouts.$inferSelect;
export type InsertLayout = z.infer<typeof insertLayoutSchema>;

// Request Types
export type CreateProjectRequest = InsertProject;
export type CreateFloorplanRequest = InsertFloorplan;
export type GenerateLayoutRequest = {
  floorplanId: number;
  constraints: {
    departmentAdjacencies?: string[];
    workStyle?: 'agile' | 'cubicle' | 'mixed';
  };
};
export type UpdateLayoutRequest = Partial<InsertLayout>;

// Response Types
export type ProjectWithFloorplans = Project & { floorplans: Floorplan[] };
export type FloorplanWithLayouts = Floorplan & { layouts: Layout[] };
