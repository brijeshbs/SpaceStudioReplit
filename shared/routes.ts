import { z } from 'zod';
import { 
  insertProjectSchema, 
  insertFloorplanSchema, 
  insertLayoutSchema,
  projects,
  floorplans,
  layouts,
  users
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      responses: {
        200: z.array(z.custom<typeof projects.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects',
      input: insertProjectSchema,
      responses: {
        201: z.custom<typeof projects.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/projects/:id',
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  floorplans: {
    list: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/floorplans',
      responses: {
        200: z.array(z.custom<typeof floorplans.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects/:projectId/floorplans',
      input: insertFloorplanSchema.omit({ projectId: true }),
      responses: {
        201: z.custom<typeof floorplans.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/floorplans/:id',
      responses: {
        200: z.custom<typeof floorplans.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    detect: {
      method: 'POST' as const,
      path: '/api/floorplans/:id/detect',
      responses: {
        200: z.custom<typeof floorplans.$inferSelect>(), // Returns updated floorplan with features
      },
    },
  },
  layouts: {
    list: {
      method: 'GET' as const,
      path: '/api/floorplans/:floorplanId/layouts',
      responses: {
        200: z.array(z.custom<typeof layouts.$inferSelect>()),
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/floorplans/:floorplanId/layouts/generate',
      input: z.object({
        name: z.string(),
        preferences: z.record(z.any()).optional(),
      }),
      responses: {
        201: z.custom<typeof layouts.$inferSelect>(),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/layouts/:id',
      responses: {
        200: z.custom<typeof layouts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/layouts/:id',
      input: insertLayoutSchema.partial(),
      responses: {
        200: z.custom<typeof layouts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
