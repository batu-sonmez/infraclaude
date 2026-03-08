import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function listProcesses(args: Record<string, unknown>): Promise<string> {
  const sortBy = (args.sort_by as string) || "memory";
  const limit = (args.limit as number) || 20;

  const sortFlag = sortBy === "cpu" ? "-%cpu" : "-%mem";

  try {
    const { stdout } = await execFileAsync(
      "ps",
      ["aux", `--sort=${sortFlag}`],
      { timeout: 10000 }
    );

    const lines = stdout.trim().split("\n");
    const header = lines[0];
    const processes = lines.slice(1, limit + 1);

    return `Top ${processes.length} processes by ${sortBy}:\n\n${header}\n${processes.join("\n")}`;
  } catch (error: any) {
    throw new Error(`Failed to list processes: ${error.message}`);
  }
}
