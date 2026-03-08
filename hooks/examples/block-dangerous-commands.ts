/**
 * Claude Code Hook: Block dangerous infrastructure commands
 *
 * This hook runs before tool execution and blocks operations
 * that are classified as too dangerous for automated execution.
 */

const BLOCKED_PATTERNS = [
  /k8s_delete_namespace/,
  /k8s_delete_deployment/,
  /terraform_apply/,
  /terraform_destroy/,
];

const input = await readStdin();
const data = JSON.parse(input);
const toolName: string = data.tool_name || "";

for (const pattern of BLOCKED_PATTERNS) {
  if (pattern.test(toolName)) {
    const result = {
      decision: "block",
      reason: `🛑 Blocked: '${toolName}' is a destructive operation that must be performed manually via CLI.`,
    };
    process.stdout.write(JSON.stringify(result));
    process.exit(0);
  }
}

process.stdout.write(JSON.stringify({ decision: "allow" }));

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}
