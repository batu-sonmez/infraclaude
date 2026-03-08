import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { registerKubernetesTools, handleKubernetesTool } from "./tools/kubernetes/index.js";
import { registerDockerTools, handleDockerTool } from "./tools/docker/index.js";
import { registerPrometheusTools, handlePrometheusTool } from "./tools/prometheus/index.js";
import { registerTerraformTools, handleTerraformTool } from "./tools/terraform/index.js";
import { registerSecurityTools, handleSecurityTool } from "./tools/security/index.js";
import { registerSystemTools, handleSystemTool } from "./tools/system/index.js";
import { getResources, readResource } from "./resources/cluster_info.js";
import { getServiceHealthResource, readServiceHealthResource } from "./resources/service_health.js";
import { getInfraSummaryResource, readInfraSummaryResource } from "./resources/infra_summary.js";
import { getPrompts, handlePrompt } from "./prompts/troubleshoot.js";
import { getCapacityPlanPrompt, handleCapacityPlanPrompt } from "./prompts/capacity_plan.js";
import { getSecurityAuditPrompt, handleSecurityAuditPrompt } from "./prompts/security_audit.js";
import { CommandGuard } from "./safety/command_guard.js";
import { AuditLogger } from "./safety/audit_logger.js";

export function createInfraClaudeServer(): Server {
  const server = new Server(
    { name: "infraclaude", version: "1.0.0" },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  const guard = new CommandGuard();
  const logger = new AuditLogger();

  // --- Tools ---
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      ...registerKubernetesTools(),
      ...registerDockerTools(),
      ...registerPrometheusTools(),
      ...registerTerraformTools(),
      ...registerSecurityTools(),
      ...registerSystemTools(),
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Safety check
    const safetyResult = guard.check(name, args);
    if (safetyResult.blocked) {
      await logger.log(name, args, "BLOCKED", safetyResult.reason);
      return {
        content: [
          {
            type: "text",
            text: `⛔ Operation blocked: ${safetyResult.reason}\n\nRisk level: ${safetyResult.riskLevel}\nThis operation is not allowed through InfraClaude for safety reasons.`,
          },
        ],
        isError: true,
      };
    }

    if (safetyResult.riskLevel === "dangerous") {
      await logger.log(name, args, "WARNING", `Dangerous operation: ${safetyResult.reason}`);
    }

    try {
      let result: string;

      if (name.startsWith("k8s_")) {
        result = await handleKubernetesTool(name, args);
      } else if (name.startsWith("docker_")) {
        result = await handleDockerTool(name, args);
      } else if (name.startsWith("prom_")) {
        result = await handlePrometheusTool(name, args);
      } else if (name.startsWith("terraform_")) {
        result = await handleTerraformTool(name, args);
      } else if (name.startsWith("security_")) {
        result = await handleSecurityTool(name, args);
      } else if (name.startsWith("system_")) {
        result = await handleSystemTool(name, args);
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }

      await logger.log(name, args, "SUCCESS");

      return {
        content: [{ type: "text", text: result }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await logger.log(name, args, "ERROR", message);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  });

  // --- Resources ---
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      ...getResources(),
      ...getServiceHealthResource(),
      ...getInfraSummaryResource(),
    ],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    if (uri === "infraclaude://cluster-info") {
      return readResource();
    } else if (uri === "infraclaude://service-health") {
      return readServiceHealthResource();
    } else if (uri === "infraclaude://infra-summary") {
      return readInfraSummaryResource();
    }

    throw new Error(`Unknown resource: ${uri}`);
  });

  // --- Prompts ---
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: [
      ...getPrompts(),
      ...getCapacityPlanPrompt(),
      ...getSecurityAuditPrompt(),
    ],
  }));

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "troubleshoot") {
      return handlePrompt(args);
    } else if (name === "capacity-plan") {
      return handleCapacityPlanPrompt(args);
    } else if (name === "security-audit") {
      return handleSecurityAuditPrompt(args);
    }

    throw new Error(`Unknown prompt: ${name}`);
  });

  return server;
}
