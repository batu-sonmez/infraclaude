import { execFile } from "child_process";
import { promisify } from "util";
import { formatTable } from "../../utils/formatter.js";

const execFileAsync = promisify(execFile);

export async function trivyScanImage(args: Record<string, unknown>): Promise<string> {
  const image = args.image as string;
  if (!image) throw new Error("Image name is required");
  const severity = (args.severity as string) || "HIGH,CRITICAL";

  try {
    const { stdout } = await execFileAsync(
      "trivy",
      ["image", "--format", "json", "--severity", severity, image],
      { timeout: 120000 }
    );

    const report = JSON.parse(stdout);
    const results = report.Results || [];
    const lines: string[] = [`Trivy scan results for '${image}':`];

    let totalVulns = 0;
    for (const result of results) {
      const vulns = result.Vulnerabilities || [];
      totalVulns += vulns.length;

      if (vulns.length === 0) continue;

      lines.push(`\nTarget: ${result.Target} (${result.Type})`);
      const headers = ["ID", "SEVERITY", "PACKAGE", "VERSION", "FIXED IN", "TITLE"];
      const rows = vulns.slice(0, 20).map((v: any) => [
        v.VulnerabilityID || "",
        v.Severity || "",
        v.PkgName || "",
        v.InstalledVersion || "",
        v.FixedVersion || "N/A",
        (v.Title || "").substring(0, 40),
      ]);
      lines.push(formatTable(headers, rows));

      if (vulns.length > 20) {
        lines.push(`  ... and ${vulns.length - 20} more vulnerabilities`);
      }
    }

    if (totalVulns === 0) {
      lines.push(`\nNo ${severity} vulnerabilities found.`);
    } else {
      lines.push(`\nTotal: ${totalVulns} vulnerabilities found.`);
    }

    return lines.join("\n");
  } catch (error: any) {
    if (error.code === "ENOENT") {
      throw new Error("Trivy is not installed. Install it from https://aquasecurity.github.io/trivy/");
    }
    throw new Error(`Trivy scan failed: ${error.stderr || error.message}`);
  }
}
