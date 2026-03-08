import { instantQuery, rangeQuery } from "./query.js";
import { activeAlerts, alertRules } from "./alerts.js";
import { scrapeTargets } from "./targets.js";

export function registerPrometheusTools() {
  return [
    {
      name: "prom_instant_query",
      description: "Execute a PromQL instant query and return current values",
      inputSchema: {
        type: "object" as const,
        properties: {
          query: { type: "string", description: "PromQL query expression" },
        },
        required: ["query"],
      },
    },
    {
      name: "prom_range_query",
      description: "Execute a PromQL query over a time range and return series data",
      inputSchema: {
        type: "object" as const,
        properties: {
          query: { type: "string", description: "PromQL query expression" },
          start: { type: "string", description: "Start time (ISO 8601, default: 1h ago)" },
          end: { type: "string", description: "End time (ISO 8601, default: now)" },
          step: { type: "string", description: "Query step (e.g., '60s', '5m', default: '60s')" },
        },
        required: ["query"],
      },
    },
    {
      name: "prom_active_alerts",
      description: "List all currently firing Prometheus alerts",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "prom_alert_rules",
      description: "List all Prometheus alert rules and their current state",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "prom_targets",
      description: "Show Prometheus scrape target health status",
      inputSchema: { type: "object" as const, properties: {} },
    },
  ];
}

export async function handlePrometheusTool(
  name: string,
  args: Record<string, unknown> | undefined
): Promise<string> {
  const a = args || {};
  switch (name) {
    case "prom_instant_query": return instantQuery(a);
    case "prom_range_query": return rangeQuery(a);
    case "prom_active_alerts": return activeAlerts();
    case "prom_alert_rules": return alertRules();
    case "prom_targets": return scrapeTargets();
    default: throw new Error(`Unknown Prometheus tool: ${name}`);
  }
}
