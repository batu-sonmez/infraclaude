# InfraClaude Hooks for Claude Code

Claude Code hooks that add safety checks, audit logging, and automation to infrastructure operations.

## Installation

Copy the hook configuration to your Claude Code settings:

```bash
# Add to ~/.claude/settings.json under the "hooks" key
# Or merge hooks-config.json into your existing configuration
```

## Available Hooks

### PreToolUse Hooks

- **block-dangerous-commands** — Blocks destructive operations (delete namespace, terraform destroy)
- **require-approval** — Prompts for human confirmation before dangerous-but-allowed operations

### PostToolUse Hooks

- **auto-healthcheck** — Runs health checks after deployment operations
- **audit-trail** — Logs all InfraClaude operations to ~/.infraclaude/audit.log

## Customization

Edit `hooks-config.json` to add or modify hooks. Each hook has:
- `matcher`: Glob pattern matching tool names
- `command`: Shell command or script to run
- `description`: Human-readable description

## Audit Log Format

Each line in the audit log is a JSON object:
```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "tool": "k8s_get_pods",
  "input": {"namespace": "production"},
  "user": "batu",
  "pid": 12345
}
```
