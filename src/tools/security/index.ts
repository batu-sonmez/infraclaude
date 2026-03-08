import { trivyScanImage } from "./trivy_scan.js";
import { gitleaksScan } from "./gitleaks_scan.js";
import { k8sSecurityAudit } from "./k8s_audit.js";

export function registerSecurityTools() {
  return [
    {
      name: "security_trivy_scan",
      description: "Scan a container image for vulnerabilities using Trivy",
      inputSchema: {
        type: "object" as const,
        properties: {
          image: { type: "string", description: "Container image to scan (e.g., 'nginx:latest')" },
          severity: { type: "string", description: "Severity filter (default: 'HIGH,CRITICAL')" },
        },
        required: ["image"],
      },
    },
    {
      name: "security_gitleaks_scan",
      description: "Scan a directory for leaked secrets and credentials using Gitleaks",
      inputSchema: {
        type: "object" as const,
        properties: {
          directory: { type: "string", description: "Directory to scan (default: current directory)" },
        },
      },
    },
    {
      name: "security_k8s_audit",
      description: "Audit Kubernetes namespace for security misconfigurations (privileged containers, missing limits, RBAC issues)",
      inputSchema: {
        type: "object" as const,
        properties: {
          namespace: { type: "string", description: "Kubernetes namespace to audit (default: 'default')" },
        },
      },
    },
  ];
}

export async function handleSecurityTool(
  name: string,
  args: Record<string, unknown> | undefined
): Promise<string> {
  const a = args || {};
  switch (name) {
    case "security_trivy_scan": return trivyScanImage(a);
    case "security_gitleaks_scan": return gitleaksScan(a);
    case "security_k8s_audit": return k8sSecurityAudit(a);
    default: throw new Error(`Unknown security tool: ${name}`);
  }
}
