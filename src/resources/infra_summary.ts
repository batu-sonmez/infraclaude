import { getCoreV1Api, getAppsV1Api, getCurrentContext } from "../utils/k8s_client.js";
import config from "../utils/config.js";

export function getInfraSummaryResource() {
  return [
    {
      uri: "infraclaude://infra-summary",
      name: "Infrastructure Summary",
      description: "Full infrastructure summary: K8s cluster, Docker, Prometheus status",
      mimeType: "application/json",
    },
  ];
}

export async function readInfraSummaryResource() {
  const summary: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    context: getCurrentContext(),
  };

  // Kubernetes summary
  try {
    const coreApi = getCoreV1Api();
    const appsApi = getAppsV1Api();

    const [nodes, pods, deployments, services] = await Promise.all([
      coreApi.listNode(),
      coreApi.listPodForAllNamespaces(),
      appsApi.listDeploymentForAllNamespaces(),
      coreApi.listServiceForAllNamespaces(),
    ]);

    const unhealthyPods = pods.body.items.filter(
      (p) => p.status?.phase !== "Running" && p.status?.phase !== "Succeeded"
    );

    const crashlooping = pods.body.items.filter((p) =>
      (p.status?.containerStatuses || []).some((c) => c.restartCount > 5)
    );

    summary.kubernetes = {
      nodes: nodes.body.items.length,
      nodesReady: nodes.body.items.filter((n) =>
        n.status?.conditions?.some((c) => c.type === "Ready" && c.status === "True")
      ).length,
      totalPods: pods.body.items.length,
      unhealthyPods: unhealthyPods.length,
      crashloopingPods: crashlooping.map((p) => ({
        name: p.metadata?.name,
        namespace: p.metadata?.namespace,
      })),
      deployments: deployments.body.items.length,
      services: services.body.items.length,
    };
  } catch (error) {
    summary.kubernetes = { error: String(error) };
  }

  // Prometheus status
  try {
    const res = await fetch(`${config.prometheusUrl}/api/v1/status/runtimeinfo`);
    if (res.ok) {
      const data = (await res.json()) as { data: unknown };
      summary.prometheus = { status: "up", info: data.data };
    } else {
      summary.prometheus = { status: "error", code: res.status };
    }
  } catch {
    summary.prometheus = { status: "unreachable" };
  }

  return {
    contents: [
      {
        uri: "infraclaude://infra-summary",
        mimeType: "application/json",
        text: JSON.stringify(summary, null, 2),
      },
    ],
  };
}
