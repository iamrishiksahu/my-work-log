import { z } from 'zod';
import { workLogSchema, insertWorkLogSchema, componentSchema } from './schema';

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
  workLogs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: {
        200: z.array(workLogSchema),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/logs/:id',
      responses: {
        200: workLogSchema,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/logs',
      input: insertWorkLogSchema,
      responses: {
        201: workLogSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/logs/:id',
      input: insertWorkLogSchema.partial(),
      responses: {
        200: workLogSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/logs/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  components: {
    list: {
      method: 'GET' as const,
      path: '/api/components',
      responses: {
        200: z.array(componentSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/components',
      input: z.object({ name: z.string().min(1) }),
      responses: {
        201: componentSchema,
        400: errorSchemas.validation,
      },
    },
  },
  upload: {
    create: {
      method: 'POST' as const,
      path: '/api/upload',
      // input is FormData
      responses: {
        200: z.object({ url: z.string() }),
        400: errorSchemas.validation,
      },
    },
  }
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
