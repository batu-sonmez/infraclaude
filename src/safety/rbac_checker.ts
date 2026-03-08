import * as k8s from "@kubernetes/client-node";

export interface RbacCheckResult {
  allowed: boolean;
  reason: string;
}

export class RbacChecker {
  private authApi: k8s.AuthorizationV1Api;

  constructor() {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    this.authApi = kc.makeApiClient(k8s.AuthorizationV1Api);
  }

  async canI(
    verb: string,
    resource: string,
    namespace?: string
  ): Promise<RbacCheckResult> {
    try {
      const review: k8s.V1SelfSubjectAccessReview = {
        apiVersion: "authorization.k8s.io/v1",
        kind: "SelfSubjectAccessReview",
        spec: {
          resourceAttributes: {
            verb,
            resource,
            namespace: namespace || "default",
          },
        },
      };

      const response = await this.authApi.createSelfSubjectAccessReview(review);
      const allowed = response.body.status?.allowed ?? false;

      return {
        allowed,
        reason: allowed
          ? `Allowed: ${verb} ${resource} in ${namespace || "default"}`
          : `Denied: ${verb} ${resource} in ${namespace || "default"} — ${response.body.status?.reason || "insufficient permissions"}`,
      };
    } catch (error) {
      return {
        allowed: false,
        reason: `RBAC check failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
