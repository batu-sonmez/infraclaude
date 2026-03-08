export interface InfraClaudeConfig {
  kubeconfig: string;
  prometheusUrl: string;
  dockerHost: string;
  logLevel: "debug" | "info" | "warn" | "error";
  auditLogPath: string;
  safetyMode: "strict" | "permissive";
}

export function loadConfig(): InfraClaudeConfig {
  return {
    kubeconfig: process.env.KUBECONFIG || `${process.env.HOME}/.kube/config`,
    prometheusUrl: process.env.PROMETHEUS_URL || "http://localhost:9090",
    dockerHost: process.env.DOCKER_HOST || "unix:///var/run/docker.sock",
    logLevel: (process.env.INFRACLAUDE_LOG_LEVEL as InfraClaudeConfig["logLevel"]) || "info",
    auditLogPath: process.env.INFRACLAUDE_AUDIT_LOG || `${process.env.HOME}/.infraclaude/audit.log`,
    safetyMode: (process.env.INFRACLAUDE_SAFETY_MODE as InfraClaudeConfig["safetyMode"]) || "strict",
  };
}

const config = loadConfig();
export default config;
