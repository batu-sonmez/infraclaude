# SRE Incident Response Workflow

Systematic incident response workflow using InfraClaude tools. Follow these phases in order.

## Phase 1: Detect & Assess

**Goal:** Understand the scope and severity of the incident.

1. Check alerts: `prom_active_alerts` — what's firing?
2. Check cluster health: `k8s_get_pods` across namespaces — any pods unhealthy?
3. Check events: `k8s_get_events` with type=Warning — what recent warnings exist?
4. Assess severity:
   - **SEV1**: Complete service outage or data loss risk
   - **SEV2**: Degraded service affecting users
   - **SEV3**: Minor degradation, workaround available
   - **SEV4**: Non-user-facing issue

## Phase 2: Triage

**Goal:** Identify what changed and what's affected.

1. Check recent deployments: `k8s_get_deployments` — any recent rollouts?
2. Check rollout status: `k8s_rollout_status` for recently deployed services
3. Check resource usage: `k8s_top_pods` and `k8s_top_nodes`
4. Check metrics: `prom_instant_query` for error rates and latency
5. Identify the blast radius — which services and users are affected?

## Phase 3: Mitigate

**Goal:** Restore service as quickly as possible. Fix it first, understand later.

Possible mitigations (in order of preference):
1. **Rollback**: If a recent deployment caused the issue, use `k8s_rollback_deployment`
2. **Scale up**: If capacity is the issue, use `k8s_scale_deployment`
3. **Restart**: If a transient issue, delete the problematic pod with `k8s_delete_pod`
4. **Cordon node**: If a node is unhealthy, use `k8s_cordon_node`

## Phase 4: Resolve

**Goal:** Implement a proper fix.

1. Analyze logs: `k8s_get_pod_logs` — look for root cause in error logs
2. Check for code issues, configuration errors, or infrastructure problems
3. Deploy a fix if the root cause is identified
4. Verify the fix: `k8s_rollout_status` and `prom_instant_query` for error rates

## Phase 5: Post-Mortem

**Goal:** Learn from the incident and prevent recurrence.

Gather data for the post-mortem:
1. Timeline of events from `k8s_get_events`
2. Metrics from `prom_range_query` showing the incident window
3. Deployment history from rollout status
4. Document:
   - What happened
   - Why it happened
   - How it was detected
   - How it was fixed
   - Action items to prevent recurrence
