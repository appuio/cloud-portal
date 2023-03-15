import { Invitation, TargetRef } from '../../src/app/types/invitation';
import * as dayjs from 'dayjs';

export interface InvitationConfig {
  redeemed?: 'redeemed' | 'pending';
  email?: 'sendFailed' | 'sent';
  organizations?: { name: string; role?: 'admin' | 'viewer' | 'both'; teams?: string[] }[];
  billingEntities?: { name: string; role: 'admin' | 'viewer' | 'both' }[];
}

export function createInvitation(cfg: InvitationConfig): Invitation {
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
    status: {
      validUntil: dayjs().add(3, 'months').toISOString(),
      token: 'supersecret',
      conditions: [],
    },
  };
  if (cfg.redeemed === 'redeemed' && inv.status && inv.status.conditions) {
    inv.status.conditions.push({ status: 'True', message: 'Redeemed by "appuio#dev"', type: 'Redeemed' });
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
      refs.push(
        {
          name: org.name,
          kind: 'Organization',
          apiGroup: 'irrelevant',
        },
        {
          name: 'members',
          namespace: org.name,
          kind: 'OrganizationMembers',
          apiGroup: 'irrelevant',
        }
      );
      if (org.role === 'admin' || org.role === 'both') {
        refs.push({
          name: 'control-api:organization-admin',
          namespace: org.name,
          kind: 'RoleBinding',
          apiGroup: 'irrelevant',
        });
      }
      if (org.role === 'viewer' || org.role === 'both') {
        refs.push({
          name: 'control-api:organization-viewer',
          namespace: org.name,
          kind: 'RoleBinding',
          apiGroup: 'irrelevant',
        });
      }
      if (org.teams) {
        org.teams.forEach((team) => {
          refs.push({
            name: team,
            namespace: org.name,
            kind: 'Team',
            apiGroup: 'irrelevant',
          });
        });
      }
    });
  }

  if (cfg.billingEntities) {
    cfg.billingEntities.forEach((be) => {
      if (be.role === 'admin' || be.role === 'both') {
        refs.push({
          name: `${be.name}-admin`,
          kind: 'ClusterRoleBinding',
          apiGroup: 'irrelevant',
        });
      }
      if (be.role === 'viewer' || be.role === 'both') {
        refs.push({
          name: `${be.name}-viewer`,
          kind: 'ClusterRoleBinding',
          apiGroup: 'irrelevant',
        });
      }
    });
  }
  inv.spec.targetRefs = refs;
  return inv;
}
