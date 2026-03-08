# Scenario 1: "Why is my pod crashing?"

## Setup
Deploy the demo cluster with `bash demo/demo-cluster/setup.sh`. The `broken-pod` will start CrashLoopBackOff.

## Try This in Claude Code

```
You: "I have a pod that keeps crashing in the demo namespace. Can you help me debug it?"
```

## Expected Flow

1. Claude uses `k8s_get_pods` → finds `broken-pod` in CrashLoopBackOff
2. Claude uses `k8s_describe_pod` → sees restart count and events
3. Claude uses `k8s_get_pod_logs` → reads "ERROR: Failed to connect to database at db:5432"
4. Claude uses `k8s_get_events` → sees Warning events about BackOff
5. Claude identifies: pod is failing because it can't connect to a database service that doesn't exist
6. Claude suggests: create the database service, fix the connection string, or add a health check

## What This Demonstrates

- Natural language → tool invocation pipeline
- Systematic debugging workflow
- Claude's ability to correlate multiple data sources
- InfraClaude's read-only safety (no destructive operations attempted)
