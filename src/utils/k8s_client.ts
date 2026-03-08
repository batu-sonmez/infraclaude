import * as k8s from "@kubernetes/client-node";
import config from "./config.js";

let kubeConfig: k8s.KubeConfig | null = null;

function getKubeConfig(): k8s.KubeConfig {
  if (!kubeConfig) {
    kubeConfig = new k8s.KubeConfig();
    try {
      kubeConfig.loadFromDefault();
    } catch {
      kubeConfig.loadFromFile(config.kubeconfig);
    }
  }
  return kubeConfig;
}

export function getCoreV1Api(): k8s.CoreV1Api {
  return getKubeConfig().makeApiClient(k8s.CoreV1Api);
}

export function getAppsV1Api(): k8s.AppsV1Api {
  return getKubeConfig().makeApiClient(k8s.AppsV1Api);
}

export function getMetricsApi(): k8s.CustomObjectsApi {
  return getKubeConfig().makeApiClient(k8s.CustomObjectsApi);
}

export function getCurrentContext(): string {
  return getKubeConfig().getCurrentContext();
}

export function getClusterName(): string {
  const kc = getKubeConfig();
  const context = kc.getCurrentContext();
  const ctx = kc.getContextObject(context);
  return ctx?.cluster || "unknown";
}
