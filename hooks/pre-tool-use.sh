#!/usr/bin/env bash
# InfraClaude Pre-Tool-Use Hook
# Reads tool invocation from stdin and validates safety before execution

set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Block dangerous operations
BLOCKED_TOOLS=(
  "k8s_delete_namespace"
  "k8s_delete_deployment"
  "k8s_delete_service"
  "terraform_apply"
  "terraform_destroy"
)

for blocked in "${BLOCKED_TOOLS[@]}"; do
  if [[ "$TOOL_NAME" == *"$blocked"* ]]; then
    echo '{"decision": "block", "reason": "This operation is blocked by InfraClaude safety hooks. Use kubectl/terraform CLI directly for destructive operations."}'
    exit 0
  fi
done

# Warn on dangerous operations
DANGEROUS_TOOLS=(
  "k8s_delete_pod"
  "k8s_drain_node"
  "k8s_rollback_deployment"
  "docker_remove_container"
  "docker_remove_image"
)

for dangerous in "${DANGEROUS_TOOLS[@]}"; do
  if [[ "$TOOL_NAME" == *"$dangerous"* ]]; then
    echo "{\"decision\": \"allow\", \"reason\": \"⚠️ Caution: $TOOL_NAME is a destructive operation.\"}"
    exit 0
  fi
done

# Allow everything else
echo '{"decision": "allow"}'
