import { z } from "zod";

// Work Log Data Model
export const workLogSchema = z.object({
  id: z.string(),
  date: z.string(), // ISO Date string
  title: z.string().min(1, "Title is required"), // "What work I am doing"
  description: z.string().min(1, "Description is required"),
  impact: z.string().optional(), // "What impact it created"
  hoursSpent: z.coerce.number().min(0).default(0),
  issues: z.string().optional(), // "What issues it faced"
  iterations: z.coerce.number().int().min(0).default(0), // "How many reiteration"
  failures: z.string().optional(), // "What were its failures"
  metrics: z.string().optional(), // "Necessary metrics"
  images: z.array(z.string()).default([]), // "Attach images"
});

export const insertWorkLogSchema = workLogSchema.omit({ 
  id: true, 
  date: true 
}).extend({
  // Optional override for date, otherwise auto-tracked
  date: z.string().optional(),
});

export type WorkLog = z.infer<typeof workLogSchema>;
export type InsertWorkLog = z.infer<typeof insertWorkLogSchema>;

// Request/Response Types
export type CreateWorkLogRequest = InsertWorkLog;
export type UpdateWorkLogRequest = Partial<InsertWorkLog>;
