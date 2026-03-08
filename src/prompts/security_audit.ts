export function getSecurityAuditPrompt() {
  return [
    {
      name: "security-audit",
      description: "Infrastructure security review — check for common security misconfigurations and vulnerabilities",
      arguments: [
        { name: "namespace", description: "Kubernetes namespace to audit", required: false },
        { name: "scope", description: "Audit scope: 'k8s', 'containers', 'all'", required: false },
      ],
    },
  ];
}

export function handleSecurityAuditPrompt(args?: Record<string, string>) {
  const namespace = args?.namespace || "default";
  const scope = args?.scope || "all";

  return {
    description: `Security audit for ${namespace} (scope: ${scope})`,
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Please perform a security audit of my infrastructure.

**Namespace:** ${namespace}
**Scope:** ${scope}

Follow this security review checklist:

## Step 1: Kubernetes Security Posture
- Use \`security_k8s_audit\` to check for common K8s security issues:
  - Pods running as root
  - Privileged containers
  - Missing resource limits
  - Default service account usage
  - Missing network policies

## Step 2: Container Image Vulnerabilities
- Use \`k8s_get_pods\` to list all running container images
- Use \`security_trivy_scan\` to scan the most critical images for CVEs
- Focus on HIGH and CRITICAL severity vulnerabilities

## Step 3: Secret Management
- Use \`security_gitleaks_scan\` to check for leaked secrets in code
- Check if secrets are properly managed (not in environment variables or config maps)

## Step 4: Network Security
- Check for NetworkPolicy resources in the namespace
- Identify services exposed externally
- Look for overly permissive ingress/egress rules

## Step 5: RBAC Review
- Check for overly permissive ClusterRoleBindings
- Look for service accounts with excessive permissions
- Verify principle of least privilege

## Step 6: Security Report
Provide a summary with:
- **Critical findings** (must fix immediately)
- **High findings** (fix within a week)
- **Medium findings** (fix within a month)
- **Low findings** (best practices to adopt)
- Specific remediation steps for each finding

Please begin the security audit.`,
        },
      },
    ],
  };
}
