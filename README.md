# InfraClaude

> Give Claude superpowers over your infrastructure — MCP Server for Kubernetes, Docker, Terraform, Prometheus, and Security tools.

[![CI](https://github.com/batu-sonmez/infraclaude/actions/workflows/ci.yml/badge.svg)](https://github.com/batu-sonmez/infraclaude/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blueviolet)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)

InfraClaude is an [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that exposes infrastructure management tools to Claude. Through InfraClaude, Claude Code can query Kubernetes clusters, manage Docker containers, check Prometheus metrics, run Terraform plans, and perform security scans — all through natural language.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                Claude Code / Claude Desktop              │
│                                                          │
│  User: "Check if any pods are crashlooping"             │
│                         │                                │
│                    MCP Client                            │
└─────────────────────────┼────────────────────────────────┘
                          │ MCP Protocol (stdio)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 InfraClaude MCP Server                    │
│                                                          │
│  ┌───────────┐ ┌──────────┐ ┌────────────┐             │
│  │ Kubernetes │ │  Docker  │ │ Prometheus │             │
│  │  16 tools  │ │  9 tools │ │  5 tools   │             │
│  └───────────┘ └──────────┘ └────────────┘             │
│  ┌───────────┐ ┌──────────┐ ┌────────────┐             │
│  │ Terraform │ │ Security │ │   System   │             │
│  │  5 tools  │ │  3 tools │ │  4 tools   │             │
│  └───────────┘ └──────────┘ └────────────┘             │
│                                                          │
│  Safety Layer: Command Guard → RBAC → Audit Logger      │
└─────────────────────────────────────────────────────────┘

Plus: Claude Code Hooks + Custom Skills
```

## Features

- **42+ infrastructure tools** across Kubernetes, Docker, Prometheus, Terraform, Security, and System
- **Safety-first design** — 4-tier risk classification (Safe → Caution → Dangerous → Blocked)
- **Audit logging** — every operation logged for compliance
- **Claude Code hooks** — pre/post tool-use safety checks and automation
- **Custom skills** — K8s troubleshooting, incident response, Docker debugging, security review
- **MCP resources** — cluster info, service health, infrastructure summary
- **MCP prompts** — guided troubleshooting, capacity planning, security audit workflows

## Quick Start

```bash
# Clone and build
git clone https://github.com/batu-sonmez/infraclaude.git
cd infraclaude
npm install
npm run build

# Add to Claude Code (~/.claude/claude_code_config.json)
{
  "mcpServers": {
    "infraclaude": {
      "command": "node",
      "args": ["/path/to/infraclaude/dist/index.js"],
      "env": {
        "KUBECONFIG": "~/.kube/config",
        "PROMETHEUS_URL": "http://localhost:9090"
      }
    }
  }
}
```

Then in Claude Code:
```
"Show me all pods in production"
"Why is my pod crashing?"
"Run a security audit on the default namespace"
"What's the CPU usage of my cluster?"
"Scan the nginx:latest image for vulnerabilities"
```

## Demo

Set up a local demo environment with intentionally broken pods:

```bash
make demo-setup
```

Then try the [demo scenarios](demo/scenarios/).

## Safety Model

InfraClaude classifies every operation by risk level:

| Level | Action | Example |
|-------|--------|---------|
| **Safe** | Always allowed | `k8s_get_pods`, `prom_instant_query` |
| **Caution** | Allowed with warning | `k8s_scale_deployment` |
| **Dangerous** | Requires confirmation | `k8s_delete_pod` |
| **Blocked** | Never allowed | `k8s_delete_namespace`, `terraform_apply` |

System namespaces (`kube-system`, `kube-public`) have additional protections.

See [Safety Documentation](docs/safety.md) for details.

## Documentation

- [Setup Guide](docs/setup.md)
- [Tools Reference](docs/tools-reference.md) — all 42+ tools documented
- [Safety Model](docs/safety.md)
- [Hooks Guide](docs/hooks-guide.md)
- [Skills Guide](docs/skills-guide.md)

## Tech Stack

| Component | Technology |
|-----------|-----------|
| MCP Server | TypeScript + @modelcontextprotocol/sdk |
| Kubernetes | @kubernetes/client-node |
| Docker | dockerode |
| Prometheus | Native fetch API |
| Terraform | CLI wrapper |
| Security | Trivy, Gitleaks CLI |
| Testing | Vitest |
| CI/CD | GitHub Actions |

## License

MIT — see [LICENSE](LICENSE).
