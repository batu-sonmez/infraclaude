import { getCoreV1Api } from "../../utils/k8s_client.js";
import { formatTable, formatAge } from "../../utils/formatter.js";

export async function getServices(args: Record<string, unknown>): Promise<string> {
  const api = getCoreV1Api();
  const namespace = (args.namespace as string) || "default";

  const response = await api.listNamespacedService(namespace);
  const services = response.body.items;

  if (services.length === 0) {
    return `No services found in namespace '${namespace}'.`;
  }

  const headers = ["NAME", "TYPE", "CLUSTER-IP", "EXTERNAL-IP", "PORTS", "AGE"];
  const rows = services.map((svc) => {
    const ports = (svc.spec?.ports || [])
      .map((p) => `${p.port}${p.nodePort ? `:${p.nodePort}` : ""}/${p.protocol || "TCP"}`)
      .join(", ");

    return [
      svc.metadata?.name || "unknown",
      svc.spec?.type || "ClusterIP",
      svc.spec?.clusterIP || "None",
      svc.status?.loadBalancer?.ingress?.[0]?.ip || "<none>",
      ports,
      svc.metadata?.creationTimestamp ? formatAge(svc.metadata.creationTimestamp) : "?",
    ];
  });

  return `Services in namespace '${namespace}':\n\n${formatTable(headers, rows)}`;
}

export async function getEndpoints(args: Record<string, unknown>): Promise<string> {
  const api = getCoreV1Api();
  const namespace = (args.namespace as string) || "default";
  const name = args.name as string;

  if (!name) throw new Error("Service name is required");

  const response = await api.readNamespacedEndpoints(name, namespace);
  const endpoints = response.body;

  const lines: string[] = [`Endpoints for service '${name}' in '${namespace}':`];

  for (const subset of endpoints.subsets || []) {
    const addresses = (subset.addresses || []).map((a) => a.ip).join(", ");
    const ports = (subset.ports || []).map((p) => `${p.port}/${p.protocol || "TCP"}`).join(", ");
    lines.push(`  Addresses: ${addresses || "none"}`);
    lines.push(`  Ports:     ${ports || "none"}`);

    const notReady = (subset.notReadyAddresses || []).map((a) => a.ip).join(", ");
    if (notReady) {
      lines.push(`  Not Ready: ${notReady}`);
    }
  }

  if (!endpoints.subsets || endpoints.subsets.length === 0) {
    lines.push("  No endpoints available (no matching pods or pods not ready).");
  }

  return lines.join("\n");
}
