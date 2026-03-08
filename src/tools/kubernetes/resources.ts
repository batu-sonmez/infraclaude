import { getMetricsApi } from "../../utils/k8s_client.js";
import { formatTable } from "../../utils/formatter.js";

interface MetricsItem {
  metadata: { name: string; namespace?: string };
  containers?: Array<{
    name: string;
    usage: { cpu: string; memory: string };
  }>;
  usage?: { cpu: string; memory: string };
}

export async function topPods(args: Record<string, unknown>): Promise<string> {
  const api = getMetricsApi();
  const namespace = (args.namespace as string) || "default";

  const response = await api.listNamespacedCustomObject(
    "metrics.k8s.io",
    "v1beta1",
    namespace,
    "pods"
  );

  const body = response.body as { items: MetricsItem[] };
  const items = body.items || [];

  if (items.length === 0) {
    return `No metrics available for pods in namespace '${namespace}'. Is metrics-server installed?`;
  }

  const headers = ["POD", "CONTAINER", "CPU", "MEMORY"];
  const rows: string[][] = [];

  for (const item of items) {
    for (const container of item.containers || []) {
      rows.push([
        item.metadata.name,
        container.name,
        container.usage.cpu,
        container.usage.memory,
      ]);
    }
  }

  return `Resource usage for pods in namespace '${namespace}':\n\n${formatTable(headers, rows)}`;
}

export async function topNodes(): Promise<string> {
  const api = getMetricsApi();

  const response = await api.listClusterCustomObject(
    "metrics.k8s.io",
    "v1beta1",
    "nodes"
  );

  const body = response.body as { items: MetricsItem[] };
  const items = body.items || [];

  if (items.length === 0) {
    return "No metrics available for nodes. Is metrics-server installed?";
  }

  const headers = ["NODE", "CPU", "MEMORY"];
  const rows = items.map((item) => [
    item.metadata.name,
    item.usage?.cpu || "N/A",
    item.usage?.memory || "N/A",
  ]);

  return `Node resource usage:\n\n${formatTable(headers, rows)}`;
}
