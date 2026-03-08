import { getPods, describePod, deletePod } from "./pods.js";
import { getDeployments, rolloutStatus, rollbackDeployment, scaleDeployment } from "./deployments.js";
import { getPodLogs } from "./logs.js";
import { getEvents } from "./events.js";
import { topPods, topNodes } from "./resources.js";
import { getServices, getEndpoints } from "./services.js";
import { getNodes, describeNode, cordonNode, uncordonNode } from "./nodes.js";

export function registerKubernetesTools() {
  return [
    {
      name: "k8s_get_pods",
      description: "List pods in a Kubernetes namespace with their status, restarts, and age",
      inputSchema: {
        type: "object" as const,
        properties: {
          namespace: { type: "string", description: "Kubernetes namespace (default: 'default')" },
          label_selector: { type: "string", description: "Label selector to filter pods (e.g., 'app=nginx')" },
          field_selector: { type: "string", description: "Field selector (e.g., 'status.phase=Running')" },
        },
      },
    },
    {
      name: "k8s_describe_pod",
      description: "Get detailed information about a specific pod including containers, resources, and events",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: { type: "string", description: "Pod name" },
          namespace: { type: "string", description: "Kubernetes namespace (default: 'default')" },
        },
        required: ["name"],
      },
    },
    {
      name: "k8s_delete_pod",
      description: "Delete a specific pod (it will be recreated if managed by a controller)",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: { type: "string", description: "Pod name" },
          namespace: { type: "string", description: "Kubernetes namespace (default: 'default')" },
        },
        required: ["name"],
      },
    },
    {
      name: "k8s_get_pod_logs",
      description: "Fetch logs from a pod with options for tail lines, time range, and container selection",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: { type: "string", description: "Pod name" },
          namespace: { type: "string", description: "Kubernetes namespace (default: 'default')" },
          container: { type: "string", description: "Container name (for multi-container pods)" },
          tail: { type: "number", description: "Number of lines from the end (default: 100)" },
          since: { type: "string", description: "Time duration (e.g., '5m', '1h', '2d')" },
          previous: { type: "boolean", description: "Get logs from previous container instance" },
        },
        required: ["name"],
      },
    },
    {
      name: "k8s_get_events",
      description: "List cluster events filtered by namespace and type (Normal/Warning)",
      inputSchema: {
        type: "object" as const,
        properties: {
          namespace: { type: "string", description: "Kubernetes namespace (default: 'default')" },
          type: { type: "string", description: "Event type: 'Normal' or 'Warning'" },
          field_selector: { type: "string", description: "Field selector for filtering" },
          limit: { type: "number", description: "Max number of events (default: 50)" },
        },
      },
    },
    {
      name: "k8s_top_pods",
      description: "Show CPU and memory usage for pods (requires metrics-server)",
      inputSchema: {
        type: "object" as const,
        properties: {
          namespace: { type: "string", description: "Kubernetes namespace (default: 'default')" },
        },
      },
    },
    {
      name: "k8s_top_nodes",
      description: "Show CPU and memory usage for all cluster nodes (requires metrics-server)",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "k8s_get_deployments",
      description: "List deployments with replica status, strategy, and age",
      inputSchema: {
        type: "object" as const,
        properties: {
          namespace: { type: "string", description: "Kubernetes namespace (default: 'default')" },
          label_selector: { type: "string", description: "Label selector to filter" },
        },
      },
    },
    {
      name: "k8s_rollout_status",
      description: "Check the rollout status of a deployment",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: { type: "string", description: "Deployment name" },
          namespace: { type: "string", description: "Kubernetes namespace (default: 'default')" },
        },
        required: ["name"],
      },
    },
    {
      name: "k8s_rollback_deployment",
      description: "Rollback a deployment to the previous revision",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: { type: "string", description: "Deployment name" },
          namespace: { type: "string", description: "Kubernetes namespace (default: 'default')" },
        },
        required: ["name"],
      },
    },
    {
      name: "k8s_scale_deployment",
      description: "Scale a deployment to a specified number of replicas",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: { type: "string", description: "Deployment name" },
          namespace: { type: "string", description: "Kubernetes namespace (default: 'default')" },
          replicas: { type: "number", description: "Desired number of replicas" },
        },
        required: ["name", "replicas"],
      },
    },
    {
      name: "k8s_get_services",
      description: "List services with type, cluster IP, ports, and age",
      inputSchema: {
        type: "object" as const,
        properties: {
          namespace: { type: "string", description: "Kubernetes namespace (default: 'default')" },
        },
      },
    },
    {
      name: "k8s_get_nodes",
      description: "List all cluster nodes with status, roles, and version",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "k8s_describe_node",
      description: "Get detailed node info including capacity, allocatable resources, conditions, and taints",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: { type: "string", description: "Node name" },
        },
        required: ["name"],
      },
    },
    {
      name: "k8s_cordon_node",
      description: "Mark a node as unschedulable (cordon) — prevents new pods from being scheduled",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: { type: "string", description: "Node name" },
        },
        required: ["name"],
      },
    },
    {
      name: "k8s_uncordon_node",
      description: "Mark a node as schedulable (uncordon) — re-enables pod scheduling",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: { type: "string", description: "Node name" },
        },
        required: ["name"],
      },
    },
  ];
}

export async function handleKubernetesTool(
  name: string,
  args: Record<string, unknown> | undefined
): Promise<string> {
  const a = args || {};
  switch (name) {
    case "k8s_get_pods": return getPods(a);
    case "k8s_describe_pod": return describePod(a);
    case "k8s_delete_pod": return deletePod(a);
    case "k8s_get_pod_logs": return getPodLogs(a);
    case "k8s_get_events": return getEvents(a);
    case "k8s_top_pods": return topPods(a);
    case "k8s_top_nodes": return topNodes();
    case "k8s_get_deployments": return getDeployments(a);
    case "k8s_rollout_status": return rolloutStatus(a);
    case "k8s_rollback_deployment": return rollbackDeployment(a);
    case "k8s_scale_deployment": return scaleDeployment(a);
    case "k8s_get_services": return getServices(a);
    case "k8s_get_nodes": return getNodes();
    case "k8s_describe_node": return describeNode(a);
    case "k8s_cordon_node": return cordonNode(a);
    case "k8s_uncordon_node": return uncordonNode(a);
    default: throw new Error(`Unknown Kubernetes tool: ${name}`);
  }
}
