/**
 * Claude Code Hook: Auto health-check after deployments
 *
 * Runs after rollout/scale operations to verify the deployment
 * is healthy and pods are ready.
 */

const input = await readStdin();
const data = JSON.parse(input);
const toolName: string = data.tool_name || "";
const result = data.tool_result || "";

const isDeploymentOp =
  toolName.includes("rollout") ||
  toolName.includes("scale") ||
  toolName.includes("rollback");

if (isDeploymentOp) {
  const message = [
    "🔍 Post-deployment health check triggered",
    `Tool: ${toolName}`,
    `Result: ${typeof result === "string" ? result.substring(0, 200) : JSON.stringify(result).substring(0, 200)}`,
    "",
    "Recommended follow-up:",
    "1. Run k8s_get_pods to verify pod status",
    "2. Run k8s_get_events to check for warnings",
    "3. Check application logs for errors",
  ].join("\n");

  process.stdout.write(message);
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}
