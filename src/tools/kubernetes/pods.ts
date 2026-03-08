import { getCoreV1Api } from "../../utils/k8s_client.js";
import { formatTable, formatAge } from "../../utils/formatter.js";

export async function getPods(args: Record<string, unknown>): Promise<string> {
  const api = getCoreV1Api();
  const namespace = (args.namespace as string) || "default";
  const labelSelector = args.label_selector as string | undefined;
  const fieldSelector = args.field_selector as string | undefined;

  const response = await api.listNamespacedPod(
    namespace,
    undefined,
    undefined,
    undefined,
    fieldSelector,
    labelSelector
  );

  const pods = response.body.items;
  if (pods.length === 0) {
    return `No pods found in namespace '${namespace}'${labelSelector ? ` with selector '${labelSelector}'` : ""}.`;
  }

  const headers = ["NAME", "READY", "STATUS", "RESTARTS", "AGE"];
  const rows = pods.map((pod) => {
    const containers = pod.status?.containerStatuses || [];
    const ready = containers.filter((c) => c.ready).length;
    const total = containers.length || pod.spec?.containers.length || 0;
    const restarts = containers.reduce((sum, c) => sum + (c.restartCount || 0), 0);
    const status = pod.status?.phase || "Unknown";
    const age = pod.metadata?.creationTimestamp
      ? formatAge(pod.metadata.creationTimestamp)
      : "?";

    return [
      pod.metadata?.name || "unknown",
      `${ready}/${total}`,
      status,
      String(restarts),
      age,
    ];
  });

  return `Pods in namespace '${namespace}':\n\n${formatTable(headers, rows)}`;
}

export async function describePod(args: Record<string, unknown>): Promise<string> {
  const api = getCoreV1Api();
  const namespace = (args.namespace as string) || "default";
  const name = args.name as string;

  if (!name) throw new Error("Pod name is required");

  const response = await api.readNamespacedPod(name, namespace);
  const pod = response.body;

  const lines: string[] = [
    `Name:         ${pod.metadata?.name}`,
    `Namespace:    ${pod.metadata?.namespace}`,
    `Node:         ${pod.spec?.nodeName || "N/A"}`,
    `Status:       ${pod.status?.phase}`,
    `IP:           ${pod.status?.podIP || "N/A"}`,
    `Labels:       ${pod.metadata?.labels ? Object.entries(pod.metadata.labels).map(([k, v]) => `${k}=${v}`).join(", ") : "none"}`,
    "",
    "Containers:",
  ];

  for (const container of pod.spec?.containers || []) {
    const status = pod.status?.containerStatuses?.find((s) => s.name === container.name);
    lines.push(`  ${container.name}:`);
    lines.push(`    Image:    ${container.image}`);
    lines.push(`    Ready:    ${status?.ready ?? "unknown"}`);
    lines.push(`    Restarts: ${status?.restartCount ?? 0}`);

    if (container.resources?.limits) {
      lines.push(`    Limits:   CPU=${container.resources.limits.cpu || "none"}, Mem=${container.resources.limits.memory || "none"}`);
    }
    if (container.resources?.requests) {
      lines.push(`    Requests: CPU=${container.resources.requests.cpu || "none"}, Mem=${container.resources.requests.memory || "none"}`);
    }
  }

  // Events
  const events = await api.listNamespacedEvent(
    namespace,
    undefined,
    undefined,
    undefined,
    `involvedObject.name=${name}`
  );

  if (events.body.items.length > 0) {
    lines.push("", "Events:");
    const eventHeaders = ["TYPE", "REASON", "AGE", "MESSAGE"];
    const eventRows = events.body.items
      .sort((a, b) => {
        const aTime = a.lastTimestamp || a.metadata?.creationTimestamp;
        const bTime = b.lastTimestamp || b.metadata?.creationTimestamp;
        return new Date(bTime || 0).getTime() - new Date(aTime || 0).getTime();
      })
      .slice(0, 10)
      .map((e) => [
        e.type || "Normal",
        e.reason || "",
        e.lastTimestamp ? formatAge(e.lastTimestamp) : "?",
        e.message || "",
      ]);
    lines.push(formatTable(eventHeaders, eventRows));
  }

  return lines.join("\n");
}

export async function deletePod(args: Record<string, unknown>): Promise<string> {
  const api = getCoreV1Api();
  const namespace = (args.namespace as string) || "default";
  const name = args.name as string;

  if (!name) throw new Error("Pod name is required");

  await api.deleteNamespacedPod(name, namespace);
  return `Pod '${name}' in namespace '${namespace}' has been deleted.`;
}
