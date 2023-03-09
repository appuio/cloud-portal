import { UserRef } from '../../src/app/types/team';

import { RoleBinding } from 'src/app/types/role-binding';

export interface RoleBindingConfig {
  namespace: string;
  roles: { name: string; userRefs: UserRef[] }[];
}

export function createRoleBindingList(roleBindingConfig: RoleBindingConfig): RoleBinding[] {
  return roleBindingConfig.roles.map((role) => {
    return {
      kind: 'RoleBinding',
      apiVersion: 'rbac.authorization.k8s.io/v1',
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
  });
}
