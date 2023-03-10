import { KubeObject } from './entity';
import { Rule } from './rule';

export const ClusterRolePermissions = { group: 'rbac.authorization.k8s.io', resource: 'clusterroles' };

export interface ClusterRole extends KubeObject {
  apiVersion: 'rbac.authorization.k8s.io/v1';
  kind: 'ClusterRole';
  rules: Rule[];
}
