import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function terraformOutput(args: Record<string, unknown>): Promise<string> {
  const directory = args.directory as string;
  if (!directory) throw new Error("Terraform directory is required");
  const name = args.name as string | undefined;

  const tfArgs = ["output", "-json"];
  if (name) tfArgs.push(name);

  try {
    const { stdout } = await execFileAsync("terraform", tfArgs, {
      cwd: directory,
      timeout: 30000,
    });
    const parsed = JSON.parse(stdout);
    return `Terraform outputs${name ? ` (${name})` : ""}:\n\n${JSON.stringify(parsed, null, 2)}`;
  } catch (error: any) {
    throw new Error(`Terraform output failed: ${error.stderr || error.message}`);
  }
}
