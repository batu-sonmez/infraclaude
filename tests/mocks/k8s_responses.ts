export const mockPodList = {
  items: [
    {
      metadata: {
        name: "web-app-abc123",
        namespace: "default",
        creationTimestamp: new Date(Date.now() - 3600000).toISOString(),
        labels: { app: "web-app", version: "v1" },
      },
      spec: {
        nodeName: "node-1",
        containers: [
          {
            name: "web",
            image: "web-app:v1.2.3",
            resources: {
              requests: { cpu: "100m", memory: "128Mi" },
              limits: { cpu: "500m", memory: "256Mi" },
            },
          },
        ],
      },
      status: {
        phase: "Running",
        podIP: "10.244.0.5",
        containerStatuses: [
          { name: "web", ready: true, restartCount: 0 },
        ],
      },
    },
    {
      metadata: {
        name: "worker-def456",
        namespace: "default",
        creationTimestamp: new Date(Date.now() - 86400000).toISOString(),
        labels: { app: "worker" },
      },
      spec: {
        nodeName: "node-2",
        containers: [{ name: "worker", image: "worker:v1.0.0" }],
      },
      status: {
        phase: "CrashLoopBackOff",
        containerStatuses: [
          { name: "worker", ready: false, restartCount: 15 },
        ],
      },
    },
  ],
};

export const mockDeploymentList = {
  items: [
    {
      metadata: {
        name: "web-app",
        namespace: "default",
        creationTimestamp: new Date(Date.now() - 604800000).toISOString(),
        generation: 5,
      },
      spec: {
        replicas: 3,
        strategy: { type: "RollingUpdate" },
      },
      status: {
        readyReplicas: 3,
        updatedReplicas: 3,
        availableReplicas: 3,
        observedGeneration: 5,
        conditions: [
          { type: "Available", status: "True", message: "Deployment has minimum availability." },
          { type: "Progressing", status: "True", message: "ReplicaSet has successfully progressed." },
        ],
      },
    },
  ],
};

export const mockEventList = {
  items: [
    {
      type: "Warning",
      reason: "BackOff",
      message: "Back-off restarting failed container",
      involvedObject: { kind: "Pod", name: "worker-def456" },
      lastTimestamp: new Date(Date.now() - 300000).toISOString(),
      metadata: { creationTimestamp: new Date(Date.now() - 300000).toISOString() },
    },
    {
      type: "Normal",
      reason: "Scheduled",
      message: "Successfully assigned default/web-app-abc123 to node-1",
      involvedObject: { kind: "Pod", name: "web-app-abc123" },
      lastTimestamp: new Date(Date.now() - 3600000).toISOString(),
      metadata: { creationTimestamp: new Date(Date.now() - 3600000).toISOString() },
    },
  ],
};

export const mockNodeList = {
  items: [
    {
      metadata: {
        name: "node-1",
        labels: { "node-role.kubernetes.io/control-plane": "" },
        creationTimestamp: new Date(Date.now() - 2592000000).toISOString(),
      },
      spec: { unschedulable: false },
      status: {
        conditions: [{ type: "Ready", status: "True" }],
        nodeInfo: {
          kubeletVersion: "v1.29.0",
          osImage: "Ubuntu 22.04",
          kernelVersion: "5.15.0",
          containerRuntimeVersion: "containerd://1.7.0",
        },
        capacity: { cpu: "4", memory: "16Gi", pods: "110" },
        allocatable: { cpu: "3800m", memory: "15Gi", pods: "110" },
      },
    },
  ],
};
