import config from "../../utils/config.js";
import { formatTable } from "../../utils/formatter.js";

export async function instantQuery(args: Record<string, unknown>): Promise<string> {
  const query = args.query as string;
  if (!query) throw new Error("PromQL query is required");

  const url = `${config.prometheusUrl}/api/v1/query?query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Prometheus query failed: ${res.status} ${res.statusText}`);

  const data = (await res.json()) as { status: string; error?: string; data: { result: Array<{ metric: Record<string, string>; value: [number, string] }> } };
  if (data.status !== "success") throw new Error(`Query error: ${data.error || "unknown"}`);

  const results = data.data.result || [];
  if (results.length === 0) return `No results for query: ${query}`;

  const headers = ["METRIC", "VALUE"];
  const rows = results.map((r) => {
    const labels = Object.entries(r.metric)
      .map(([k, v]) => `${k}="${v}"`)
      .join(", ");
    return [labels || "{}", r.value[1]];
  });

  return `Query: ${query}\n\n${formatTable(headers, rows)}`;
}

export async function rangeQuery(args: Record<string, unknown>): Promise<string> {
  const query = args.query as string;
  if (!query) throw new Error("PromQL query is required");

  const end = (args.end as string) || new Date().toISOString();
  const start = (args.start as string) || new Date(Date.now() - 3600000).toISOString();
  const step = (args.step as string) || "60s";

  const url = `${config.prometheusUrl}/api/v1/query_range?query=${encodeURIComponent(query)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&step=${encodeURIComponent(step)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Prometheus range query failed: ${res.status}`);

  const data = (await res.json()) as { status: string; error?: string; data: { result: Array<{ metric: Record<string, string>; values: [number, string][] }> } };
  if (data.status !== "success") throw new Error(`Query error: ${data.error || "unknown"}`);

  const results = data.data.result || [];
  if (results.length === 0) return `No results for range query: ${query}`;

  const lines: string[] = [`Range query: ${query}`, `Period: ${start} → ${end} (step: ${step})`, ""];

  for (const r of results) {
    const labels = Object.entries(r.metric as Record<string, string>)
      .map(([k, v]) => `${k}="${v}"`)
      .join(", ");
    lines.push(`Metric: ${labels || "{}"}`);

    const values = (r.values as [number, string][]) || [];
    const first5 = values.slice(0, 5);
    const last5 = values.slice(-5);

    for (const [ts, val] of first5) {
      lines.push(`  ${new Date(ts * 1000).toISOString()} → ${val}`);
    }
    if (values.length > 10) {
      lines.push(`  ... (${values.length - 10} more data points) ...`);
    }
    if (values.length > 5) {
      for (const [ts, val] of last5) {
        lines.push(`  ${new Date(ts * 1000).toISOString()} → ${val}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}
