import { getDockerClient } from "../../utils/docker_client.js";
import { formatTable, formatBytes } from "../../utils/formatter.js";

export async function listImages(args: Record<string, unknown>): Promise<string> {
  const docker = getDockerClient();
  const images = await docker.listImages({ all: (args.all as boolean) || false });

  if (images.length === 0) {
    return "No images found.";
  }

  const headers = ["REPOSITORY:TAG", "IMAGE ID", "SIZE", "CREATED"];
  const rows = images.map((img) => {
    const tags = (img.RepoTags || ["<none>"]).join(", ");
    const created = new Date(img.Created * 1000);
    const age = Math.floor((Date.now() - created.getTime()) / 86400000);

    return [
      tags,
      img.Id.replace("sha256:", "").substring(0, 12),
      formatBytes(img.Size),
      `${age}d ago`,
    ];
  });

  return `Docker images:\n\n${formatTable(headers, rows)}`;
}

export async function inspectImage(args: Record<string, unknown>): Promise<string> {
  const docker = getDockerClient();
  const name = args.name as string || args.id as string;
  if (!name) throw new Error("Image name or ID is required");

  const image = docker.getImage(name);
  const info = await image.inspect();

  const lines = [
    `Image: ${(info.RepoTags || []).join(", ")}`,
    `ID:    ${info.Id.replace("sha256:", "").substring(0, 12)}`,
    `Size:  ${formatBytes(info.Size)}`,
    `Arch:  ${info.Architecture}`,
    `OS:    ${info.Os}`,
    "",
    `Cmd:   ${(info.Config.Cmd || []).join(" ")}`,
    `Env:   ${(info.Config.Env || []).length} variables`,
  ];

  const layers = info.RootFS?.Layers || [];
  lines.push(`Layers: ${layers.length}`);

  return lines.join("\n");
}
