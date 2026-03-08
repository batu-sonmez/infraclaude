import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function terraformPlan(args: Record<string, unknown>): Promise<string> {
  const directory = args.directory as string;
  if (!directory) throw new Error("Terraform directory is required");

  try {
    const { stdout, stderr } = await execFileAsync("terraform", ["plan", "-no-color", "-input=false"], {
      cwd: directory,
      timeout: 120000,
    });
    return `Terraform plan for '${directory}':\n\n${stdout}${stderr ? `\nWarnings:\n${stderr}` : ""}`;
  } catch (error: any) {
    throw new Error(`Terraform plan failed: ${error.stderr || error.message}`);
  }
}
