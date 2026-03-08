export function formatTable(headers: string[], rows: string[][]): string {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] || "").length))
  );

  const headerLine = headers
    .map((h, i) => h.padEnd(colWidths[i]))
    .join("  ");
  const separator = colWidths.map((w) => "-".repeat(w)).join("  ");
  const bodyLines = rows.map((row) =>
    row.map((cell, i) => (cell || "").padEnd(colWidths[i])).join("  ")
  );

  return [headerLine, separator, ...bodyLines].join("\n");
}

export function formatAge(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "Ki", "Mi", "Gi", "Ti"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function formatCpu(nanocores: number): string {
  if (nanocores < 1_000_000) return `${Math.floor(nanocores / 1000)}µ`;
  if (nanocores < 1_000_000_000) return `${Math.floor(nanocores / 1_000_000)}m`;
  return `${(nanocores / 1_000_000_000).toFixed(2)}`;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3) + "...";
}
