import { ClusterRoleBinding } from '../../src/app/types/clusterrole-binding';

export interface ClusterRoleBindingConfig {
  name: string;
  users: string[];
}

export function createClusterRoleBinding(config: ClusterRoleBindingConfig): ClusterRoleBinding {
  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'ClusterRoleBinding',
    metadata: {
      name: config.name,
    },
    roleRef: {
      name: config.name,
      kind: 'ClusterRole',
      apiGroup: 'rbac.authorization.k8s.io',
    },
    subjects: config.users.map((user) => {
      return {
        kind: 'User',
        apiGroup: 'rbac.authorization.k8s.io',
        name: user,
      };
    }),
  };
}
