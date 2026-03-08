import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function diskUsage(args: Record<string, unknown>): Promise<string> {
  const path = args.path as string | undefined;

  try {
    if (path) {
      const { stdout } = await execFileAsync("du", ["-sh", path], { timeout: 30000 });
      return `Disk usage for '${path}':\n${stdout.trim()}`;
    }

    const { stdout } = await execFileAsync("df", ["-h"], { timeout: 10000 });
    return `Disk usage:\n\n${stdout.trim()}`;
  } catch (error: any) {
    throw new Error(`Failed to get disk usage: ${error.message}`);
  }
}
