import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function terraformValidate(args: Record<string, unknown>): Promise<string> {
  const directory = args.directory as string;
  if (!directory) throw new Error("Terraform directory is required");

  const lines: string[] = [];

  // Validate
  try {
    const { stdout } = await execFileAsync("terraform", ["validate", "-json"], {
      cwd: directory,
      timeout: 30000,
    });
    const result = JSON.parse(stdout);
    if (result.valid) {
      lines.push("Validation: PASSED");
    } else {
      lines.push("Validation: FAILED");
      for (const diag of result.diagnostics || []) {
        lines.push(`  ${diag.severity}: ${diag.summary}`);
        if (diag.detail) lines.push(`    ${diag.detail}`);
      }
    }
  } catch (error: any) {
    lines.push(`Validation error: ${error.stderr || error.message}`);
  }

  // Format check
  try {
    const { stdout } = await execFileAsync("terraform", ["fmt", "-check", "-diff"], {
      cwd: directory,
      timeout: 30000,
    });
    if (stdout.trim()) {
      lines.push("", "Formatting issues:", stdout);
    } else {
      lines.push("", "Formatting: OK");
    }
  } catch (error: any) {
    if (error.stdout?.trim()) {
      lines.push("", "Formatting issues:", error.stdout);
    } else {
      lines.push("", `Format check error: ${error.message}`);
    }
  }

  return lines.join("\n");
}
