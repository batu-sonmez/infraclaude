import config from "../../utils/config.js";
import { formatTable } from "../../utils/formatter.js";

export async function scrapeTargets(): Promise<string> {
  const url = `${config.prometheusUrl}/api/v1/targets`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch targets: ${res.status}`);

  interface Target { labels: Record<string, string>; scrapeUrl: string; health: string; lastScrape: string; lastError: string; }
  const data = (await res.json()) as { data: { activeTargets: Target[] } };
  const activeTargets = data.data?.activeTargets || [];

  if (activeTargets.length === 0) return "No active scrape targets found.";

  const headers = ["JOB", "ENDPOINT", "STATE", "LAST SCRAPE", "ERROR"];
  const rows = activeTargets.map((t: {
    labels: Record<string, string>;
    scrapeUrl: string;
    health: string;
    lastScrape: string;
    lastError: string;
  }) => [
    t.labels.job || "unknown",
    t.scrapeUrl,
    t.health,
    t.lastScrape ? new Date(t.lastScrape).toLocaleTimeString() : "N/A",
    (t.lastError || "").substring(0, 40),
  ]);

  const healthy = activeTargets.filter((t: { health: string }) => t.health === "up").length;
  const total = activeTargets.length;

  return `Scrape targets (${healthy}/${total} healthy):\n\n${formatTable(headers, rows)}`;
}
