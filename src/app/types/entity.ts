export interface KubeObject {
  metadata: {
    name: string;
    namespace?: string;
    creationTimestamp?: string;
    annotations?: { [key: string]: string };
    labels?: { [key: string]: string };
    uid?: string;
    resourceVersion?: string;
    generateName?: string;
    [key: string]: unknown;
  };
  kind: string;
  apiVersion: string;
}
