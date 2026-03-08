/**
 * Claude Code Hook: Require human approval for destructive operations
 *
 * For dangerous-but-allowed operations (like deleting a pod),
 * this hook signals that human confirmation is required.
 */

const input = await readStdin();
const data = JSON.parse(input);
const toolName: string = data.tool_name || "";
const args = data.tool_input || {};

const REQUIRES_APPROVAL = [
  "k8s_delete_pod",
  "k8s_drain_node",
  "k8s_rollback_deployment",
  "docker_remove_container",
  "docker_stop_container",
];

if (REQUIRES_APPROVAL.some((t) => toolName.includes(t))) {
  const result = {
    decision: "allow",
    reason: `⚠️ This operation requires approval: ${toolName}\nArguments: ${JSON.stringify(args)}\nThe user will be prompted to confirm.`,
  };
  process.stdout.write(JSON.stringify(result));
} else {
  process.stdout.write(JSON.stringify({ decision: "allow" }));
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}
