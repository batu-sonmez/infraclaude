import { describe, it, expect } from "vitest";
import { CommandGuard, RiskLevel } from "../../../src/safety/command_guard.js";

describe("CommandGuard", () => {
  const guard = new CommandGuard();

  describe("safe operations", () => {
    it("allows read-only K8s operations", () => {
      const result = guard.check("k8s_get_pods", { namespace: "default" });
      expect(result.blocked).toBe(false);
      expect(result.riskLevel).toBe(RiskLevel.SAFE);
    });

    it("allows pod log retrieval", () => {
      const result = guard.check("k8s_get_pod_logs", { name: "test-pod" });
      expect(result.blocked).toBe(false);
      expect(result.riskLevel).toBe(RiskLevel.SAFE);
    });

    it("allows Prometheus queries", () => {
      const result = guard.check("prom_instant_query", { query: "up" });
      expect(result.blocked).toBe(false);
      expect(result.riskLevel).toBe(RiskLevel.SAFE);
    });

    it("allows Terraform read-only operations", () => {
      const result = guard.check("terraform_plan", { directory: "/app" });
      expect(result.blocked).toBe(false);
      expect(result.riskLevel).toBe(RiskLevel.SAFE);
    });

    it("allows security scanning", () => {
      const result = guard.check("security_trivy_scan", { image: "nginx" });
      expect(result.blocked).toBe(false);
      expect(result.riskLevel).toBe(RiskLevel.SAFE);
    });
  });

  describe("caution operations", () => {
    it("flags scaling as caution", () => {
      const result = guard.check("k8s_scale_deployment", { name: "app", replicas: 3 });
      expect(result.blocked).toBe(false);
      expect(result.riskLevel).toBe(RiskLevel.CAUTION);
    });

    it("flags container restart as caution", () => {
      const result = guard.check("docker_restart_container", { id: "abc123" });
      expect(result.blocked).toBe(false);
      expect(result.riskLevel).toBe(RiskLevel.CAUTION);
    });
  });

  describe("dangerous operations", () => {
    it("allows pod deletion with warning", () => {
      const result = guard.check("k8s_delete_pod", { name: "test", namespace: "default" });
      expect(result.blocked).toBe(false);
      expect(result.riskLevel).toBe(RiskLevel.DANGEROUS);
    });

    it("blocks pod deletion in kube-system", () => {
      const result = guard.check("k8s_delete_pod", { name: "test", namespace: "kube-system" });
      expect(result.blocked).toBe(true);
    });

    it("blocks pod deletion in kube-public", () => {
      const result = guard.check("k8s_delete_pod", { name: "test", namespace: "kube-public" });
      expect(result.blocked).toBe(true);
    });
  });

  describe("blocked operations", () => {
    it("blocks namespace deletion", () => {
      const result = guard.check("k8s_delete_namespace", { name: "production" });
      expect(result.blocked).toBe(true);
      expect(result.riskLevel).toBe(RiskLevel.BLOCKED);
    });

    it("blocks terraform apply", () => {
      const result = guard.check("terraform_apply", { directory: "/infra" });
      expect(result.blocked).toBe(true);
      expect(result.riskLevel).toBe(RiskLevel.BLOCKED);
    });

    it("blocks terraform destroy", () => {
      const result = guard.check("terraform_destroy", {});
      expect(result.blocked).toBe(true);
      expect(result.riskLevel).toBe(RiskLevel.BLOCKED);
    });

    it("blocks unknown tools by default", () => {
      const result = guard.check("some_unknown_tool", {});
      expect(result.blocked).toBe(true);
      expect(result.riskLevel).toBe(RiskLevel.BLOCKED);
    });
  });

  describe("getRiskLevel", () => {
    it("returns correct risk level for known tools", () => {
      expect(guard.getRiskLevel("k8s_get_pods")).toBe(RiskLevel.SAFE);
      expect(guard.getRiskLevel("k8s_scale_deployment")).toBe(RiskLevel.CAUTION);
      expect(guard.getRiskLevel("k8s_delete_pod")).toBe(RiskLevel.DANGEROUS);
      expect(guard.getRiskLevel("k8s_delete_namespace")).toBe(RiskLevel.BLOCKED);
    });

    it("returns BLOCKED for unknown tools", () => {
      expect(guard.getRiskLevel("unknown")).toBe(RiskLevel.BLOCKED);
    });
  });
});
