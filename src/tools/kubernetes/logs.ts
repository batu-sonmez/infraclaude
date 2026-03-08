import { getCoreV1Api } from "../../utils/k8s_client.js";

export async function getPodLogs(args: Record<string, unknown>): Promise<string> {
  const api = getCoreV1Api();
  const namespace = (args.namespace as string) || "default";
  const name = args.name as string;
  const container = args.container as string | undefined;
  const tail = (args.tail as number) || 100;
  const since = args.since as string | undefined;
  const previous = (args.previous as boolean) || false;

  if (!name) throw new Error("Pod name is required");

  let sinceSeconds: number | undefined;
  if (since) {
    const match = since.match(/^(\d+)([smhd])$/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
      sinceSeconds = value * (multipliers[unit] || 1);
    }
  }

  const response = await api.readNamespacedPodLog(
    name,
    namespace,
    container,
    undefined,
    undefined,
    undefined,
    undefined,
    previous,
    sinceSeconds,
    tail
  );

  const logs = response.body;
  if (!logs || logs.trim().length === 0) {
    return `No logs found for pod '${name}'${container ? ` container '${container}'` : ""} in namespace '${namespace}'.`;
  }

  const header = `Logs for pod '${name}'${container ? ` (container: ${container})` : ""} in '${namespace}' (last ${tail} lines):`;
  return `${header}\n\n${logs}`;
}
