import { describe, it, expect } from "vitest";
import { handleDockerTool } from "../../src/tools/docker/index.js";

// These tests require a running Docker daemon
// Run with: npm run test:integration

describe("Docker Integration Tests", () => {
  it("can list containers", async () => {
    const result = await handleDockerTool("docker_list_containers", { all: true });
    expect(typeof result).toBe("string");
  });

  it("can list images", async () => {
    const result = await handleDockerTool("docker_list_images", {});
    expect(typeof result).toBe("string");
  });

  it("can list networks", async () => {
    const result = await handleDockerTool("docker_list_networks", {});
    expect(typeof result).toBe("string");
  });
});
