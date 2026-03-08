import { getCoreV1Api } from "../../utils/k8s_client.js";
import { formatTable, formatAge } from "../../utils/formatter.js";

export async function getEvents(args: Record<string, unknown>): Promise<string> {
  const api = getCoreV1Api();
  const namespace = (args.namespace as string) || "default";
  const type = args.type as string | undefined; // Normal, Warning
  const fieldSelector = args.field_selector as string | undefined;
  const limit = (args.limit as number) || 50;

  let selector = fieldSelector;
  if (type) {
    selector = selector ? `${selector},type=${type}` : `type=${type}`;
  }

  const response = await api.listNamespacedEvent(
    namespace,
    undefined,
    undefined,
    undefined,
    selector
  );

  const events = response.body.items
    .sort((a, b) => {
      const aTime = a.lastTimestamp || a.metadata?.creationTimestamp;
      const bTime = b.lastTimestamp || b.metadata?.creationTimestamp;
      return new Date(bTime || 0).getTime() - new Date(aTime || 0).getTime();
    })
    .slice(0, limit);

  if (events.length === 0) {
    return `No events found in namespace '${namespace}'${type ? ` of type '${type}'` : ""}.`;
  }

  const headers = ["LAST SEEN", "TYPE", "REASON", "OBJECT", "MESSAGE"];
  const rows = events.map((e) => [
    e.lastTimestamp ? formatAge(e.lastTimestamp) : "?",
    e.type || "Normal",
    e.reason || "",
    `${e.involvedObject.kind}/${e.involvedObject.name}`,
    (e.message || "").substring(0, 80),
  ]);

  return `Events in namespace '${namespace}':\n\n${formatTable(headers, rows)}`;
}
