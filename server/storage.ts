import { WorkLog, InsertWorkLog, UpdateWorkLogRequest } from "@shared/schema";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export interface IStorage {
  getWorkLogs(): Promise<WorkLog[]>;
  getWorkLog(id: string): Promise<WorkLog | undefined>;
  createWorkLog(log: InsertWorkLog): Promise<WorkLog>;
  updateWorkLog(id: string, updates: UpdateWorkLogRequest): Promise<WorkLog>;
  deleteWorkLog(id: string): Promise<void>;
}

const DATA_DIR = "data";
const DATA_FILE = path.join(DATA_DIR, "worklogs.json");

export class JsonFileStorage implements IStorage {
  private memo: WorkLog[] | null = null;

  constructor() {
    this.ensureDataDir();
  }

  private async ensureDataDir() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (e) {}
  }

  private async readData(): Promise<WorkLog[]> {
    if (this.memo) return this.memo;
    await this.ensureDataDir();
    try {
      const data = await fs.readFile(DATA_FILE, "utf-8");
      this.memo = JSON.parse(data);
      return this.memo!;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        this.memo = [];
        return [];
      }
      throw error;
    }
  }

  private async writeData(data: WorkLog[]) {
    this.memo = data;
    await this.ensureDataDir();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  }

  async getWorkLogs(): Promise<WorkLog[]> {
    const logs = await this.readData();
    // Sort by date descending
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getWorkLog(id: string): Promise<WorkLog | undefined> {
    const logs = await this.readData();
    return logs.find(l => l.id === id);
  }

  async createWorkLog(insertLog: InsertWorkLog): Promise<WorkLog> {
    const logs = await this.readData();
    const newLog: WorkLog = {
      ...insertLog,
      id: randomUUID(),
      date: insertLog.date || new Date().toISOString(),
      impact: insertLog.impact || "",
      hoursSpent: insertLog.hoursSpent || 0,
      issues: insertLog.issues || "",
      iterations: insertLog.iterations || 0,
      failures: insertLog.failures || "",
      metrics: insertLog.metrics || "",
      images: insertLog.images || [],
    };
    logs.push(newLog);
    await this.writeData(logs);
    return newLog;
  }

  async updateWorkLog(id: string, updates: UpdateWorkLogRequest): Promise<WorkLog> {
    const logs = await this.readData();
    const index = logs.findIndex(l => l.id === id);
    if (index === -1) throw new Error("Log not found");
    
    const updatedLog = { ...logs[index], ...updates };
    logs[index] = updatedLog;
    await this.writeData(logs);
    return updatedLog;
  }

  async deleteWorkLog(id: string): Promise<void> {
    let logs = await this.readData();
    logs = logs.filter(l => l.id !== id);
    await this.writeData(logs);
  }
}

export const storage = new JsonFileStorage();
