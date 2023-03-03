import { KubeObject } from './entity';

export const RoleBindingPermissions = { group: 'rbac.authorization.k8s.io', resource: 'rolebindings' };

export interface RoleBinding extends KubeObject {
  kind: 'RoleBinding';
  apiVersion: 'rbac.authorization.k8s.io/v1';
  metadata: {
    namespace: string;
    name: string;
    [key: string]: unknown;
  };
  roleRef: { apiGroup: string; kind: 'ClusterRole' | 'Role'; name: string };
  subjects: Subject[];
}

export interface Subject {
  kind: 'User' | 'Group' | 'ServiceAccount';
  name: string;
  apiGroup?: string;
  namespace?: string;
}
