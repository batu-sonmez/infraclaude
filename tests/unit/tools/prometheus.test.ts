import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../src/utils/config.js", () => ({
  default: { prometheusUrl: "http://localhost:9090" },
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { registerPrometheusTools } from "../../../src/tools/prometheus/index.js";

describe("Prometheus Tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerPrometheusTools", () => {
    it("registers expected tools", () => {
      const tools = registerPrometheusTools();
      const names = tools.map((t) => t.name);

      expect(names).toContain("prom_instant_query");
      expect(names).toContain("prom_range_query");
      expect(names).toContain("prom_active_alerts");
      expect(names).toContain("prom_alert_rules");
      expect(names).toContain("prom_targets");
    });

    it("all tools have valid schemas", () => {
      const tools = registerPrometheusTools();
      for (const tool of tools) {
        expect(tool.name).toMatch(/^prom_/);
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema.type).toBe("object");
      }
    });
  });
});
