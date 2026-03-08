export enum RiskLevel {
  SAFE = "safe",
  CAUTION = "caution",
  DANGEROUS = "dangerous",
  BLOCKED = "blocked",
}

export interface SafetyResult {
  riskLevel: RiskLevel;
  blocked: boolean;
  reason: string;
}

const TOOL_RISK_MAP: Record<string, RiskLevel> = {
  // Kubernetes — Safe (read-only)
  k8s_get_pods: RiskLevel.SAFE,
  k8s_get_pod_logs: RiskLevel.SAFE,
  k8s_describe_pod: RiskLevel.SAFE,
  k8s_get_events: RiskLevel.SAFE,
  k8s_top_pods: RiskLevel.SAFE,
  k8s_top_nodes: RiskLevel.SAFE,
  k8s_get_deployments: RiskLevel.SAFE,
  k8s_rollout_status: RiskLevel.SAFE,
  k8s_get_services: RiskLevel.SAFE,
  k8s_get_nodes: RiskLevel.SAFE,
  k8s_describe_node: RiskLevel.SAFE,

  // Kubernetes — Caution (modifications)
  k8s_scale_deployment: RiskLevel.CAUTION,
  k8s_restart_deployment: RiskLevel.CAUTION,
  k8s_cordon_node: RiskLevel.CAUTION,
  k8s_uncordon_node: RiskLevel.CAUTION,

  // Kubernetes — Dangerous (destructive)
  k8s_delete_pod: RiskLevel.DANGEROUS,
  k8s_rollback_deployment: RiskLevel.DANGEROUS,
  k8s_drain_node: RiskLevel.DANGEROUS,

  // Kubernetes — Blocked (never allowed)
  k8s_delete_namespace: RiskLevel.BLOCKED,
  k8s_delete_deployment: RiskLevel.BLOCKED,
  k8s_delete_service: RiskLevel.BLOCKED,

  // Docker — Safe
  docker_list_containers: RiskLevel.SAFE,
  docker_inspect_container: RiskLevel.SAFE,
  docker_container_logs: RiskLevel.SAFE,
  docker_container_stats: RiskLevel.SAFE,
  docker_list_images: RiskLevel.SAFE,
  docker_compose_ps: RiskLevel.SAFE,
  docker_compose_logs: RiskLevel.SAFE,
  docker_list_networks: RiskLevel.SAFE,
  docker_inspect_network: RiskLevel.SAFE,

  // Docker — Caution
  docker_restart_container: RiskLevel.CAUTION,
  docker_stop_container: RiskLevel.CAUTION,

  // Docker — Dangerous
  docker_remove_container: RiskLevel.DANGEROUS,
  docker_remove_image: RiskLevel.DANGEROUS,

  // Prometheus — Safe (all read-only)
  prom_instant_query: RiskLevel.SAFE,
  prom_range_query: RiskLevel.SAFE,
  prom_active_alerts: RiskLevel.SAFE,
  prom_alert_rules: RiskLevel.SAFE,
  prom_targets: RiskLevel.SAFE,

  // Terraform — Safe (read-only)
  terraform_plan: RiskLevel.SAFE,
  terraform_state_list: RiskLevel.SAFE,
  terraform_state_show: RiskLevel.SAFE,
  terraform_output: RiskLevel.SAFE,
  terraform_validate: RiskLevel.SAFE,

  // Terraform — Blocked
  terraform_apply: RiskLevel.BLOCKED,
  terraform_destroy: RiskLevel.BLOCKED,

  // Security — Safe (scanning)
  security_trivy_scan: RiskLevel.SAFE,
  security_gitleaks_scan: RiskLevel.SAFE,
  security_k8s_audit: RiskLevel.SAFE,

  // System — Safe (read-only)
  system_disk_usage: RiskLevel.SAFE,
  system_processes: RiskLevel.SAFE,
  system_network_connections: RiskLevel.SAFE,
  system_logs: RiskLevel.SAFE,
};

const BLOCKED_REASONS: Record<string, string> = {
  k8s_delete_namespace: "Deleting a namespace removes ALL resources within it. This is never allowed through InfraClaude.",
  k8s_delete_deployment: "Deleting a deployment removes all its pods. Use kubectl directly with explicit confirmation.",
  k8s_delete_service: "Deleting a service breaks connectivity. Use kubectl directly with explicit confirmation.",
  terraform_apply: "Terraform apply modifies real infrastructure. Run 'terraform apply' directly in your terminal.",
  terraform_destroy: "Terraform destroy removes infrastructure. This must be done manually with explicit confirmation.",
};

export class CommandGuard {
  check(toolName: string, args?: Record<string, unknown>): SafetyResult {
    const riskLevel = TOOL_RISK_MAP[toolName];

    if (riskLevel === undefined) {
      return {
        riskLevel: RiskLevel.BLOCKED,
        blocked: true,
        reason: `Unknown tool '${toolName}' — blocked by default for safety.`,
      };
    }

    if (riskLevel === RiskLevel.BLOCKED) {
      return {
        riskLevel,
        blocked: true,
        reason: BLOCKED_REASONS[toolName] || `Tool '${toolName}' is blocked for safety.`,
      };
    }

    // Additional checks for dangerous namespace operations
    if (args && riskLevel === RiskLevel.DANGEROUS) {
      const ns = args.namespace as string | undefined;
      if (ns === "kube-system" || ns === "kube-public") {
        return {
          riskLevel: RiskLevel.BLOCKED,
          blocked: true,
          reason: `Destructive operations on system namespace '${ns}' are never allowed.`,
        };
      }
    }

    return {
      riskLevel,
      blocked: false,
      reason: riskLevel === RiskLevel.DANGEROUS
        ? `This is a destructive operation. Proceed with caution.`
        : riskLevel === RiskLevel.CAUTION
          ? `This operation modifies resources.`
          : "Operation is safe (read-only).",
    };
  }

  getRiskLevel(toolName: string): RiskLevel {
    return TOOL_RISK_MAP[toolName] || RiskLevel.BLOCKED;
  }
}
