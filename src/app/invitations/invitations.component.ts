import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { InvitationCollectionService } from '../store/invitation-collection.service';
import { Invitation, TargetStatus } from '../types/invitation';
import { catchError, combineLatestAll, forkJoin, map, Observable, of, take } from 'rxjs';
import { faCheck, faDollarSign, faInfo, faSitemap, faUserGroup, faWarning } from '@fortawesome/free-solid-svg-icons';
import * as dayjs from 'dayjs';
import { Condition } from '../types/status';
import { switchMap } from 'rxjs/operators';
import { OrganizationCollectionService } from '../store/organization-collection.service';
import { BillingEntityCollectionService } from '../store/billingentity-collection.service';
import { Organization } from '../types/organization';
import { BillingEntity } from '../types/billing-entity';
import { getBillingEntityFromClusterRoleName } from '../store/entity-filter';

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

  constructor(
    private invitationService: InvitationCollectionService,
    private organizationService: OrganizationCollectionService,
    private billingService: BillingEntityCollectionService
  ) {}

  ngOnInit(): void {
    this.payload$ = this.invitationService.getAllMemoized().pipe(
      switchMap((invitations) => {
        return forkJoin([of(invitations), this.fetchOrganizations$(invitations), this.fetchBilling$(invitations)]);
      }),
      map(([invitations, organizations, billingEntities]) => {
        return {
          invitations: invitations.map((inv) => {
            const bePermissions = this.collectBillingPermissions(inv, billingEntities);
            const orgPermissions = this.collectOrgPermissions(inv, organizations);
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

  private fetchOrganizations$(invitations: Invitation[]): Observable<Organization[]> {
    const orgNames = invitations
      .map(
        (inv) => inv.status?.targetStatuses.filter((status) => status.targetRef.kind === 'OrganizationMembers') ?? []
      )
      .flatMap((statusArr) => statusArr.map((status) => status.targetRef.namespace ?? ''));

    const uniqueOrgNames = [...new Set(orgNames)];

    const organization$ = uniqueOrgNames.map((org) => this.organizationService.getByKeyMemoized(org).pipe(take(1)));
    return forkJoin(organization$).pipe(
      combineLatestAll(),
      catchError((err) => {
        console.error('could not fetch organization', err);
        return of([]); // fallback to empty list in case we can't read an organization (permission failure, etc.)
      })
    );
  }

  private fetchBilling$(invitations: Invitation[]): Observable<BillingEntity[]> {
    const beNames = invitations
      .map((inv) => inv.status?.targetStatuses.filter((status) => status.targetRef.kind === 'ClusterRoleBinding') ?? [])
      .flatMap((statusArr) => statusArr.map((status) => getBillingEntityFromClusterRoleName(status.targetRef.name)));
    const uniqueNames = [...new Set(beNames)];

    const billing$ = uniqueNames.map((be) => this.billingService.getByKeyMemoized(be).pipe(take(1)));
    return forkJoin(billing$).pipe(
      combineLatestAll(),
      catchError((err) => {
        console.error('could not fetch billing entities to resolve display name, resort to fallback value', err);
        return of([]);
      })
    );
  }

  private collectBillingPermissions(inv: Invitation, billingEntities: BillingEntity[]): PermissionRecord[] {
    const bePermissions: PermissionRecord[] = [];

    inv.status?.targetStatuses
      ?.filter((status) => status.targetRef.kind === 'ClusterRoleBinding')
      .forEach((status) => {
        let record = bePermissions.find((p) => p.slug === status.targetRef.namespace);
        if (!record) {
          record = {
            kind: 'billingentities',
            slug: getBillingEntityFromClusterRoleName(status.targetRef.name),
            displayName: this.getBillingDisplayName(billingEntities, status),
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

  private collectOrgPermissions(inv: Invitation, organizations: Organization[]): PermissionRecord[] {
    const orgPermissions: PermissionRecord[] = [];
    inv.status?.targetStatuses
      ?.filter((status) => status.targetRef.kind === 'RoleBinding')
      .forEach((status) => {
        let record = orgPermissions.find((p) => p.slug === status.targetRef.namespace);
        if (!record) {
          record = {
            kind: 'organizations',
            slug: status.targetRef.namespace ?? '',
            displayName: this.getOrganizationDisplayName(organizations, status),
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

  private getOrganizationDisplayName(organizations: Organization[], status: TargetStatus): string {
    return (
      organizations.find((org) => org.metadata.name === status.targetRef.namespace)?.spec.displayName ??
      status.targetRef.namespace ??
      ''
    );
  }

  private getBillingDisplayName(billingEntities: BillingEntity[], status: TargetStatus): string {
    const beName = getBillingEntityFromClusterRoleName(status.targetRef.name);
    return billingEntities.find((be) => be.metadata.name === beName)?.spec.name ?? beName;
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
  slug: string;
  displayName?: string;
  viewer: boolean;
  admin: boolean;
  teams?: string[];
}
