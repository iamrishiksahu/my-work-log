import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup file upload
  const uploadDir = path.join(process.cwd(), "client", "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storageConfig = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage: storageConfig });

  // Serve uploads statically (although Vite handles public folder, we might need explicit route for api access if needed, but public folder is usually served at root)
  // Vite serves `client/public` at root `/`. So `/uploads/file.jpg` should work.

  // API Routes

  app.get(api.workLogs.list.path, async (req, res) => {
    const logs = await storage.getWorkLogs();
    res.json(logs);
  });

  app.get(api.workLogs.get.path, async (req, res) => {
    const log = await storage.getWorkLog(req.params.id);
    if (!log) {
      return res.status(404).json({ message: "Work log not found" });
    }
    res.json(log);
  });

  app.post(api.workLogs.create.path, async (req, res) => {
    try {
      const input = api.workLogs.create.input.parse(req.body);
      const log = await storage.createWorkLog(input);
      res.status(201).json(log);
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

  app.put(api.workLogs.update.path, async (req, res) => {
    try {
      const input = api.workLogs.update.input.parse(req.body);
      try {
        const log = await storage.updateWorkLog(req.params.id, input);
        res.json(log);
      } catch (e) {
        return res.status(404).json({ message: "Work log not found" });
      }
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

  app.delete(api.workLogs.delete.path, async (req, res) => {
    await storage.deleteWorkLog(req.params.id);
    res.status(204).send();
  });

  app.get(api.components.list.path, async (_req, res) => {
    const components = await storage.getComponents();
    res.json(components);
  });

  app.post(api.components.create.path, async (req, res) => {
    try {
      const input = api.components.create.input.parse(req.body);
      const component = await storage.createComponent(input);
      res.status(201).json(component);
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

  app.post(api.upload.create.path, upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // Seed Data
  if ((await storage.getWorkLogs()).length === 0) {
    await storage.createWorkLog({
      title: "Initial Setup",
      description: "Setting up the work log application with file storage and image uploads.",
      impact: "Created a centralized place to track work progress.",
      jira: "",
      type: "task",
      hoursSpent: 4,
      issues: "Deciding on storage strategy for serverless environments.",
      iterations: 1,
      failures: "None so far.",
      metrics: "Time to deploy: < 10 mins",
      images: [],
      component: "Platform",
      impactLevel: "medium",
      date: new Date().toISOString()
    });
    await storage.createComponent({ name: "Platform" });
  }

  return httpServer;
}
