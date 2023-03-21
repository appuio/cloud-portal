import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import {
  faCheck,
  faClose,
  faDollarSign,
  faInfo,
  faSitemap,
  faUserGroup,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { Condition } from '../../types/status';
import { Organization } from '../../types/organization';
import { BillingEntity } from '../../types/billing-entity';
import { Team } from '../../types/team';
import { Invitation } from '../../types/invitation';
import { getBillingEntityFromClusterRoleName } from '../../store/entity-filter';
import { catchError, combineLatestAll, forkJoin, from, map, Observable, of, take } from 'rxjs';
import { OrganizationCollectionService } from '../../store/organization-collection.service';
import { BillingEntityCollectionService } from '../../store/billingentity-collection.service';
import { TeamCollectionService } from '../../store/team-collection.service';

@Component({
  selector: 'app-invitation-detail',
  templateUrl: './invitation-detail.component.html',
  styleUrls: ['./invitation-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationDetailComponent implements OnInit {
  @Input()
  invitation!: Invitation;
  @Input()
  showCloseButton = true;

  faWarning = faWarning;
  faInfo = faInfo;
  faCheck = faCheck;
  faSitemap = faSitemap;
  faDollarSign = faDollarSign;
  faUserGroup = faUserGroup;
  faClose = faClose;

  payload$?: Observable<Payload>;

  constructor(
    private organizationService: OrganizationCollectionService,
    private billingService: BillingEntityCollectionService,
    private teamService: TeamCollectionService
  ) {}

  ngOnInit(): void {
    this.payload$ = forkJoin([
      this.fetchOrganizations$(this.invitation),
      this.fetchBilling$(this.invitation),
      this.fetchTeams$(this.invitation),
    ]).pipe(
      map(([organizations, billingEntities, teams]) => {
        const orgPermissions = this.collectOrgPermissions(this.invitation, organizations, teams);
        const bePermissions = this.collectBillingPermissions(this.invitation, billingEntities);
        const expires = new Date(this.invitation.status?.validUntil ?? '');
        const hasExpired = new Date().getTime() >= expires.getTime();
        return {
          expires: expires,
          hasExpired: hasExpired,
          model: this.invitation,
          permissionTable: [...orgPermissions, ...bePermissions],
          isPending: this.isPending(),
        } satisfies Payload;
      })
    );
  }

  private isPending(): boolean {
    return !this.invitation.status?.conditions?.some((cond) => cond.type === 'Redeemed') ?? true;
  }

  private fetchOrganizations$(invitation: Invitation): Observable<Organization[]> {
    const orgNames =
      invitation.spec.targetRefs
        ?.filter((ref) => ref.kind === 'OrganizationMembers' || ref.namespace)
        .map((ref) => ref.namespace ?? '') ?? [];

    const uniqueNames = [...new Set(orgNames)];

    if (uniqueNames.length === 0) {
      return of([]);
    }

    const organization$ = uniqueNames.map((org) =>
      this.organizationService.getByKeyMemoized(org).pipe(
        catchError(() => {
          console.warn(`could not fetch organization '${org}' to resolve display name, resort to fallback value`);
          return of({
            kind: 'Organization',
            apiVersion: 'organization.appuio.io/v1',
            metadata: {
              name: org,
            },
            spec: {
              displayName: org,
            },
          } satisfies Organization);
        })
      )
    );
    return from(organization$).pipe(combineLatestAll());
  }

  private fetchTeams$(invitation: Invitation): Observable<Team[]> {
    const teamNames =
      invitation.spec.targetRefs?.filter((ref) => ref.kind === 'Team').map((ref) => `${ref.namespace}/${ref.name}`) ??
      [];

    if (teamNames.length === 0) {
      return of([]);
    }

    const teams$ = teamNames.map((team) =>
      this.teamService.getByKeyMemoized(team).pipe(
        take(1),
        catchError(() => {
          console.warn(`could not fetch team '${team}' to resolve display name, resort to fallback value`);
          const teamName = team.split('/');
          return of({
            kind: 'Team',
            apiVersion: 'appuio.io/v1',
            metadata: {
              name: teamName[1],
              namespace: teamName[0],
            },
            spec: {
              displayName: teamName[1],
              userRefs: [],
            },
          } satisfies Team);
        })
      )
    );
    return from(teams$).pipe(combineLatestAll());
  }

  private fetchBilling$(invitation: Invitation): Observable<BillingEntity[]> {
    const beNames =
      invitation.spec.targetRefs
        ?.filter((ref) => ref.kind === 'ClusterRoleBinding')
        .map((ref) => getBillingEntityFromClusterRoleName(ref.name)) ?? [];

    if (beNames.length === 0) {
      return of([]);
    }
    const billing$ = beNames.map((be) =>
      this.billingService.getByKeyMemoized(be).pipe(
        take(1),
        catchError(() => {
          console.warn(`could not fetch billing entity '${be}' to resolve display name, resort to fallback value`);
          return of({
            kind: 'BillingEntity',
            apiVersion: 'billing.appuio.io/v1',
            metadata: {
              name: be,
            },
            spec: {
              name: be,
            },
          } satisfies BillingEntity);
        })
      )
    );
    return from(billing$).pipe(combineLatestAll());
  }
  private collectBillingPermissions(inv: Invitation, billingEntities: BillingEntity[]): PermissionRecord[] {
    const bePermissions: PermissionRecord[] = [];
    inv.spec.targetRefs
      ?.filter((ref) => ref.kind === 'ClusterRoleBinding')
      .forEach((ref) => {
        const beName = getBillingEntityFromClusterRoleName(ref.name);
        let record = bePermissions.find((p) => p.slug === beName);
        if (!record) {
          record = {
            kind: 'billingentities',
            slug: beName,
            displayName: this.getBillingDisplayName(billingEntities, beName),
          };
          bePermissions.push(record);
        }

        if (ref.name.includes('-viewer')) {
          record.viewer = true;
        }
        if (ref.name.includes('-admin')) {
          record.admin = true;
        }
      });
    return bePermissions;
  }

  private collectOrgPermissions(inv: Invitation, organizations: Organization[], teams: Team[]): PermissionRecord[] {
    const orgPermissions: PermissionRecord[] = [];
    inv.spec.targetRefs
      ?.filter((ref) => ref.kind === 'RoleBinding')
      .forEach((ref) => {
        let record = orgPermissions.find((p) => p.slug === ref.namespace);
        if (!record) {
          record = {
            kind: 'organizations',
            slug: ref.namespace ?? '',
            displayName: this.getOrganizationDisplayName(organizations, ref.namespace ?? ''),
          };
          orgPermissions.push(record);
        }
        switch (ref.name) {
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
    inv.spec.targetRefs
      ?.filter((teamRef) => teamRef.kind === 'Team')
      .forEach((ref) => {
        let record = orgPermissions.find((p) => p.slug === ref.namespace);
        if (!record) {
          record = {
            kind: 'organizations',
            slug: ref.namespace ?? '',
            displayName: this.getOrganizationDisplayName(organizations, ref.namespace ?? ''),
          };
          orgPermissions.push(record);
        }
        if (!record.teams) {
          record.teams = [];
        }
        record.teams.push({
          slug: ref.name,
          displayName: this.getTeamDisplayName(teams, ref.name, ref.namespace ?? ''),
        });
      });
    return orgPermissions;
  }

  private getOrganizationDisplayName(organizations: Organization[], name: string): string {
    return organizations.find((org) => org.metadata.name === name)?.spec.displayName ?? name;
  }

  private getBillingDisplayName(billingEntities: BillingEntity[], beName: string): string {
    return billingEntities.find((be) => be.metadata.name === beName)?.spec.name ?? beName;
  }

  private getTeamDisplayName(teams: Team[], name: string, namespace: string): string {
    return (
      teams.find((team) => team.metadata.name === name && team.metadata.namespace === namespace)?.spec.displayName ??
      name
    );
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
  model: Invitation;
  expires: Date;
  hasExpired: boolean;
  isPending: boolean;
  permissionTable: PermissionRecord[];
}

interface PermissionRecord {
  kind: 'organizations' | 'billingentities';
  slug: string;
  displayName?: string;
  viewer?: boolean;
  admin?: boolean;
  teams?: { slug: string; displayName?: string }[];
}
