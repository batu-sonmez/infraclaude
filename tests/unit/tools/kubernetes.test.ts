import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the k8s client before importing modules
vi.mock("../../../src/utils/k8s_client.js", () => ({
  getCoreV1Api: vi.fn(),
  getAppsV1Api: vi.fn(),
  getMetricsApi: vi.fn(),
  getCurrentContext: () => "test-context",
  getClusterName: () => "test-cluster",
}));

import { registerKubernetesTools, handleKubernetesTool } from "../../../src/tools/kubernetes/index.js";
import { getCoreV1Api, getAppsV1Api } from "../../../src/utils/k8s_client.js";

describe("Kubernetes Tools", () => {
  describe("registerKubernetesTools", () => {
    it("registers all expected tools", () => {
      const tools = registerKubernetesTools();
      expect(tools.length).toBeGreaterThan(10);

      const toolNames = tools.map((t) => t.name);
      expect(toolNames).toContain("k8s_get_pods");
      expect(toolNames).toContain("k8s_describe_pod");
      expect(toolNames).toContain("k8s_get_pod_logs");
      expect(toolNames).toContain("k8s_get_events");
      expect(toolNames).toContain("k8s_top_pods");
      expect(toolNames).toContain("k8s_get_deployments");
      expect(toolNames).toContain("k8s_rollout_status");
      expect(toolNames).toContain("k8s_get_services");
      expect(toolNames).toContain("k8s_get_nodes");
    });

    it("all tools have valid schemas", () => {
      const tools = registerKubernetesTools();
      for (const tool of tools) {
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe("object");
      }
    });
  });

  describe("handleKubernetesTool — k8s_get_pods", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("lists pods in a namespace", async () => {
      const mockApi = {
        listNamespacedPod: vi.fn().mockResolvedValue({
          body: {
            items: [
              {
                metadata: { name: "test-pod", creationTimestamp: new Date().toISOString() },
                status: {
                  phase: "Running",
                  containerStatuses: [
                    { name: "main", ready: true, restartCount: 0 },
                  ],
                },
                spec: { containers: [{ name: "main" }] },
              },
            ],
          },
        }),
      };
      vi.mocked(getCoreV1Api).mockReturnValue(mockApi as any);

      const result = await handleKubernetesTool("k8s_get_pods", { namespace: "default" });
      expect(result).toContain("test-pod");
      expect(result).toContain("Running");
    });

    it("returns message when no pods found", async () => {
      const mockApi = {
        listNamespacedPod: vi.fn().mockResolvedValue({
          body: { items: [] },
        }),
      };
      vi.mocked(getCoreV1Api).mockReturnValue(mockApi as any);

      const result = await handleKubernetesTool("k8s_get_pods", { namespace: "empty" });
      expect(result).toContain("No pods found");
    });
  });

  describe("handleKubernetesTool — k8s_get_deployments", () => {
    it("lists deployments", async () => {
      const mockApi = {
        listNamespacedDeployment: vi.fn().mockResolvedValue({
          body: {
            items: [
              {
                metadata: { name: "web-app", creationTimestamp: new Date().toISOString() },
                spec: { replicas: 3, strategy: { type: "RollingUpdate" } },
                status: {
                  readyReplicas: 3,
                  updatedReplicas: 3,
                  availableReplicas: 3,
                },
              },
            ],
          },
        }),
      };
      vi.mocked(getAppsV1Api).mockReturnValue(mockApi as any);

      const result = await handleKubernetesTool("k8s_get_deployments", { namespace: "default" });
      expect(result).toContain("web-app");
      expect(result).toContain("3/3");
    });
  });

  describe("handleKubernetesTool — unknown tool", () => {
    it("throws for unknown tool", async () => {
      await expect(handleKubernetesTool("k8s_unknown", {})).rejects.toThrow("Unknown Kubernetes tool");
    });
  });
});
