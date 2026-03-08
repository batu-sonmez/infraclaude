import { getDockerClient } from "../../utils/docker_client.js";
import { formatTable } from "../../utils/formatter.js";

export async function listNetworks(): Promise<string> {
  const docker = getDockerClient();
  const networks = await docker.listNetworks();

  if (networks.length === 0) {
    return "No Docker networks found.";
  }

  const headers = ["NAME", "ID", "DRIVER", "SCOPE"];
  const rows = networks.map((n) => [
    n.Name,
    n.Id.substring(0, 12),
    n.Driver || "N/A",
    n.Scope || "N/A",
  ]);

  return `Docker networks:\n\n${formatTable(headers, rows)}`;
}

export async function inspectNetwork(args: Record<string, unknown>): Promise<string> {
  const docker = getDockerClient();
  const id = args.id as string || args.name as string;
  if (!id) throw new Error("Network ID or name is required");

  const network = docker.getNetwork(id);
  const info = await network.inspect();

  const lines = [
    `Name:     ${info.Name}`,
    `ID:       ${info.Id.substring(0, 12)}`,
    `Driver:   ${info.Driver}`,
    `Scope:    ${info.Scope}`,
    `Internal: ${info.Internal || false}`,
    `IPAM:     ${info.IPAM?.Driver || "default"}`,
  ];

  const subnet = info.IPAM?.Config?.[0]?.Subnet;
  if (subnet) lines.push(`Subnet:   ${subnet}`);

  const containers = info.Containers || {};
  const containerNames = Object.values(containers).map((c: any) => c.Name);
  if (containerNames.length > 0) {
    lines.push("", `Containers (${containerNames.length}):`);
    for (const name of containerNames) {
      lines.push(`  - ${name}`);
    }
  }

  return lines.join("\n");
}
