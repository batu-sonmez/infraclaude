# Scenario 2: "Find the latency bottleneck"

## Try This in Claude Code

```
You: "Our API response times jumped to 2 seconds. Help me find why."
```

## Expected Flow

1. Claude uses `prom_instant_query` → confirms elevated latency metrics
2. Claude uses `k8s_top_pods` → finds a pod at high CPU usage
3. Claude uses `k8s_get_events` → finds a recent deployment event
4. Claude uses `k8s_rollout_status` → confirms new version was deployed
5. Claude correlates: latency spike started with the deployment
6. Claude suggests: rollback the deployment or investigate the new code

## What This Demonstrates

- Cross-tool correlation (Prometheus + Kubernetes)
- Root cause analysis through temporal correlation
- Actionable remediation suggestions
