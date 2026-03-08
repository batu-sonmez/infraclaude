import { getCoreV1Api, getAppsV1Api } from "../utils/k8s_client.js";

export function getServiceHealthResource() {
  return [
    {
      uri: "infraclaude://service-health",
      name: "Service Health Status",
      description: "Health status of all services with endpoint readiness and deployment status",
      mimeType: "application/json",
    },
  ];
}

export async function readServiceHealthResource() {
  try {
    const coreApi = getCoreV1Api();
    const appsApi = getAppsV1Api();

    const [servicesRes, deploymentsRes] = await Promise.all([
      coreApi.listServiceForAllNamespaces(),
      appsApi.listDeploymentForAllNamespaces(),
    ]);

    const services = await Promise.all(
      servicesRes.body.items.map(async (svc) => {
        const name = svc.metadata?.name || "unknown";
        const namespace = svc.metadata?.namespace || "default";

        // Find matching deployment
        const deployment = deploymentsRes.body.items.find(
          (d) => d.metadata?.namespace === namespace && d.metadata?.name === name
        );

        // Check endpoints
        let endpointCount = 0;
        try {
          const epRes = await coreApi.readNamespacedEndpoints(name, namespace);
          for (const subset of epRes.body.subsets || []) {
            endpointCount += (subset.addresses || []).length;
          }
        } catch {
          // Endpoints may not exist
        }

        return {
          name,
          namespace,
          type: svc.spec?.type || "ClusterIP",
          clusterIP: svc.spec?.clusterIP,
          endpoints: endpointCount,
          deployment: deployment
            ? {
                ready: deployment.status?.readyReplicas || 0,
                desired: deployment.spec?.replicas || 0,
                upToDate: deployment.status?.updatedReplicas || 0,
              }
            : null,
          healthy: deployment
            ? (deployment.status?.readyReplicas || 0) === (deployment.spec?.replicas || 0)
            : endpointCount > 0,
        };
      })
    );

    return {
      contents: [
        {
          uri: "infraclaude://service-health",
          mimeType: "application/json",
          text: JSON.stringify({ services, timestamp: new Date().toISOString() }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      contents: [
        {
          uri: "infraclaude://service-health",
          mimeType: "application/json",
          text: JSON.stringify({ error: String(error) }),
        },
      ],
    };
  }
}
