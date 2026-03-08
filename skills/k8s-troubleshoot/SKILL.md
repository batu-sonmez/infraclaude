# Kubernetes Troubleshooting Guide

When debugging Kubernetes issues, follow this systematic approach using InfraClaude tools.

## Pod Not Starting

1. Use `k8s_get_pods` to identify the pod status
2. Use `k8s_describe_pod` to check the Events section
3. Common causes:
   - **ImagePullBackOff**: Wrong image name/tag, private registry auth, rate limiting
   - **CrashLoopBackOff**: Application error — check logs with `k8s_get_pod_logs` (also try `previous: true`)
   - **Pending**: Insufficient resources — check `k8s_top_nodes` for node capacity
   - **Init container failing**: Check init container logs specifically with `container` parameter
   - **CreateContainerConfigError**: Missing ConfigMap/Secret references

## High Latency Investigation

1. Use `prom_instant_query` with: `rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])`
2. Check upstream dependencies with `k8s_get_services` and endpoint health
3. Look for resource saturation: `k8s_top_pods` — pods at CPU limit will be throttled
4. Check for recent deployments: `k8s_rollout_status`
5. Check for noisy neighbors on the same node: `k8s_top_nodes`

## Memory Leak Detection

1. Use `prom_range_query` for `container_memory_working_set_bytes` over 24h
2. Look for monotonically increasing memory without plateaus
3. Check OOMKilled events: `k8s_get_events` with type=Warning
4. Check container restart counts with `k8s_get_pods`
5. Compare requested vs actual memory in `k8s_describe_pod`

## Deployment Rollout Issues

1. Use `k8s_rollout_status` to check progress
2. Common issues:
   - **ProgressDeadlineExceeded**: New pods failing to start — check pod events
   - **Insufficient replicas**: Check resource quotas and node capacity
   - **Readiness probe failing**: Application not healthy — check logs and probe config
3. Use `k8s_rollback_deployment` if the new version is broken

## Node Issues

1. Use `k8s_get_nodes` to check node status
2. Use `k8s_describe_node` to check conditions:
   - **MemoryPressure**: Node running out of memory
   - **DiskPressure**: Node disk is full
   - **PIDPressure**: Too many processes
3. Use `k8s_top_nodes` to see actual resource usage
4. If a node is problematic, use `k8s_cordon_node` to prevent new scheduling

## Service Connectivity

1. Use `k8s_get_services` to verify service exists and has correct selectors
2. Check endpoints — a service with no endpoints means no pods match the selector
3. Verify pod labels match service selector
4. Check NetworkPolicies that might be blocking traffic
5. Test DNS resolution and service discovery
