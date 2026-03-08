export function getPrompts() {
  return [
    {
      name: "troubleshoot",
      description: "Systematic troubleshooting workflow for infrastructure issues — guides you through gathering context, identifying anomalies, and suggesting fixes",
      arguments: [
        { name: "symptom", description: "What's the observed problem?", required: true },
        { name: "service", description: "Which service is affected?", required: false },
        { name: "namespace", description: "Kubernetes namespace", required: false },
      ],
    },
  ];
}

export function handlePrompt(args?: Record<string, string>) {
  const symptom = args?.symptom || "Unknown issue";
  const service = args?.service || "unknown";
  const namespace = args?.namespace || "default";

  return {
    description: `Troubleshooting workflow for: ${symptom}`,
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `I need help troubleshooting an infrastructure issue.

**Symptom:** ${symptom}
**Service:** ${service}
**Namespace:** ${namespace}

Please follow this systematic troubleshooting workflow:

## Step 1: Gather Context
- Use \`k8s_get_pods\` to check pod status in the '${namespace}' namespace
- Use \`k8s_get_events\` to look for Warning events
- If a specific service is affected, use \`k8s_describe_pod\` on the relevant pods

## Step 2: Check Logs
- Use \`k8s_get_pod_logs\` for any pods that are unhealthy
- Look for error patterns, stack traces, or timeout messages
- Check previous container logs if pods are restarting

## Step 3: Check Resources
- Use \`k8s_top_pods\` to check CPU/memory usage
- Use \`k8s_top_nodes\` to check node-level resource pressure
- Look for OOMKilled events or CPU throttling

## Step 4: Check Metrics (if Prometheus is available)
- Use \`prom_instant_query\` to check error rates and latency
- Use \`prom_active_alerts\` to see if any alerts are firing
- Look for correlations with recent deployments

## Step 5: Identify Root Cause
- Correlate findings from steps 1-4
- Check recent changes: deployments, config updates, scaling events
- Identify the most likely root cause

## Step 6: Recommend Fix
- Suggest specific remediation steps
- If rollback is needed, use \`k8s_rollout_status\` to check the deployment
- Prioritize stability over diagnosis — mitigate first, then investigate

Please start with Step 1 and work through each step systematically.`,
        },
      },
    ],
  };
}
