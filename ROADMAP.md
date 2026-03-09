# InfraClaude Roadmap

## Status: v1.0.0 — Core Platform Complete

InfraClaude currently provides **41 tools** across 8 categories with a full safety layer, audit logging, and Claude Code integration.

### What's Built

| Category | Tools | Description |
|----------|-------|-------------|
| Kubernetes | 16 | Pods, deployments, services, nodes, events, logs, scaling, rollback |
| Docker | 10 | Containers, images, compose, networks |
| Prometheus | 5 | PromQL queries, alerts, targets, alert rules |
| Terraform | 5 | Plan, state, output, validate (read-only) |
| Security | 3 | Trivy scan, Gitleaks scan, K8s security audit |
| System | 4 | Disk usage, processes, network, logs |
| Safety | 3 | CommandGuard (4-tier risk), AuditLogger, RBAC checker |
| Resources & Prompts | 6 | Cluster info, service health, infra summary + guided workflows |

---

## What's Next

### Phase 9: Database Tools (15 tools)
Query and monitor PostgreSQL, MySQL, Redis, and MongoDB directly from Claude Code.
- Connection health checks
- Active queries and slow query detection
- Replication status
- Cache hit rates

### Phase 10: DNS & Network Tools (12 tools)
- DNS resolution and record lookup
- SSL certificate checking and expiry alerts
- HTTP endpoint health monitoring
- Traceroute and latency measurement

### Phase 11: Cloud Provider Tools (12 tools)
- **AWS**: EC2 instances, S3 buckets, Lambda functions
- **GCP**: GKE clusters, Cloud Run services
- **Azure**: AKS clusters, App Services

### Phase 12: Log Aggregation (7 tools)
Search and analyze logs from Elasticsearch, Loki, or CloudWatch.

### Phase 13: CI/CD Pipeline (6 tools)
Monitor GitHub Actions, GitLab CI, and Jenkins pipeline status and logs.

### Phase 14: APM Tools (8 tools)
Distributed tracing with Datadog, New Relic, and Jaeger.

### Phase 15: Config & Secrets Management (6 tools)
HashiCorp Vault, AWS Secrets Manager, and Kubernetes secrets auditing.

### Phase 16: Cost & Capacity Planning (6 tools)
Resource right-sizing, cost analysis, and scaling recommendations.

### Phase 17: Alerting & On-Call (5 tools)
PagerDuty and OpsGenie integration, alert silence management.

### Phase 18: Backup & Disaster Recovery (4 tools)
Velero backup status, database backup checks, DR readiness assessment.

---

## Stretch Goals

- **npm publish** — Install with `npx infraclaude`
- **Multi-cluster support** — Switch between K8s contexts
- **Plugin system** — Users can add custom tools
- **Web dashboard** — Audit log viewer and usage stats
- **Auto-remediation** — Fix issues automatically with approval
- **Incident timeline** — Automatic debug step recording
- **Team collaboration** — Shared InfraClaude instance

---

## Contributing

Want to help build the next phase? Check out the [issues](https://github.com/batu-sonmez/infraclaude/issues) or pick a phase from the roadmap above.
