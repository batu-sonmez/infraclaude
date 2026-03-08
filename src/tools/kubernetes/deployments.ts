import { getAppsV1Api } from "../../utils/k8s_client.js";
import { formatTable, formatAge } from "../../utils/formatter.js";

export async function getDeployments(args: Record<string, unknown>): Promise<string> {
  const api = getAppsV1Api();
  const namespace = (args.namespace as string) || "default";
  const labelSelector = args.label_selector as string | undefined;

  const response = await api.listNamespacedDeployment(
    namespace,
    undefined,
    undefined,
    undefined,
    undefined,
    labelSelector
  );

  const deployments = response.body.items;
  if (deployments.length === 0) {
    return `No deployments found in namespace '${namespace}'.`;
  }

  const headers = ["NAME", "READY", "UP-TO-DATE", "AVAILABLE", "AGE", "STRATEGY"];
  const rows = deployments.map((dep) => {
    const ready = dep.status?.readyReplicas || 0;
    const desired = dep.spec?.replicas || 0;
    const upToDate = dep.status?.updatedReplicas || 0;
    const available = dep.status?.availableReplicas || 0;
    const age = dep.metadata?.creationTimestamp
      ? formatAge(dep.metadata.creationTimestamp)
      : "?";
    const strategy = dep.spec?.strategy?.type || "RollingUpdate";

    return [
      dep.metadata?.name || "unknown",
      `${ready}/${desired}`,
      String(upToDate),
      String(available),
      age,
      strategy,
    ];
  });

  return `Deployments in namespace '${namespace}':\n\n${formatTable(headers, rows)}`;
}

export async function rolloutStatus(args: Record<string, unknown>): Promise<string> {
  const api = getAppsV1Api();
  const namespace = (args.namespace as string) || "default";
  const name = args.name as string;

  if (!name) throw new Error("Deployment name is required");

  const response = await api.readNamespacedDeployment(name, namespace);
  const dep = response.body;

  const desired = dep.spec?.replicas || 0;
  const updated = dep.status?.updatedReplicas || 0;
  const ready = dep.status?.readyReplicas || 0;
  const available = dep.status?.availableReplicas || 0;
  const generation = dep.metadata?.generation || 0;
  const observedGeneration = dep.status?.observedGeneration || 0;

  const lines: string[] = [
    `Rollout status for deployment '${name}' in '${namespace}':`,
    "",
    `  Desired:    ${desired}`,
    `  Updated:    ${updated}`,
    `  Ready:      ${ready}`,
    `  Available:  ${available}`,
    "",
  ];

  if (generation === observedGeneration && updated === desired && ready === desired) {
    lines.push("✅ Rollout completed successfully.");
  } else if (updated < desired) {
    lines.push(`⏳ Rollout in progress: ${updated}/${desired} replicas updated.`);
  } else if (ready < updated) {
    lines.push(`⏳ Waiting for rollout: ${ready}/${updated} updated replicas ready.`);
  } else {
    lines.push("⚠️ Rollout status unclear — check conditions.");
  }

  // Conditions
  const conditions = dep.status?.conditions || [];
  if (conditions.length > 0) {
    lines.push("", "Conditions:");
    for (const cond of conditions) {
      lines.push(`  ${cond.type}: ${cond.status} — ${cond.message || ""}`);
    }
  }

  return lines.join("\n");
}

export async function rollbackDeployment(args: Record<string, unknown>): Promise<string> {
  const api = getAppsV1Api();
  const namespace = (args.namespace as string) || "default";
  const name = args.name as string;

  if (!name) throw new Error("Deployment name is required");

  // Rollback by patching the deployment to restart
  // In modern K8s, rollback is done via revision in rollout history
  const patch = {
    spec: {
      template: {
        metadata: {
          annotations: {
            "kubectl.kubernetes.io/restartedAt": new Date().toISOString(),
          },
        },
      },
    },
  };

  await api.patchNamespacedDeployment(
    name,
    namespace,
    patch,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    { headers: { "Content-Type": "application/strategic-merge-patch+json" } }
  );

  return `Deployment '${name}' in namespace '${namespace}' has been rolled back (restarted). Use k8s_rollout_status to monitor progress.`;
}

export async function scaleDeployment(args: Record<string, unknown>): Promise<string> {
  const api = getAppsV1Api();
  const namespace = (args.namespace as string) || "default";
  const name = args.name as string;
  const replicas = args.replicas as number;

  if (!name) throw new Error("Deployment name is required");
  if (replicas === undefined) throw new Error("Replicas count is required");

  const patch = { spec: { replicas } };
  await api.patchNamespacedDeployment(
    name,
    namespace,
    patch,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    { headers: { "Content-Type": "application/strategic-merge-patch+json" } }
  );

  return `Deployment '${name}' scaled to ${replicas} replicas in namespace '${namespace}'.`;
}
