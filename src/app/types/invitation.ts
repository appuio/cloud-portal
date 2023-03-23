import { KubeObject } from './entity';
import { Condition } from './status';

export const InvitationPermissions = { group: 'user.appuio.io', resource: 'invitations' };
export const invitationTokenLocalStorageKey = 'invitationToken';

export interface Invitation extends KubeObject {
  apiVersion: 'user.appuio.io/v1';
  kind: 'Invitation';
  spec: InvitationSpec;
  status?: InvitationStatus;
}

export interface InvitationSpec {
  note?: string;
  email?: string;
  targetRefs?: TargetRef[];
}

export interface TargetRef {
  apiGroup: string;
  kind: string;
  name: string;
  namespace?: string;
}
export interface InvitationStatus {
  token: string;
  validUntil: string;
  targetStatuses?: TargetStatus[];
  redeemedBy?: string;
  conditions?: Condition[];
}

export interface TargetStatus {
  condition: Condition;
  targetRef: TargetRef;
}

export interface InvitationRedeemRequest extends KubeObject {
  apiVersion: 'user.appuio.io/v1';
  kind: 'InvitationRedeemRequest';
  token: string;
}
