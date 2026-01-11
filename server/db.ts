import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export async function seed() {
  console.log("Seeding database...");
  try {
    const [existingDemoUser] = await db.select().from(users).where(eq(users.id, "demo-user"));
    if (!existingDemoUser) {
      console.log("Creating demo user...");
      await db.insert(users).values({
        id: "demo-user",
        email: "demo@spacestudio.ai",
        firstName: "Demo",
        lastName: "User",
        role: "enterprise"
      });
    }
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

seed().catch(console.error);
