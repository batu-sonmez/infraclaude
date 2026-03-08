# Infrastructure Security Review Checklist

Comprehensive security audit checklist using InfraClaude tools.

## Kubernetes Security

### Pod Security
- [ ] No pods running as root (`security_k8s_audit`)
- [ ] No privileged containers
- [ ] Read-only root filesystem where possible
- [ ] Resource limits set on all containers
- [ ] No host network/PID/IPC namespace sharing
- [ ] Security contexts defined for all pods

### RBAC
- [ ] No overly permissive ClusterRoleBindings
- [ ] Service accounts follow least privilege
- [ ] No use of default service account for workloads
- [ ] Regular review of who has cluster-admin

### Network Security
- [ ] NetworkPolicies defined for all namespaces
- [ ] Default deny ingress/egress policies
- [ ] Services not unnecessarily exposed externally
- [ ] TLS enabled for all external endpoints

### Secrets Management
- [ ] Secrets not stored in ConfigMaps
- [ ] Secrets not in environment variables (prefer volume mounts)
- [ ] External secrets manager integration
- [ ] Regular secret rotation

## Container Security

### Image Security
- [ ] Scan images with `security_trivy_scan` for CVEs
- [ ] No CRITICAL/HIGH vulnerabilities in production images
- [ ] Use specific image tags, not `:latest`
- [ ] Images from trusted registries only
- [ ] Multi-stage builds to minimize image size

### Secret Detection
- [ ] Run `security_gitleaks_scan` on the codebase
- [ ] No API keys, passwords, or tokens in code
- [ ] `.gitignore` covers sensitive files
- [ ] Pre-commit hooks for secret detection

## Infrastructure Security

### Terraform
- [ ] State files encrypted and access-controlled
- [ ] No hardcoded secrets in HCL files
- [ ] Use `terraform_validate` before applying
- [ ] Review `terraform_plan` output carefully

### Monitoring
- [ ] Alerts configured for security events
- [ ] Audit logging enabled
- [ ] Log aggregation and retention policies
- [ ] Anomaly detection for unusual patterns

## Remediation Priority

| Severity | SLA | Examples |
|----------|-----|---------|
| Critical | 24h | Privileged containers, exposed secrets, no auth |
| High | 1 week | Running as root, missing network policies |
| Medium | 1 month | Missing resource limits, no image scanning |
| Low | Next quarter | Best practice improvements |
