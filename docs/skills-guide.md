# Custom Skills Guide

InfraClaude includes custom skills that teach Claude Code infrastructure best practices and debugging patterns.

## What Are Skills?

Skills are markdown files (`SKILL.md`) that Claude Code loads as context when the user invokes them. They provide domain-specific knowledge and workflows.

## Included Skills

### k8s-troubleshoot
Kubernetes troubleshooting guide covering:
- Pod startup failures (ImagePullBackOff, CrashLoopBackOff, Pending)
- High latency investigation
- Memory leak detection
- Deployment rollout issues
- Node problems
- Service connectivity

### incident-response
SRE incident response workflow:
1. Detect & Assess (severity classification)
2. Triage (identify what changed)
3. Mitigate (restore service fast)
4. Resolve (implement proper fix)
5. Post-Mortem (learn and prevent)

### docker-debug
Container debugging guide:
- Container startup failures
- Resource usage issues
- Networking problems
- Docker Compose troubleshooting
- Image management

### security-review
Infrastructure security checklist:
- Kubernetes pod security
- RBAC review
- Network policies
- Container image scanning
- Secret management
- Terraform security

## Adding Custom Skills

Create a new directory under `skills/` with a `SKILL.md` file:

```
skills/
  my-custom-skill/
    SKILL.md
```

The SKILL.md file should contain domain knowledge and reference InfraClaude tools by name.
