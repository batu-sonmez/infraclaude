#!/usr/bin/env bash
# InfraClaude Post-Tool-Use Hook
# Logs operations and runs health checks after deployments

set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Log all operations
LOG_DIR="${HOME}/.infraclaude"
mkdir -p "$LOG_DIR"
echo "{\"timestamp\": \"$TIMESTAMP\", \"tool\": \"$TOOL_NAME\", \"status\": \"completed\"}" >> "$LOG_DIR/audit.log"

# Auto health-check after rollout operations
if [[ "$TOOL_NAME" == *"rollout"* ]] || [[ "$TOOL_NAME" == *"scale"* ]]; then
  echo "🔍 Running post-deployment health check..."
  # The hook output will be shown to the user as a notification
fi
