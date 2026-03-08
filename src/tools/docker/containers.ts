import { getDockerClient } from "../../utils/docker_client.js";
import { formatTable } from "../../utils/formatter.js";

export async function listContainers(args: Record<string, unknown>): Promise<string> {
  const docker = getDockerClient();
  const all = (args.all as boolean) || false;
  const containers = await docker.listContainers({ all });

  if (containers.length === 0) {
    return all ? "No containers found." : "No running containers found.";
  }

  const headers = ["ID", "NAME", "IMAGE", "STATUS", "PORTS"];
  const rows = containers.map((c) => [
    c.Id.substring(0, 12),
    (c.Names?.[0] || "").replace(/^\//, ""),
    c.Image,
    c.Status,
    (c.Ports || []).map((p) =>
      p.PublicPort ? `${p.PublicPort}→${p.PrivatePort}/${p.Type}` : `${p.PrivatePort}/${p.Type}`
    ).join(", "),
  ]);

  return `Containers${all ? " (all)" : " (running)"}:\n\n${formatTable(headers, rows)}`;
}

export async function inspectContainer(args: Record<string, unknown>): Promise<string> {
  const docker = getDockerClient();
  const id = args.id as string || args.name as string;
  if (!id) throw new Error("Container ID or name is required");

  const container = docker.getContainer(id);
  const info = await container.inspect();

  const lines = [
    `Name:       ${info.Name}`,
    `ID:         ${info.Id.substring(0, 12)}`,
    `Image:      ${info.Config.Image}`,
    `Status:     ${info.State.Status}`,
    `Running:    ${info.State.Running}`,
    `PID:        ${info.State.Pid}`,
    `Started:    ${info.State.StartedAt}`,
    `IP:         ${info.NetworkSettings.IPAddress || "N/A"}`,
    "",
    `Command:    ${(info.Config.Cmd || []).join(" ")}`,
  ];

  if (info.HostConfig.Memory) {
    lines.push(`Memory:     ${Math.round(info.HostConfig.Memory / 1024 / 1024)}Mi`);
  }

  const ports = info.NetworkSettings.Ports || {};
  if (Object.keys(ports).length > 0) {
    lines.push("", "Ports:");
    for (const [containerPort, bindings] of Object.entries(ports)) {
      const bindStr = (bindings || []).map((b: { HostIp: string; HostPort: string }) => `${b.HostIp}:${b.HostPort}`).join(", ");
      lines.push(`  ${containerPort} → ${bindStr || "none"}`);
    }
  }

  return lines.join("\n");
}

export async function containerLogs(args: Record<string, unknown>): Promise<string> {
  const docker = getDockerClient();
  const id = args.id as string || args.name as string;
  if (!id) throw new Error("Container ID or name is required");

  const tail = (args.tail as number) || 100;
  const since = args.since as number | undefined;

  const container = docker.getContainer(id);
  const logs = await container.logs({
    stdout: true,
    stderr: true,
    tail,
    since,
    timestamps: true,
  });

  const logStr = typeof logs === "string" ? logs : logs.toString("utf-8");
  if (!logStr.trim()) {
    return `No logs found for container '${id}'.`;
  }

  return `Logs for container '${id}' (last ${tail} lines):\n\n${logStr}`;
}

export async function containerStats(args: Record<string, unknown>): Promise<string> {
  const docker = getDockerClient();
  const id = args.id as string || args.name as string;
  if (!id) throw new Error("Container ID or name is required");

  const container = docker.getContainer(id);
  const stats = await container.stats({ stream: false });

  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
  const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
  const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * 100 : 0;

  const memUsage = stats.memory_stats.usage || 0;
  const memLimit = stats.memory_stats.limit || 1;
  const memPercent = (memUsage / memLimit) * 100;

  const lines = [
    `Stats for container '${id}':`,
    "",
    `  CPU:     ${cpuPercent.toFixed(2)}%`,
    `  Memory:  ${Math.round(memUsage / 1024 / 1024)}Mi / ${Math.round(memLimit / 1024 / 1024)}Mi (${memPercent.toFixed(1)}%)`,
  ];

  const networks = stats.networks || {};
  for (const [iface, net] of Object.entries(networks)) {
    const n = net as { rx_bytes: number; tx_bytes: number };
    lines.push(`  Net ${iface}: RX ${Math.round(n.rx_bytes / 1024)}Ki / TX ${Math.round(n.tx_bytes / 1024)}Ki`);
  }

  return lines.join("\n");
}
