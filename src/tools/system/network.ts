import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function networkConnections(args: Record<string, unknown>): Promise<string> {
  const state = args.state as string | undefined;

  try {
    // Try ss first, fall back to netstat
    try {
      const ssArgs = ["-tuln"];
      if (state) ssArgs.push("state", state);
      const { stdout } = await execFileAsync("ss", ssArgs, { timeout: 10000 });
      return `Network connections:\n\n${stdout.trim()}`;
    } catch {
      const { stdout } = await execFileAsync("netstat", ["-tuln"], { timeout: 10000 });
      return `Network connections:\n\n${stdout.trim()}`;
    }
  } catch (error: any) {
    throw new Error(`Failed to get network connections: ${error.message}`);
  }
}
