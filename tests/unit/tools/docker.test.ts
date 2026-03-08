import { describe, it, expect, vi } from "vitest";

vi.mock("../../../src/utils/docker_client.js", () => ({
  getDockerClient: vi.fn(() => ({
    listContainers: vi.fn().mockResolvedValue([
      {
        Id: "abc123",
        Names: ["/web-app"],
        Image: "nginx:latest",
        State: "running",
        Status: "Up 2 hours",
        Ports: [{ PrivatePort: 80, PublicPort: 8080, Type: "tcp" }],
        Created: Math.floor(Date.now() / 1000) - 7200,
      },
    ]),
    listImages: vi.fn().mockResolvedValue([
      {
        Id: "sha256:abc",
        RepoTags: ["nginx:latest"],
        Size: 157286400,
        Created: Math.floor(Date.now() / 1000) - 86400,
      },
    ]),
    getContainer: vi.fn(() => ({
      inspect: vi.fn().mockResolvedValue({
        Id: "abc123",
        Name: "/web-app",
        State: { Status: "running", Running: true },
        Config: { Image: "nginx:latest" },
      }),
      logs: vi.fn().mockResolvedValue("2025-01-01 log line 1\n2025-01-01 log line 2"),
    })),
    listNetworks: vi.fn().mockResolvedValue([
      { Id: "net1", Name: "bridge", Driver: "bridge", Scope: "local" },
    ]),
  })),
}));

import { registerDockerTools } from "../../../src/tools/docker/index.js";

describe("Docker Tools", () => {
  describe("registerDockerTools", () => {
    it("registers expected tools", () => {
      const tools = registerDockerTools();
      expect(tools.length).toBeGreaterThan(5);

      const names = tools.map((t) => t.name);
      expect(names).toContain("docker_list_containers");
      expect(names).toContain("docker_inspect_container");
      expect(names).toContain("docker_container_logs");
      expect(names).toContain("docker_list_images");
    });

    it("all tools have valid schemas", () => {
      const tools = registerDockerTools();
      for (const tool of tools) {
        expect(tool.name).toMatch(/^docker_/);
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema.type).toBe("object");
      }
    });
  });
});
