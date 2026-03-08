import { listContainers, inspectContainer, containerLogs, containerStats } from "./containers.js";
import { listImages, inspectImage } from "./images.js";
import { composePs, composeLogs } from "./compose.js";
import { listNetworks, inspectNetwork } from "./networks.js";

export function registerDockerTools() {
  return [
    {
      name: "docker_list_containers",
      description: "List Docker containers with their status, image, and ports",
      inputSchema: {
        type: "object" as const,
        properties: {
          all: { type: "boolean", description: "Show all containers (default: only running)" },
        },
      },
    },
    {
      name: "docker_inspect_container",
      description: "Get detailed information about a Docker container",
      inputSchema: {
        type: "object" as const,
        properties: {
          id: { type: "string", description: "Container ID or name" },
        },
        required: ["id"],
      },
    },
    {
      name: "docker_container_logs",
      description: "Fetch logs from a Docker container",
      inputSchema: {
        type: "object" as const,
        properties: {
          id: { type: "string", description: "Container ID or name" },
          tail: { type: "number", description: "Number of lines from end (default: 100)" },
          since: { type: "number", description: "Unix timestamp to start from" },
        },
        required: ["id"],
      },
    },
    {
      name: "docker_container_stats",
      description: "Get real-time CPU, memory, and network stats for a container",
      inputSchema: {
        type: "object" as const,
        properties: {
          id: { type: "string", description: "Container ID or name" },
        },
        required: ["id"],
      },
    },
    {
      name: "docker_list_images",
      description: "List local Docker images with repository, tag, and size",
      inputSchema: {
        type: "object" as const,
        properties: {
          all: { type: "boolean", description: "Show all images including intermediate" },
        },
      },
    },
    {
      name: "docker_inspect_image",
      description: "Get detailed information about a Docker image",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: { type: "string", description: "Image name or ID" },
        },
        required: ["name"],
      },
    },
    {
      name: "docker_compose_ps",
      description: "Show status of Docker Compose services",
      inputSchema: {
        type: "object" as const,
        properties: {
          directory: { type: "string", description: "Directory containing docker-compose.yml" },
        },
      },
    },
    {
      name: "docker_compose_logs",
      description: "Show logs from Docker Compose services",
      inputSchema: {
        type: "object" as const,
        properties: {
          directory: { type: "string", description: "Directory containing docker-compose.yml" },
          service: { type: "string", description: "Specific service name" },
          tail: { type: "number", description: "Number of lines (default: 100)" },
        },
      },
    },
    {
      name: "docker_list_networks",
      description: "List Docker networks with driver and scope",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "docker_inspect_network",
      description: "Get detailed info about a Docker network including connected containers",
      inputSchema: {
        type: "object" as const,
        properties: {
          id: { type: "string", description: "Network ID or name" },
        },
        required: ["id"],
      },
    },
  ];
}

export async function handleDockerTool(
  name: string,
  args: Record<string, unknown> | undefined
): Promise<string> {
  const a = args || {};
  switch (name) {
    case "docker_list_containers": return listContainers(a);
    case "docker_inspect_container": return inspectContainer(a);
    case "docker_container_logs": return containerLogs(a);
    case "docker_container_stats": return containerStats(a);
    case "docker_list_images": return listImages(a);
    case "docker_inspect_image": return inspectImage(a);
    case "docker_compose_ps": return composePs(a);
    case "docker_compose_logs": return composeLogs(a);
    case "docker_list_networks": return listNetworks();
    case "docker_inspect_network": return inspectNetwork(a);
    default: throw new Error(`Unknown Docker tool: ${name}`);
  }
}
