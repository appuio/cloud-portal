import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { InvitationCollectionService } from '../store/invitation-collection.service';
import { Invitation } from '../types/invitation';
import { catchError, combineLatestAll, forkJoin, from, map, Observable, of, take } from 'rxjs';
import {
  faCheck,
  faDollarSign,
  faEdit,
  faInfo,
  faSitemap,
  faUserGroup,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import * as dayjs from 'dayjs';
import { Condition } from '../types/status';
import { switchMap } from 'rxjs/operators';
import { OrganizationCollectionService } from '../store/organization-collection.service';
import { BillingEntityCollectionService } from '../store/billingentity-collection.service';
import { Organization } from '../types/organization';
import { BillingEntity } from '../types/billing-entity';
import { getBillingEntityFromClusterRoleName } from '../store/entity-filter';
import { Team } from '../types/team';
import { TeamCollectionService } from '../store/team-collection.service';

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
  faEdit = faEdit;
  faDollarSign = faDollarSign;
  faUserGroup = faUserGroup;

  constructor(
    private invitationService: InvitationCollectionService,
    private organizationService: OrganizationCollectionService,
    private teamService: TeamCollectionService,
    private billingService: BillingEntityCollectionService
  ) {}

  ngOnInit(): void {
    this.payload$ = this.invitationService.getAllMemoized().pipe(
      switchMap((invitations) => {
        return forkJoin([
          of(invitations),
          this.fetchOrganizations$(invitations),
          this.fetchBilling$(invitations),
          this.fetchTeams$(invitations),
        ]);
      }),
      map(([invitations, organizations, billingEntities, teams]) => {
        return {
          invitations: invitations.map((inv) => {
            const bePermissions = this.collectBillingPermissions(inv, billingEntities);
            const orgPermissions = this.collectOrgPermissions(inv, organizations, teams);
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
      .map((inv) => inv.spec.targetRefs?.filter((ref) => ref.kind === 'OrganizationMembers') ?? [])
      .flatMap((statusArr) => statusArr.map((ref) => ref.namespace ?? ''));

    const uniqueNames = [...new Set(orgNames)];

    const organization$ = uniqueNames.map((org) =>
      this.organizationService.getByKeyMemoized(org).pipe(
        take(1),
        catchError(() => {
          console.warn('could not fetch organization to resolve display name, resort to fallback value');
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

  private fetchTeams$(invitations: Invitation[]): Observable<Team[]> {
    const teamNames = invitations
      .map((inv) => inv.spec.targetRefs?.filter((ref) => ref.kind === 'Team') ?? [])
      .flatMap((statusArr) => statusArr.map((ref) => `${ref.namespace}/${ref.name}`));
    const uniqueNames = [...new Set(teamNames)];

    const teams$ = uniqueNames.map((team) =>
      this.teamService.getByKeyMemoized(team).pipe(
        take(1),
        catchError(() => {
          console.warn('could not fetch team to resolve display name, resort to fallback value');
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

  private fetchBilling$(invitations: Invitation[]): Observable<BillingEntity[]> {
    const beNames = invitations
      .map((inv) => inv.spec.targetRefs?.filter((ref) => ref.kind === 'ClusterRoleBinding') ?? [])
      .flatMap((statusArr) => statusArr.map((ref) => getBillingEntityFromClusterRoleName(ref.name)));
    const uniqueNames = [...new Set(beNames)];

    const billing$ = uniqueNames.map((be) =>
      this.billingService.getByKeyMemoized(be).pipe(
        take(1),
        catchError(() => {
          console.warn('could not fetch billing entity to resolve display name, resort to fallback value');
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
        let record = bePermissions.find((p) => p.slug === ref.namespace);
        if (!record) {
          const beName = getBillingEntityFromClusterRoleName(ref.name);
          record = {
            kind: 'billingentities',
            slug: beName,
            displayName: this.getBillingDisplayName(billingEntities, beName),
            viewer: ref.name.includes('-viewer'),
            admin: ref.name.includes('-admin'),
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
  viewer?: boolean;
  admin?: boolean;
  teams?: { slug: string; displayName?: string }[];
}
