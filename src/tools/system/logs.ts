import { execFile } from "child_process";
import { promisify } from "util";
import { readFile } from "fs/promises";

const execFileAsync = promisify(execFile);

export async function systemLogs(args: Record<string, unknown>): Promise<string> {
  const unit = args.unit as string | undefined;
  const lines = (args.lines as number) || 50;
  const path = args.path as string | undefined;

  // If a file path is given, read from file
  if (path) {
    try {
      const content = await readFile(path, "utf-8");
      const allLines = content.trim().split("\n");
      const lastN = allLines.slice(-lines);
      return `Logs from '${path}' (last ${lastN.length} lines):\n\n${lastN.join("\n")}`;
    } catch (error: any) {
      throw new Error(`Failed to read log file: ${error.message}`);
    }
  }

  // Otherwise use journalctl
  try {
    const jArgs = ["--no-pager", `-n${lines}`];
    if (unit) jArgs.push("-u", unit);

    const { stdout } = await execFileAsync("journalctl", jArgs, { timeout: 15000 });
    return `System logs${unit ? ` (${unit})` : ""} (last ${lines} lines):\n\n${stdout.trim()}`;
  } catch (error: any) {
    throw new Error(`Failed to read system logs: ${error.message}`);
  }
}
