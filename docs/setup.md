# InfraClaude Setup Guide

## Prerequisites

- Node.js 20+
- npm
- Kubernetes cluster (minikube for local development)
- Docker (optional, for Docker tools)
- Prometheus (optional, for metrics tools)
- Trivy & Gitleaks (optional, for security scanning)

## Installation

```bash
git clone https://github.com/batu-sonmez/infraclaude.git
cd infraclaude
npm install
npm run build
```

## Configure Claude Code

Add InfraClaude to your Claude Code configuration:

```json
// ~/.claude/claude_code_config.json
{
  "mcpServers": {
    "infraclaude": {
      "command": "node",
      "args": ["/absolute/path/to/infraclaude/dist/index.js"],
      "env": {
        "KUBECONFIG": "/path/to/.kube/config",
        "PROMETHEUS_URL": "http://localhost:9090",
        "INFRACLAUDE_SAFETY_MODE": "strict"
      }
    }
  }
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `KUBECONFIG` | `~/.kube/config` | Path to kubeconfig file |
| `PROMETHEUS_URL` | `http://localhost:9090` | Prometheus endpoint |
| `DOCKER_HOST` | `unix:///var/run/docker.sock` | Docker socket |
| `INFRACLAUDE_LOG_LEVEL` | `info` | Log level: debug, info, warn, error |
| `INFRACLAUDE_AUDIT_LOG` | `~/.infraclaude/audit.log` | Audit log file path |
| `INFRACLAUDE_SAFETY_MODE` | `strict` | Safety mode: strict, permissive |

## Quick Test

After configuration, restart Claude Code and try:

```
"Show me all pods in the default namespace"
"What nodes are in my cluster?"
"Check for any warning events"
```

## Demo Environment

For a full demo with sample applications:

```bash
make demo-setup
```

This creates a minikube cluster with:
- A healthy API deployment
- A background worker
- A broken pod (for debugging demos)
- Prometheus for metrics
