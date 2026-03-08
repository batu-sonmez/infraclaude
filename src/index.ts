#!/usr/bin/env node

import { createInfraClaudeServer } from "./server.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main() {
  const server = createInfraClaudeServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Fatal error starting InfraClaude:", error);
  process.exit(1);
});
