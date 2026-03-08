# InfraClaude Safety Model

Safety is a core design principle of InfraClaude. Every tool operation is classified by risk level and validated before execution.

## Risk Levels

| Level | Description | Examples |
|-------|-------------|---------|
| **Safe** | Read-only operations. Always allowed. | get_pods, describe, logs, query |
| **Caution** | Modifications that are recoverable. Allowed with warning. | scale, restart, cordon |
| **Dangerous** | Destructive but sometimes necessary. Requires explicit confirmation. | delete_pod, rollback, drain |
| **Blocked** | Never allowed through InfraClaude. Must use CLI directly. | delete_namespace, terraform_apply |

## Safety Layers

### 1. Command Guard (`src/safety/command_guard.ts`)
- Every tool call is classified before execution
- Blocked tools return an error immediately
- System namespaces (kube-system, kube-public) have extra protection

### 2. RBAC Checker (`src/safety/rbac_checker.ts`)
- Verifies Kubernetes permissions before operations
- Uses SelfSubjectAccessReview API
- Prevents "permission denied" errors at the application level

### 3. Audit Logger (`src/safety/audit_logger.ts`)
- Every operation is logged with timestamp, tool, arguments, and result
- Stored in `~/.infraclaude/audit.log`
- JSON-lines format for easy parsing

### 4. Claude Code Hooks
- Pre-tool-use hooks can block or warn before execution
- Post-tool-use hooks run health checks after deployments
- All operations are audit-trailed

## Blocked Operations

These operations are **never** allowed through InfraClaude:

- `k8s_delete_namespace` — Removes ALL resources in a namespace
- `k8s_delete_deployment` — Removes a deployment and all its pods
- `k8s_delete_service` — Breaks service connectivity
- `terraform_apply` — Modifies real infrastructure
- `terraform_destroy` — Destroys infrastructure

To perform these operations, use the respective CLI tools directly with explicit confirmation.

## Customization

Set `INFRACLAUDE_SAFETY_MODE=permissive` to reduce restrictions (not recommended for production).
