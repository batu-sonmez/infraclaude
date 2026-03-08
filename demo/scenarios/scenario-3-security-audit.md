# Scenario 3: "Audit my cluster security"

## Try This in Claude Code

```
You: "Run a security audit on my demo namespace"
```

## Expected Flow

1. Claude uses `security_k8s_audit` → checks for security misconfigurations
2. Claude uses `k8s_get_pods` → identifies running images
3. Claude uses `security_trivy_scan` → scans images for CVEs
4. Claude compiles a security report with findings and remediation steps

## What This Demonstrates

- Security-first mindset
- Automated vulnerability scanning
- Prioritized remediation recommendations
