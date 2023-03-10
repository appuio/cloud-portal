import { ClusterRole } from '../../src/app/types/clusterRole';

export function createClusterRole(beName: string): ClusterRole {
  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'ClusterRole',
    metadata: {
      name: `billingentities-${beName}-admin`,
    },
    rules: [
      {
        verbs: ['get', 'update', 'create', 'watch', 'patch', 'delete'],
        apiGroups: ['rbac.authorization.k8s.io'],
        resources: ['clusterrolebindings'],
        resourceNames: [`billingentities-${beName}-admin`],
      },
      {
        verbs: ['get'],
        apiGroups: ['rbac.appuio.io'],
        resources: ['billingentities'],
        resourceNames: [beName],
      },
    ],
  };
}
