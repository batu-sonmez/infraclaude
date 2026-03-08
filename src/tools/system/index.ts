import { diskUsage } from "./disk.js";
import { listProcesses } from "./processes.js";
import { networkConnections } from "./network.js";
import { systemLogs } from "./logs.js";

export function registerSystemTools() {
  return [
    {
      name: "system_disk_usage",
      description: "Show disk usage for the system or a specific path",
      inputSchema: {
        type: "object" as const,
        properties: {
          path: { type: "string", description: "Specific path to check (optional, shows all filesystems if omitted)" },
        },
      },
    },
    {
      name: "system_processes",
      description: "List top processes sorted by CPU or memory usage",
      inputSchema: {
        type: "object" as const,
        properties: {
          sort_by: { type: "string", description: "'cpu' or 'memory' (default: 'memory')" },
          limit: { type: "number", description: "Number of processes to show (default: 20)" },
        },
      },
    },
    {
      name: "system_network_connections",
      description: "Show active network connections and listening ports",
      inputSchema: {
        type: "object" as const,
        properties: {
          state: { type: "string", description: "Filter by connection state (e.g., 'listening')" },
        },
      },
    },
    {
      name: "system_logs",
      description: "Read system logs from journalctl or a log file",
      inputSchema: {
        type: "object" as const,
        properties: {
          unit: { type: "string", description: "Systemd unit name (e.g., 'nginx', 'docker')" },
          lines: { type: "number", description: "Number of lines to show (default: 50)" },
          path: { type: "string", description: "Path to a log file (alternative to journalctl)" },
        },
      },
    },
  ];
}

export async function handleSystemTool(
  name: string,
  args: Record<string, unknown> | undefined
): Promise<string> {
  const a = args || {};
  switch (name) {
    case "system_disk_usage": return diskUsage(a);
    case "system_processes": return listProcesses(a);
    case "system_network_connections": return networkConnections(a);
    case "system_logs": return systemLogs(a);
    default: throw new Error(`Unknown system tool: ${name}`);
  }
}
