import Dockerode from "dockerode";

let dockerClient: Dockerode | null = null;

export function getDockerClient(): Dockerode {
  if (!dockerClient) {
    dockerClient = new Dockerode();
  }
  return dockerClient;
}
