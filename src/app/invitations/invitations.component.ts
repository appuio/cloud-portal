import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { InvitationCollectionService } from '../store/invitation-collection.service';
import { Invitation } from '../types/invitation';
import { map, Observable } from 'rxjs';
import { faCheck, faDollarSign, faInfo, faSitemap, faUserGroup, faWarning } from '@fortawesome/free-solid-svg-icons';
import * as dayjs from 'dayjs';
import { Condition } from '../types/status';

@Component({
  selector: 'app-invitations',
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationsComponent implements OnInit {
  payload$?: Observable<Payload>;

  faWarning = faWarning;
  faInfo = faInfo;
  faCheck = faCheck;
  faSitemap = faSitemap;
  faDollarSign = faDollarSign;
  faUserGroup = faUserGroup;

  constructor(private invitationService: InvitationCollectionService) {}

  ngOnInit(): void {
    this.payload$ = this.invitationService.getAllMemoized().pipe(
      map((invitations) => {
        return {
          invitations: invitations.map((inv) => {
            const bePermissions = this.collectBillingPermissions(inv);
            const orgPermissions = this.collectOrgPermissions(inv);
            const expires = dayjs(inv.status?.validUntil);
            const hasExpired = expires.isBefore(dayjs());
            return {
              expires: `${expires.format('LLLL')} (${expires.fromNow()})`,
              hasExpired: hasExpired,
              model: inv,
              permissionTable: [...bePermissions, ...orgPermissions],
            } satisfies InvitationViewModel;
          }),
        } satisfies Payload;
      })
    );
  }

  private collectBillingPermissions(inv: Invitation): PermissionRecord[] {
    const bePermissions: PermissionRecord[] = [];

    inv.status?.targetStatuses
      ?.filter((status) => status.targetRef.kind === 'ClusterRoleBinding')
      .forEach((status) => {
        let record = bePermissions.find((p) => p.name === status.targetRef.namespace);
        if (!record) {
          record = {
            kind: 'billingentities',
            name: status.targetRef.name.replace('billingentities-', '').replace('-viewer', '').replace('-admin', ''),
            viewer: status.targetRef.name.includes('-viewer'),
            admin: status.targetRef.name.includes('-admin'),
          };
          bePermissions.push(record);
        }

        if (status.targetRef.name.includes('-viewer')) {
          record.viewer = true;
        }
        if (status.targetRef.name.includes('-admin')) {
          record.admin = true;
        }
      });
    return bePermissions;
  }

  private collectOrgPermissions(inv: Invitation): PermissionRecord[] {
    const orgPermissions: PermissionRecord[] = [];
    inv.status?.targetStatuses
      ?.filter((status) => status.targetRef.kind === 'RoleBinding')
      .forEach((status) => {
        let record = orgPermissions.find((p) => p.name === status.targetRef.namespace);
        if (!record) {
          record = {
            kind: 'organizations',
            name: status.targetRef.namespace ?? '',
            viewer: status.targetRef.name === 'control-api:organization-viewer',
            admin: status.targetRef.name === 'control-api:organization-admin',
            teams: inv.status?.targetStatuses
              .filter(
                (teamStatus) =>
                  teamStatus.targetRef.kind === 'Team' && teamStatus.targetRef.namespace === status.targetRef.namespace
              )
              .map((teamStatus) => teamStatus.targetRef.name),
          };
          orgPermissions.push(record);
          return;
        }
        switch (status.targetRef.name) {
          case 'control-api:organization-viewer': {
            record.viewer = true;
            break;
          }
          case 'control-api:organization-admin': {
            record.admin = true;
            break;
          }
        }
      });
    return orgPermissions;
  }

  severityOfCondition(condition: Condition): string {
    switch (condition.status) {
      case 'True':
        return 'success';
      case 'False':
        return 'danger';
      case 'Unknown':
        return 'info';
    }
  }
}

interface Payload {
  invitations: InvitationViewModel[];
}

interface InvitationViewModel {
  model: Invitation;
  expires: string;
  hasExpired: boolean;
  permissionTable: PermissionRecord[];
}

interface PermissionRecord {
  kind: 'organizations' | 'billingentities';
  name: string;
  viewer: boolean;
  admin: boolean;
  teams?: string[];
}
