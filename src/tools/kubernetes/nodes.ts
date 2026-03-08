import { getCoreV1Api } from "../../utils/k8s_client.js";
import { formatTable, formatAge } from "../../utils/formatter.js";

export async function getNodes(): Promise<string> {
  const api = getCoreV1Api();
  const response = await api.listNode();
  const nodes = response.body.items;

  if (nodes.length === 0) {
    return "No nodes found in the cluster.";
  }

  const headers = ["NAME", "STATUS", "ROLES", "AGE", "VERSION"];
  const rows = nodes.map((node) => {
    const conditions = node.status?.conditions || [];
    const readyCond = conditions.find((c) => c.type === "Ready");
    const status = readyCond?.status === "True" ? "Ready" : "NotReady";

    const roles = Object.keys(node.metadata?.labels || {})
      .filter((l) => l.startsWith("node-role.kubernetes.io/"))
      .map((l) => l.replace("node-role.kubernetes.io/", ""))
      .join(",") || "<none>";

    // Check for taints that indicate scheduling issues
    const unschedulable = node.spec?.unschedulable ? ",SchedulingDisabled" : "";

    return [
      node.metadata?.name || "unknown",
      status + unschedulable,
      roles,
      node.metadata?.creationTimestamp ? formatAge(node.metadata.creationTimestamp) : "?",
      node.status?.nodeInfo?.kubeletVersion || "?",
    ];
  });

  return `Cluster nodes:\n\n${formatTable(headers, rows)}`;
}

export async function describeNode(args: Record<string, unknown>): Promise<string> {
  const api = getCoreV1Api();
  const name = args.name as string;

  if (!name) throw new Error("Node name is required");

  const response = await api.readNode(name);
  const node = response.body;

  const allocatable = node.status?.allocatable || {};
  const capacity = node.status?.capacity || {};

  const lines: string[] = [
    `Name:         ${node.metadata?.name}`,
    `OS:           ${node.status?.nodeInfo?.osImage || "?"}`,
    `Kernel:       ${node.status?.nodeInfo?.kernelVersion || "?"}`,
    `Runtime:      ${node.status?.nodeInfo?.containerRuntimeVersion || "?"}`,
    `Kubelet:      ${node.status?.nodeInfo?.kubeletVersion || "?"}`,
    "",
    "Capacity:",
    `  CPU:         ${capacity.cpu || "?"}`,
    `  Memory:      ${capacity.memory || "?"}`,
    `  Pods:        ${capacity.pods || "?"}`,
    "",
    "Allocatable:",
    `  CPU:         ${allocatable.cpu || "?"}`,
    `  Memory:      ${allocatable.memory || "?"}`,
    `  Pods:        ${allocatable.pods || "?"}`,
    "",
    "Conditions:",
  ];

  for (const cond of node.status?.conditions || []) {
    lines.push(`  ${cond.type}: ${cond.status} — ${cond.message || ""}`);
  }

  const taints = node.spec?.taints || [];
  if (taints.length > 0) {
    lines.push("", "Taints:");
    for (const taint of taints) {
      lines.push(`  ${taint.key}=${taint.value || ""}:${taint.effect}`);
    }
  }

  return lines.join("\n");
}

export async function cordonNode(args: Record<string, unknown>): Promise<string> {
  const api = getCoreV1Api();
  const name = args.name as string;
  if (!name) throw new Error("Node name is required");

  await api.patchNode(
    name,
    { spec: { unschedulable: true } },
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    { headers: { "Content-Type": "application/strategic-merge-patch+json" } }
  );

  return `Node '${name}' cordoned — no new pods will be scheduled on this node.`;
}

export async function uncordonNode(args: Record<string, unknown>): Promise<string> {
  const api = getCoreV1Api();
  const name = args.name as string;
  if (!name) throw new Error("Node name is required");

  await api.patchNode(
    name,
    { spec: { unschedulable: false } },
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    { headers: { "Content-Type": "application/strategic-merge-patch+json" } }
  );

  return `Node '${name}' uncordoned — scheduling is re-enabled.`;
}
