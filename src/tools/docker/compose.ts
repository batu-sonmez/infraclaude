import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function composePs(args: Record<string, unknown>): Promise<string> {
  const directory = (args.directory as string) || ".";
  try {
    const { stdout } = await execFileAsync("docker", ["compose", "ps", "--format", "table"], {
      cwd: directory,
      timeout: 30000,
    });
    return stdout.trim() || "No compose services found.";
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to run docker compose ps: ${msg}`);
  }
}

export async function composeLogs(args: Record<string, unknown>): Promise<string> {
  const directory = (args.directory as string) || ".";
  const service = args.service as string | undefined;
  const tail = (args.tail as number) || 100;

  const composeArgs = ["compose", "logs", "--no-color", `--tail=${tail}`];
  if (service) composeArgs.push(service);

  try {
    const { stdout } = await execFileAsync("docker", composeArgs, {
      cwd: directory,
      timeout: 30000,
    });
    return stdout.trim() || "No compose logs found.";
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get compose logs: ${msg}`);
  }
}
