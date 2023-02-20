import { KubeObject } from './entity';

export interface OrganizationMembers extends KubeObject {
  kind: 'OrganizationMembers';
  apiVersion: 'appuio.io/v1';
  metadata: {
    [key: string]: unknown;
    namespace: string;
    name: string;
  };
  spec: {
    userRefs?: {
      name: string;
    }[];
  };
}
