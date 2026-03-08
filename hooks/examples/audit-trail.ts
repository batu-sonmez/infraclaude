/**
 * Claude Code Hook: Audit trail for all infrastructure operations
 *
 * Logs every InfraClaude tool invocation to a local audit file
 * for compliance and debugging purposes.
 */

import { appendFileSync, mkdirSync } from "fs";
import { join } from "path";

const input = await readStdin();
const data = JSON.parse(input);

const logDir = join(process.env.HOME || "~", ".infraclaude");
const logFile = join(logDir, "audit.log");

try {
  mkdirSync(logDir, { recursive: true });
} catch {
  // Already exists
}

const entry = {
  timestamp: new Date().toISOString(),
  tool: data.tool_name || "unknown",
  input: data.tool_input || {},
  user: process.env.USER || process.env.USERNAME || "unknown",
  pid: process.pid,
};

try {
  appendFileSync(logFile, JSON.stringify(entry) + "\n");
} catch {
  // Silently fail — should not disrupt tool execution
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}
