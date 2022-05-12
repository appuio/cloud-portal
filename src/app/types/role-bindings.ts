export interface RoleBindings {
  metadata: {
    namespace: string;
    name: string;
    [key: string]: unknown;
  };
  roleRef: { apiGroup: string; kind: 'ClusterRole' | 'Role'; name: string };
  subjects: { apiGroup: string; kind: 'User' | 'Group' | 'ServiceAccount'; name: string }[];
}

export interface RoleBindingList {
  kind: 'RoleBindingsList';
  apiVersion: 'rbac.authorization.k8s.io/v1';
  metadata: {
    resourceVersion: string;
  };
  items: RoleBindings[];
}
