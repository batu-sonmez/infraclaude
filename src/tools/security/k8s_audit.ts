import { getCoreV1Api } from "../../utils/k8s_client.js";

interface AuditFinding {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: string;
  resource: string;
  issue: string;
  recommendation: string;
}

export async function k8sSecurityAudit(args: Record<string, unknown>): Promise<string> {
  const api = getCoreV1Api();
  const namespace = (args.namespace as string) || "default";

  const findings: AuditFinding[] = [];

  // Get pods for security analysis
  const podsRes = await api.listNamespacedPod(namespace);
  const pods = podsRes.body.items;

  for (const pod of pods) {
    const podName = pod.metadata?.name || "unknown";

    for (const container of pod.spec?.containers || []) {
      const sc = container.securityContext || {};
      const podSc = pod.spec?.securityContext || {};

      // Check: Running as root
      if (sc.runAsNonRoot !== true && podSc.runAsNonRoot !== true) {
        findings.push({
          severity: "HIGH",
          category: "Pod Security",
          resource: `${podName}/${container.name}`,
          issue: "Container may run as root",
          recommendation: "Set securityContext.runAsNonRoot: true",
        });
      }

      // Check: Privileged container
      if (sc.privileged === true) {
        findings.push({
          severity: "CRITICAL",
          category: "Pod Security",
          resource: `${podName}/${container.name}`,
          issue: "Privileged container",
          recommendation: "Remove privileged: true unless absolutely necessary",
        });
      }

      // Check: Missing resource limits
      if (!container.resources?.limits) {
        findings.push({
          severity: "MEDIUM",
          category: "Resource Management",
          resource: `${podName}/${container.name}`,
          issue: "No resource limits set",
          recommendation: "Add CPU and memory limits",
        });
      }

      // Check: Read-only root filesystem
      if (sc.readOnlyRootFilesystem !== true) {
        findings.push({
          severity: "LOW",
          category: "Pod Security",
          resource: `${podName}/${container.name}`,
          issue: "Root filesystem is writable",
          recommendation: "Set readOnlyRootFilesystem: true",
        });
      }
    }

    // Check: Default service account
    if (!pod.spec?.serviceAccountName || pod.spec.serviceAccountName === "default") {
      findings.push({
        severity: "MEDIUM",
        category: "RBAC",
        resource: podName,
        issue: "Using default service account",
        recommendation: "Create a dedicated service account with minimal permissions",
      });
    }
  }

  // Check: Network policies
  try {
    const npRes = await (api as any).listNamespacedNetworkPolicy?.(namespace) ||
      { body: { items: [] } };
    if (npRes.body.items.length === 0) {
      findings.push({
        severity: "HIGH",
        category: "Network Security",
        resource: `namespace/${namespace}`,
        issue: "No NetworkPolicies defined",
        recommendation: "Create NetworkPolicies to restrict pod-to-pod communication",
      });
    }
  } catch {
    // NetworkPolicy API might not be available
  }

  // Format report
  if (findings.length === 0) {
    return `Security audit for namespace '${namespace}': No issues found.`;
  }

  const bySeverity = {
    CRITICAL: findings.filter((f) => f.severity === "CRITICAL"),
    HIGH: findings.filter((f) => f.severity === "HIGH"),
    MEDIUM: findings.filter((f) => f.severity === "MEDIUM"),
    LOW: findings.filter((f) => f.severity === "LOW"),
  };

  const lines = [
    `Security audit for namespace '${namespace}':`,
    `Total findings: ${findings.length} (${bySeverity.CRITICAL.length} critical, ${bySeverity.HIGH.length} high, ${bySeverity.MEDIUM.length} medium, ${bySeverity.LOW.length} low)`,
    "",
  ];

  for (const [severity, items] of Object.entries(bySeverity)) {
    if (items.length === 0) continue;
    lines.push(`--- ${severity} ---`);
    for (const f of items) {
      lines.push(`  [${f.category}] ${f.resource}: ${f.issue}`);
      lines.push(`    Fix: ${f.recommendation}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
