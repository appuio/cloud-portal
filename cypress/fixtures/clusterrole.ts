import { ClusterRole } from '../../src/app/types/clusterRole';

export function createClusterRole(beName: string, admin: boolean): ClusterRole {
  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'ClusterRole',
    metadata: {
      name: `billingentities-${beName}-${admin ? 'admin' : 'viewer'}`,
    },
    rules: [
      {
        verbs: admin ? ['get', 'update', 'create', 'watch', 'patch', 'delete'] : ['get', 'watch'],
        apiGroups: ['rbac.authorization.k8s.io'],
        resources: ['clusterrolebindings'],
        resourceNames: [`billingentities-${beName}-${admin ? 'admin' : 'viewer'}`],
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
