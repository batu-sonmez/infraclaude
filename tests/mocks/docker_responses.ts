export const mockContainerList = [
  {
    Id: "abc123def456",
    Names: ["/web-app"],
    Image: "web-app:latest",
    State: "running",
    Status: "Up 2 hours",
    Ports: [{ PrivatePort: 8080, PublicPort: 80, Type: "tcp" }],
    Created: Math.floor(Date.now() / 1000) - 7200,
  },
  {
    Id: "ghi789jkl012",
    Names: ["/redis"],
    Image: "redis:7-alpine",
    State: "running",
    Status: "Up 5 days",
    Ports: [{ PrivatePort: 6379, Type: "tcp" }],
    Created: Math.floor(Date.now() / 1000) - 432000,
  },
];

export const mockContainerInspect = {
  Id: "abc123def456",
  Name: "/web-app",
  State: {
    Status: "running",
    Running: true,
    Pid: 12345,
    ExitCode: 0,
    StartedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  Config: {
    Image: "web-app:latest",
    Env: ["NODE_ENV=production", "PORT=8080"],
    Cmd: ["node", "server.js"],
  },
  NetworkSettings: {
    IPAddress: "172.17.0.2",
    Ports: {
      "8080/tcp": [{ HostIp: "0.0.0.0", HostPort: "80" }],
    },
  },
  HostConfig: {
    Memory: 536870912,
    NanoCpus: 1000000000,
  },
};

export const mockContainerStats = {
  cpu_stats: {
    cpu_usage: { total_usage: 500000000 },
    system_cpu_usage: 10000000000,
  },
  precpu_stats: {
    cpu_usage: { total_usage: 490000000 },
    system_cpu_usage: 9900000000,
  },
  memory_stats: {
    usage: 134217728,
    limit: 536870912,
  },
  networks: {
    eth0: {
      rx_bytes: 1048576,
      tx_bytes: 524288,
    },
  },
};

export const mockImageList = [
  {
    Id: "sha256:abc123",
    RepoTags: ["web-app:latest"],
    Size: 157286400,
    Created: Math.floor(Date.now() / 1000) - 86400,
  },
  {
    Id: "sha256:def456",
    RepoTags: ["redis:7-alpine"],
    Size: 31457280,
    Created: Math.floor(Date.now() / 1000) - 604800,
  },
];
