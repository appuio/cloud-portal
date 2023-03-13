import { KubeObject } from './entity';
import { Subject } from './role-binding';

export const ClusterRoleBindingPermissions = { group: 'rbac.authorization.k8s.io', resource: 'clusterrolebindings' };

export interface ClusterRoleBinding extends KubeObject {
  apiVersion: 'rbac.authorization.k8s.io/v1';
  kind: 'ClusterRoleBinding';
  roleRef: {
    apiGroup: string;
    kind: 'ClusterRole';
    name: string;
  };
  subjects?: Subject[];
}
