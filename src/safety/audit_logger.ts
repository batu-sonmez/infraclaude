import { appendFile, mkdir } from "fs/promises";
import { dirname } from "path";
import config from "../utils/config.js";

export interface AuditEntry {
  timestamp: string;
  tool: string;
  arguments: Record<string, unknown> | undefined;
  status: string;
  message?: string;
}

export class AuditLogger {
  private logPath: string;
  private initialized = false;

  constructor(logPath?: string) {
    this.logPath = logPath || config.auditLogPath;
  }

  private async ensureLogDir(): Promise<void> {
    if (this.initialized) return;
    try {
      await mkdir(dirname(this.logPath), { recursive: true });
      this.initialized = true;
    } catch {
      // Directory may already exist
      this.initialized = true;
    }
  }

  async log(
    tool: string,
    args: Record<string, unknown> | undefined,
    status: string,
    message?: string
  ): Promise<void> {
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      tool,
      arguments: args,
      status,
      message,
    };

    try {
      await this.ensureLogDir();
      await appendFile(this.logPath, JSON.stringify(entry) + "\n", "utf-8");
    } catch {
      // Silently fail — audit logging should not break tool execution
      if (config.logLevel === "debug") {
        console.error(`[audit] Failed to write log entry for ${tool}`);
      }
    }
  }
}
