# Scenario 4: "Do I need to scale?"

## Try This in Claude Code

```
You: "Analyze my cluster capacity and tell me if I need to scale."
```

## Expected Flow

1. Claude uses `k8s_top_nodes` → checks cluster-wide resource usage
2. Claude uses `k8s_top_pods` → identifies resource-hungry workloads
3. Claude uses `k8s_get_deployments` → reviews configured resource requests/limits
4. Claude uses `prom_range_query` → analyzes growth trends
5. Claude provides capacity planning recommendations

## What This Demonstrates

- Proactive capacity planning
- Resource optimization suggestions
- Data-driven scaling decisions
