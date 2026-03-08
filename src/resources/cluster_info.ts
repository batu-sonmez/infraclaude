import { getCoreV1Api, getCurrentContext, getClusterName } from "../utils/k8s_client.js";

export function getResources() {
  return [
    {
      uri: "infraclaude://cluster-info",
      name: "Kubernetes Cluster Info",
      description: "Current cluster overview: context, nodes, namespaces, running pods count",
      mimeType: "application/json",
    },
  ];
}

export async function readResource() {
  try {
    const api = getCoreV1Api();

    const [nodesRes, namespacesRes, podsRes] = await Promise.all([
      api.listNode(),
      api.listNamespace(),
      api.listPodForAllNamespaces(),
    ]);

    const nodes = nodesRes.body.items.map((n) => ({
      name: n.metadata?.name,
      status: n.status?.conditions?.find((c) => c.type === "Ready")?.status === "True" ? "Ready" : "NotReady",
      version: n.status?.nodeInfo?.kubeletVersion,
    }));

    const namespaces = namespacesRes.body.items.map((ns) => ns.metadata?.name).filter(Boolean);

    const pods = podsRes.body.items;
    const podsByPhase: Record<string, number> = {};
    for (const pod of pods) {
      const phase = pod.status?.phase || "Unknown";
      podsByPhase[phase] = (podsByPhase[phase] || 0) + 1;
    }

    const data = {
      context: getCurrentContext(),
      cluster: getClusterName(),
      nodes,
      nodeCount: nodes.length,
      namespaces,
      namespaceCount: namespaces.length,
      totalPods: pods.length,
      podsByPhase,
    };

    return {
      contents: [
        {
          uri: "infraclaude://cluster-info",
          mimeType: "application/json",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      contents: [
        {
          uri: "infraclaude://cluster-info",
          mimeType: "application/json",
          text: JSON.stringify({
            error: `Failed to fetch cluster info: ${error instanceof Error ? error.message : String(error)}`,
          }),
        },
      ],
    };
  }
}
