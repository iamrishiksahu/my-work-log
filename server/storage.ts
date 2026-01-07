import { WorkLog, InsertWorkLog, UpdateWorkLogRequest, Component, InsertComponent } from "@shared/schema";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export interface IStorage {
  getWorkLogs(): Promise<WorkLog[]>;
  getWorkLog(id: string): Promise<WorkLog | undefined>;
  createWorkLog(log: InsertWorkLog): Promise<WorkLog>;
  updateWorkLog(id: string, updates: UpdateWorkLogRequest): Promise<WorkLog>;
  deleteWorkLog(id: string): Promise<void>;
  
  getComponents(): Promise<Component[]>;
  createComponent(component: InsertComponent): Promise<Component>;
}

const DATA_DIR = "data";
const DATA_FILE = path.join(DATA_DIR, "worklogs.json");
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

  private normalizeLog(log: any): WorkLog {
    return {
      id: log.id || randomUUID(),
      date: log.date || new Date().toISOString(),
      title: log.title || "",
      description: log.description || "",
      impact: log.impact ?? "",
      jira: log.jira ?? "",
      type: log.type ?? "task",
      impactLevel: log.impactLevel ?? "medium",
      component: log.component ?? "",
      hoursSpent: typeof log.hoursSpent === "number" ? log.hoursSpent : Number(log.hoursSpent) || 0,
      issues: log.issues ?? "",
      iterations: typeof log.iterations === "number" ? log.iterations : Number(log.iterations) || 0,
      failures: log.failures ?? "",
      metrics: log.metrics ?? "",
      images: Array.isArray(log.images) ? log.images : [],
    };
  }

  private async readLogs(): Promise<WorkLog[]> {
    if (this.logsMemo) return this.logsMemo;
    await this.ensureDataDir();
    try {
      const data = await fs.readFile(DATA_FILE, "utf-8");
      const parsed = JSON.parse(data);
      const normalized = Array.isArray(parsed) ? parsed.map((log) => this.normalizeLog(log)) : [];
      const changed = JSON.stringify(parsed) !== JSON.stringify(normalized);
      this.logsMemo = normalized;
      if (changed) {
        await this.writeLogs(normalized);
      }
      return this.logsMemo!;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        this.logsMemo = [];
        return [];
      }
      throw error;
    }
  }

  private async readComponents(): Promise<Component[]> {
    if (this.componentsMemo) return this.componentsMemo;
    await this.ensureDataDir();
    try {
      const data = await fs.readFile(COMPONENTS_FILE, "utf-8");
      this.componentsMemo = JSON.parse(data);
      return this.componentsMemo!;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        this.componentsMemo = [];
        return [];
      }
      throw error;
    }
  }

  private async writeLogs(data: WorkLog[]) {
    this.logsMemo = data;
    await this.ensureDataDir();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  }

  private async writeComponents(data: Component[]) {
    this.componentsMemo = data;
    await this.ensureDataDir();
    await fs.writeFile(COMPONENTS_FILE, JSON.stringify(data, null, 2));
  }

  async getWorkLogs(): Promise<WorkLog[]> {
    const logs = await this.readLogs();
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getWorkLog(id: string): Promise<WorkLog | undefined> {
    const logs = await this.readLogs();
    return logs.find(l => l.id === id);
  }

  async createWorkLog(insertLog: InsertWorkLog): Promise<WorkLog> {
    const logs = await this.readLogs();
    const newLog: WorkLog = {
      ...insertLog,
      id: randomUUID(),
      date: insertLog.date || new Date().toISOString(),
      impact: insertLog.impact || "",
      jira: insertLog.jira || "",
      type: insertLog.type || "task",
      impactLevel: insertLog.impactLevel || "medium",
      component: insertLog.component || "",
      hoursSpent: insertLog.hoursSpent || 0,
      issues: insertLog.issues || "",
      iterations: insertLog.iterations || 0,
      failures: insertLog.failures || "",
      metrics: insertLog.metrics || "",
      images: insertLog.images || [],
    };
    if (newLog.component) {
      await this.createComponent({ name: newLog.component });
    }
    logs.push(newLog);
    await this.writeLogs(logs);
    return newLog;
  }

  async updateWorkLog(id: string, updates: UpdateWorkLogRequest): Promise<WorkLog> {
    const logs = await this.readLogs();
    const index = logs.findIndex(l => l.id === id);
    if (index === -1) throw new Error("Log not found");
    
    const updatedLog = { ...logs[index], ...updates };
    if (updatedLog.component) {
      await this.createComponent({ name: updatedLog.component });
    }
    logs[index] = updatedLog;
    await this.writeLogs(logs);
    return updatedLog;
  }

  async deleteWorkLog(id: string): Promise<void> {
    let logs = await this.readLogs();
    logs = logs.filter(l => l.id !== id);
    await this.writeLogs(logs);
  }

  async getComponents(): Promise<Component[]> {
    return await this.readComponents();
  }

  async createComponent(insertComponent: InsertComponent): Promise<Component> {
    const components = await this.readComponents();
    if (components.find(c => c.name === insertComponent.name)) {
      return components.find(c => c.name === insertComponent.name)!;
    }
    const newComponent: Component = {
      ...insertComponent,
      id: randomUUID(),
    };
    components.push(newComponent);
    await this.writeComponents(components);
    return newComponent;
  }
}

export const storage = new JsonFileStorage();
