import config from "../../utils/config.js";
import { formatTable } from "../../utils/formatter.js";

export async function activeAlerts(): Promise<string> {
  const url = `${config.prometheusUrl}/api/v1/alerts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.status}`);

  const data = (await res.json()) as { data: { alerts: Array<{ state: string; labels: Record<string, string>; annotations: Record<string, string> }> } };
  const alerts = data.data?.alerts || [];

  const firing = alerts.filter((a: { state: string }) => a.state === "firing");
  if (firing.length === 0) return "No active alerts firing.";

  const headers = ["ALERT", "STATE", "SEVERITY", "SUMMARY"];
  const rows = firing.map((a: { labels: Record<string, string>; annotations: Record<string, string>; state: string }) => [
    a.labels.alertname || "unknown",
    a.state,
    a.labels.severity || "N/A",
    (a.annotations?.summary || a.annotations?.description || "").substring(0, 60),
  ]);

  return `Active alerts (${firing.length} firing):\n\n${formatTable(headers, rows)}`;
}

export async function alertRules(): Promise<string> {
  const url = `${config.prometheusUrl}/api/v1/rules`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch rules: ${res.status}`);

  const data = (await res.json()) as { data: { groups: Array<{ name: string; interval: string; rules: Array<{ type: string; name: string; state: string; labels: Record<string, string>; alerts: unknown[] }> }> } };
  const groups = data.data?.groups || [];

  const lines: string[] = ["Alert rules:"];

  for (const group of groups) {
    lines.push(`\nGroup: ${group.name} (interval: ${group.interval})`);
    const rules = (group.rules || []).filter((r: { type: string }) => r.type === "alerting");

    if (rules.length === 0) continue;

    const headers = ["RULE", "STATE", "SEVERITY", "ACTIVE"];
    const rows = rules.map((r: { name: string; state: string; labels: Record<string, string>; alerts: unknown[] }) => [
      r.name,
      r.state,
      r.labels?.severity || "N/A",
      String(r.alerts?.length || 0),
    ]);
    lines.push(formatTable(headers, rows));
  }

  return lines.join("\n");
}
