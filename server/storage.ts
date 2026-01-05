import { WorkLog, InsertWorkLog, UpdateWorkLogRequest, Component } from "@shared/schema";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export interface IStorage {
  getWorkLogs(): Promise<WorkLog[]>;
  getWorkLog(id: string): Promise<WorkLog | undefined>;
  createWorkLog(log: InsertWorkLog): Promise<WorkLog>;
  updateWorkLog(id: string, updates: UpdateWorkLogRequest): Promise<WorkLog>;
  deleteWorkLog(id: string): Promise<void>;
  
  getComponents(): Promise<Component[]>;
  createComponent(name: string): Promise<Component>;
}

const DATA_DIR = "data";
const LOGS_FILE = path.join(DATA_DIR, "worklogs.json");
const COMPONENTS_FILE = path.join(DATA_DIR, "components.json");

export class JsonFileStorage implements IStorage {
  private logsMemo: WorkLog[] | null = null;
  private componentsMemo: Component[] | null = null;

  constructor() {
    this.ensureDataDir();
  }

  private async ensureDataDir() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (e) {}
  }

  private async readFile<T>(filePath: string): Promise<T[]> {
    await this.ensureDataDir();
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  private async writeFile<T>(filePath: string, data: T[]) {
    await this.ensureDataDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async getWorkLogs(): Promise<WorkLog[]> {
    if (this.logsMemo) return this.logsMemo;
    this.logsMemo = await this.readFile<WorkLog>(LOGS_FILE);
    return this.logsMemo.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getWorkLog(id: string): Promise<WorkLog | undefined> {
    const logs = await this.getWorkLogs();
    return logs.find(l => l.id === id);
  }

  async createWorkLog(insertLog: InsertWorkLog): Promise<WorkLog> {
    const logs = await this.getWorkLogs();
    const newLog: WorkLog = {
      ...insertLog,
      id: randomUUID(),
      date: insertLog.date || new Date().toISOString(),
      impact: insertLog.impact || "",
      impactLevel: insertLog.impactLevel || "medium",
      component: insertLog.component || "",
      hoursSpent: insertLog.hoursSpent || 0,
      issues: insertLog.issues || "",
      iterations: insertLog.iterations || 0,
      failures: insertLog.failures || "",
      metrics: insertLog.metrics || "",
      images: insertLog.images || [],
    };
    logs.push(newLog);
    this.logsMemo = logs;
    await this.writeFile(LOGS_FILE, logs);
    
    // Also ensure component exists if provided
    if (newLog.component) {
      const components = await this.getComponents();
      if (!components.find(c => c.name.toLowerCase() === newLog.component?.toLowerCase())) {
        await this.createComponent(newLog.component);
      }
    }
    
    return newLog;
  }

  async updateWorkLog(id: string, updates: UpdateWorkLogRequest): Promise<WorkLog> {
    const logs = await this.getWorkLogs();
    const index = logs.findIndex(l => l.id === id);
    if (index === -1) throw new Error("Log not found");
    
    const updatedLog = { ...logs[index], ...updates };
    logs[index] = updatedLog;
    this.logsMemo = logs;
    await this.writeFile(LOGS_FILE, logs);
    return updatedLog;
  }

  async deleteWorkLog(id: string): Promise<void> {
    let logs = await this.getWorkLogs();
    logs = logs.filter(l => l.id !== id);
    this.logsMemo = logs;
    await this.writeFile(LOGS_FILE, logs);
  }

  async getComponents(): Promise<Component[]> {
    if (this.componentsMemo) return this.componentsMemo;
    this.componentsMemo = await this.readFile<Component>(COMPONENTS_FILE);
    return this.componentsMemo.sort((a, b) => a.name.localeCompare(b.name));
  }

  async createComponent(name: string): Promise<Component> {
    const components = await this.getComponents();
    const existing = components.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const newComponent: Component = {
      id: randomUUID(),
      name: name,
    };
    components.push(newComponent);
    this.componentsMemo = components;
    await this.writeFile(COMPONENTS_FILE, components);
    return newComponent;
  }
}

export const storage = new JsonFileStorage();
