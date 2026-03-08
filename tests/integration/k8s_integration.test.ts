import { describe, it, expect } from "vitest";
import { handleKubernetesTool } from "../../src/tools/kubernetes/index.js";

// These tests require a running Kubernetes cluster (minikube)
// Run with: npm run test:integration

describe("Kubernetes Integration Tests", () => {
  it("can list pods in default namespace", async () => {
    const result = await handleKubernetesTool("k8s_get_pods", { namespace: "default" });
    expect(typeof result).toBe("string");
    // Should either show pods or "No pods found"
    expect(result).toBeTruthy();
  });

  it("can list nodes", async () => {
    const result = await handleKubernetesTool("k8s_get_nodes", {});
    expect(result).toContain("Cluster nodes");
  });

  it("can list events", async () => {
    const result = await handleKubernetesTool("k8s_get_events", { namespace: "default" });
    expect(typeof result).toBe("string");
  });

  it("can list deployments", async () => {
    const result = await handleKubernetesTool("k8s_get_deployments", { namespace: "demo" });
    expect(typeof result).toBe("string");
  });
});
