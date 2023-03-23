import { Invitation, InvitationRedeemRequest, TargetRef } from '../../src/app/types/invitation';

export interface InvitationConfig {
  redeemed?: 'redeemed' | 'pending';
  email?: 'sendFailed' | 'sent';
  organizations?: { name: string; role?: 'admin' | 'viewer' | 'both'; teams?: string[] }[];
  billingEntities?: { name: string; role: 'admin' | 'viewer' | 'both' }[];
  hasStatus?: boolean;
}

export function createInvitation(cfg: InvitationConfig): Invitation {
  const now = new Date();
  const inv: Invitation = {
    apiVersion: 'user.appuio.io/v1',
    kind: 'Invitation',
    metadata: {
      name: 'e303b166-5d66-4151-8f5f-b84ba84a7559',
    },
    spec: {
      email: 'dev@nxt.engineering',
      note: 'New Employee working for 👁️',
      targetRefs: [],
    },
  };
  if (cfg.hasStatus) {
    inv.status = {
      validUntil: new Date(now.setMonth(now.getMonth() + 3)).toISOString(),
      token: 'supersecret',
      conditions: [],
    };
  }
  if (cfg.redeemed === 'redeemed' && inv.status && inv.status.conditions) {
    inv.status.conditions.push({ status: 'True', message: 'Redeemed by "appuio#dev"', type: 'Redeemed' });
    inv.status.redeemedBy = 'appuio#dev';
  }
  if (inv.status && inv.status.conditions) {
    switch (cfg.email) {
      case 'sendFailed': {
        inv.status.conditions.push({ status: 'False', message: 'The email could not be sent', type: 'EmailSent' });
        break;
      }
      case 'sent': {
        inv.status.conditions.push({ status: 'True', message: '', type: 'EmailSent' });
        break;
      }
    }
  }
  const refs: TargetRef[] = [];
  // cypress can't handle the `?.forEach()` notation here for some obscure reason...
  if (cfg.organizations) {
    cfg.organizations.forEach((org) => {
      refs.push({
        name: 'members',
        namespace: org.name,
        kind: 'OrganizationMembers',
        apiGroup: 'appuio.io',
      });
      if (org.teams) {
        org.teams.forEach((team) => {
          refs.push({
            name: team,
            namespace: org.name,
            kind: 'Team',
            apiGroup: 'appuio.io',
          });
        });
      }
      if (org.role === 'admin' || org.role === 'both') {
        refs.push({
          name: 'control-api:organization-admin',
          namespace: org.name,
          kind: 'RoleBinding',
          apiGroup: 'rbac.authorization.k8s.io',
        });
      }
      if (org.role === 'viewer' || org.role === 'both') {
        refs.push({
          name: 'control-api:organization-viewer',
          namespace: org.name,
          kind: 'RoleBinding',
          apiGroup: 'rbac.authorization.k8s.io',
        });
      }
    });
  }

  if (cfg.billingEntities) {
    cfg.billingEntities.forEach((be) => {
      if (be.role === 'admin' || be.role === 'both') {
        refs.push({
          name: `billingentities-${be.name}-admin`,
          kind: 'ClusterRoleBinding',
          apiGroup: 'rbac.authorization.k8s.io',
        });
      }
      if (be.role === 'viewer' || be.role === 'both') {
        refs.push({
          name: `billingentities-${be.name}-viewer`,
          kind: 'ClusterRoleBinding',
          apiGroup: 'rbac.authorization.k8s.io',
        });
      }
    });
  }
  inv.spec.targetRefs = refs;
  return inv;
}
export function createInvitationRedeemRequest(name: string, token: string): InvitationRedeemRequest {
  return {
    kind: 'InvitationRedeemRequest',
    apiVersion: 'user.appuio.io/v1',
    token: token,
    metadata: {
      name: name,
    },
  };
}
