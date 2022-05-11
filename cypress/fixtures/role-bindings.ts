import { UserRef } from '../../src/app/types/team';

import { RoleBindingList } from 'src/app/types/role-bindings';

export interface RoleBindingConfig {
  namespace: string;
  roles: { name: string; userRefs: UserRef[] }[];
}

export function createRoleBindingList(roleBindingConfig: RoleBindingConfig): RoleBindingList {
  return {
    kind: 'RoleBindingsList',
    apiVersion: 'rbac.authorization.k8s.io/v1',
    metadata: {
      resourceVersion: '12345',
    },
    items: roleBindingConfig.roles.map((role) => {
      return {
        metadata: { name: role.name, namespace: roleBindingConfig.namespace },
        roleRef: { name: role.name, kind: 'ClusterRole', apiGroup: 'rbac.authorization.k8s.io' },
        subjects: role.userRefs.map((user) => {
          return {
            kind: 'User',
            apiGroup: 'rbac.authorization.k8s.io',
            name: `appuio#${user.name}`,
          };
        }),
      };
    }),
  };
}
