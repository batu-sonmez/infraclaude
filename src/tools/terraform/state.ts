import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function terraformStateList(args: Record<string, unknown>): Promise<string> {
  const directory = args.directory as string;
  if (!directory) throw new Error("Terraform directory is required");

  try {
    const { stdout } = await execFileAsync("terraform", ["state", "list"], {
      cwd: directory,
      timeout: 30000,
    });
    const resources = stdout.trim().split("\n").filter(Boolean);
    if (resources.length === 0) return "No resources in Terraform state.";
    return `Terraform state resources (${resources.length}):\n\n${resources.join("\n")}`;
  } catch (error: any) {
    throw new Error(`Terraform state list failed: ${error.stderr || error.message}`);
  }
}

export async function terraformStateShow(args: Record<string, unknown>): Promise<string> {
  const directory = args.directory as string;
  const resource = args.resource as string;
  if (!directory) throw new Error("Terraform directory is required");
  if (!resource) throw new Error("Resource address is required");

  try {
    const { stdout } = await execFileAsync("terraform", ["state", "show", resource], {
      cwd: directory,
      timeout: 30000,
    });
    return `Terraform resource: ${resource}\n\n${stdout}`;
  } catch (error: any) {
    throw new Error(`Terraform state show failed: ${error.stderr || error.message}`);
  }
}
