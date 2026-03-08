# InfraClaude Tools Reference

## Kubernetes Tools

| Tool | Risk Level | Description |
|------|-----------|-------------|
| `k8s_get_pods` | Safe | List pods with status, restarts, and age |
| `k8s_describe_pod` | Safe | Detailed pod info (events, conditions, containers) |
| `k8s_get_pod_logs` | Safe | Fetch logs with tail/since/container filters |
| `k8s_get_events` | Safe | Cluster events filtered by namespace/type |
| `k8s_top_pods` | Safe | CPU/memory usage per pod |
| `k8s_top_nodes` | Safe | CPU/memory usage per node |
| `k8s_get_deployments` | Safe | Deployment status, replicas, strategy |
| `k8s_rollout_status` | Safe | Check rollout progress |
| `k8s_get_services` | Safe | Service list with ports and endpoints |
| `k8s_get_nodes` | Safe | Node list with status and version |
| `k8s_describe_node` | Safe | Detailed node info |
| `k8s_scale_deployment` | Caution | Scale deployment replicas |
| `k8s_cordon_node` | Caution | Mark node unschedulable |
| `k8s_uncordon_node` | Caution | Mark node schedulable |
| `k8s_delete_pod` | Dangerous | Delete a pod |
| `k8s_rollback_deployment` | Dangerous | Rollback deployment |

## Docker Tools

| Tool | Risk Level | Description |
|------|-----------|-------------|
| `docker_list_containers` | Safe | List containers with status |
| `docker_inspect_container` | Safe | Detailed container info |
| `docker_container_logs` | Safe | Container logs |
| `docker_container_stats` | Safe | Real-time resource stats |
| `docker_list_images` | Safe | Local images with sizes |
| `docker_compose_ps` | Safe | Docker Compose service status |
| `docker_compose_logs` | Safe | Compose service logs |
| `docker_list_networks` | Safe | Docker networks |
| `docker_inspect_network` | Safe | Network details |

## Prometheus Tools

| Tool | Risk Level | Description |
|------|-----------|-------------|
| `prom_instant_query` | Safe | Execute PromQL (current value) |
| `prom_range_query` | Safe | Execute PromQL over time range |
| `prom_active_alerts` | Safe | Currently firing alerts |
| `prom_alert_rules` | Safe | All alert rules and states |
| `prom_targets` | Safe | Scrape target health |

## Terraform Tools

| Tool | Risk Level | Description |
|------|-----------|-------------|
| `terraform_plan` | Safe | Show planned changes (read-only) |
| `terraform_state_list` | Safe | List resources in state |
| `terraform_state_show` | Safe | Show specific resource |
| `terraform_output` | Safe | Read output values |
| `terraform_validate` | Safe | Validate configuration |

## Security Tools

| Tool | Risk Level | Description |
|------|-----------|-------------|
| `security_trivy_scan` | Safe | Scan image for vulnerabilities |
| `security_gitleaks_scan` | Safe | Detect secrets in code |
| `security_k8s_audit` | Safe | K8s security audit |

## System Tools

| Tool | Risk Level | Description |
|------|-----------|-------------|
| `system_disk_usage` | Safe | Disk usage info |
| `system_processes` | Safe | Process list |
| `system_network_connections` | Safe | Network connections |
| `system_logs` | Safe | System logs |
