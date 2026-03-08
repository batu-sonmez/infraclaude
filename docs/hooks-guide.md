# Claude Code Hooks Guide

InfraClaude includes pre-built hooks for Claude Code that add safety checks, automation, and audit logging.

## What Are Hooks?

Claude Code hooks are scripts that run before or after tool invocations. They can:
- **Block** dangerous operations
- **Warn** about risky actions
- **Log** all operations for audit
- **Automate** follow-up tasks (e.g., health checks after deployments)

## Installation

1. Copy the hook examples to your hooks directory
2. Add the hook configuration to your Claude Code settings

```json
// In ~/.claude/settings.json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__infraclaude__k8s_delete_*",
        "command": "node /path/to/infraclaude/hooks/examples/require-approval.ts"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "mcp__infraclaude__*",
        "command": "node /path/to/infraclaude/hooks/examples/audit-trail.ts"
      }
    ]
  }
}
```

## Available Hooks

### block-dangerous-commands.ts
Blocks operations classified as too dangerous for automated execution (namespace deletion, terraform destroy).

### require-approval.ts
Adds a confirmation step before destructive-but-allowed operations (pod deletion, node drain).

### auto-healthcheck.ts
Automatically triggers health check recommendations after deployment operations.

### audit-trail.ts
Logs every InfraClaude operation to `~/.infraclaude/audit.log` for compliance.

## Writing Custom Hooks

Hooks receive tool invocation data via stdin as JSON:

```json
{
  "tool_name": "mcp__infraclaude__k8s_delete_pod",
  "tool_input": {"name": "test-pod", "namespace": "default"}
}
```

PreToolUse hooks should output a JSON response:
```json
{"decision": "allow"}
// or
{"decision": "block", "reason": "Not allowed"}
```
