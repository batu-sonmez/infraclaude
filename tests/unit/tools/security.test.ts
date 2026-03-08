import { describe, it, expect, vi } from "vitest";

vi.mock("../../../src/utils/k8s_client.js", () => ({
  getCoreV1Api: vi.fn(),
  getAppsV1Api: vi.fn(),
}));

import { registerSecurityTools } from "../../../src/tools/security/index.js";

describe("Security Tools", () => {
  describe("registerSecurityTools", () => {
    it("registers expected tools", () => {
      const tools = registerSecurityTools();
      const names = tools.map((t) => t.name);

      expect(names).toContain("security_trivy_scan");
      expect(names).toContain("security_gitleaks_scan");
      expect(names).toContain("security_k8s_audit");
    });

    it("all tools have valid schemas", () => {
      const tools = registerSecurityTools();
      for (const tool of tools) {
        expect(tool.name).toMatch(/^security_/);
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema.type).toBe("object");
      }
    });
  });
});
