export function getCapacityPlanPrompt() {
  return [
    {
      name: "capacity-plan",
      description: "Capacity planning analysis — assess current resource usage, identify bottlenecks, and recommend scaling",
      arguments: [
        { name: "namespace", description: "Kubernetes namespace to analyze", required: false },
        { name: "timeframe", description: "Growth timeframe (e.g., '30d', '90d')", required: false },
      ],
    },
  ];
}

export function handleCapacityPlanPrompt(args?: Record<string, string>) {
  const namespace = args?.namespace || "all namespaces";
  const timeframe = args?.timeframe || "30d";

  return {
    description: `Capacity planning analysis for ${namespace}`,
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please perform a capacity planning analysis for my infrastructure.

**Scope:** ${namespace}
**Planning Timeframe:** ${timeframe}

Follow this workflow:

## Step 1: Current Resource Usage
- Use \`k8s_top_nodes\` to assess cluster-wide CPU and memory usage
- Use \`k8s_top_pods\` to find the most resource-hungry workloads
- Identify nodes approaching capacity limits

## Step 2: Resource Requests vs Actual Usage
- Use \`k8s_get_deployments\` to review resource requests/limits
- Compare configured limits with actual usage from metrics
- Identify over-provisioned and under-provisioned workloads

## Step 3: Growth Trends (if Prometheus available)
- Use \`prom_range_query\` to analyze CPU/memory trends over time
- Example queries:
  - \`avg(container_cpu_usage_seconds_total) by (namespace)\`
  - \`sum(container_memory_working_set_bytes) by (namespace)\`
- Calculate growth rate and project future needs

## Step 4: Bottleneck Identification
- Check for pods with frequent OOMKills
- Check for CPU throttling
- Check node conditions for DiskPressure, MemoryPressure
- Review any pending pods that can't be scheduled

## Step 5: Recommendations
- Suggest right-sizing for over/under-provisioned workloads
- Recommend when to add more nodes
- Suggest HPA (Horizontal Pod Autoscaler) for variable workloads
- Provide cost optimization suggestions

Please start the analysis.`,
        },
      },
    ],
  };
}
