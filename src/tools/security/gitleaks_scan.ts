import { execFile } from "child_process";
import { promisify } from "util";
import { formatTable } from "../../utils/formatter.js";

const execFileAsync = promisify(execFile);

export async function gitleaksScan(args: Record<string, unknown>): Promise<string> {
  const directory = (args.directory as string) || ".";

  try {
    const { stdout } = await execFileAsync(
      "gitleaks",
      ["detect", "--source", directory, "--report-format", "json", "--no-banner", "--exit-code", "0"],
      { timeout: 60000 }
    );

    const findings = JSON.parse(stdout || "[]");
    if (findings.length === 0) {
      return `Gitleaks scan: No secrets found in '${directory}'.`;
    }

    const headers = ["RULE", "FILE", "LINE", "MATCH"];
    const rows = findings.slice(0, 20).map((f: any) => [
      f.RuleID || "",
      f.File || "",
      String(f.StartLine || ""),
      (f.Match || "").substring(0, 30) + "***",
    ]);

    const result = `Gitleaks scan results for '${directory}':\n\n${formatTable(headers, rows)}`;
    if (findings.length > 20) {
      return result + `\n\n... and ${findings.length - 20} more findings`;
    }
    return result;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      throw new Error("Gitleaks is not installed. Install it from https://github.com/gitleaks/gitleaks");
    }
    throw new Error(`Gitleaks scan failed: ${error.stderr || error.message}`);
  }
}
