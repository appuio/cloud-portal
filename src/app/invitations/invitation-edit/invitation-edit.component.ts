import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { faClose, faWarning } from '@fortawesome/free-solid-svg-icons';
import { OrganizationCollectionService } from '../../store/organization-collection.service';
import { BillingEntityCollectionService } from '../../store/billingentity-collection.service';
import { catchError, combineLatestAll, forkJoin, from, map, Observable, of, switchMap, take } from 'rxjs';
import { Organization } from '../../types/organization';
import { BillingEntity } from '../../types/billing-entity';
import { TeamCollectionService } from '../../store/team-collection.service';
import { Team } from '../../types/team';
import { defaultIfStatusCode } from '../../store/kubernetes-collection.service';

@Component({
  selector: 'app-invitation-edit',
  templateUrl: './invitation-edit.component.html',
  styleUrls: ['./invitation-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationEditComponent implements OnInit {
  payload$?: Observable<Payload>;

  faClose = faClose;
  faWarning = faWarning;

  constructor(
    private organizationService: OrganizationCollectionService,
    private billingService: BillingEntityCollectionService,
    private teamService: TeamCollectionService
  ) {}

  ngOnInit(): void {
    this.payload$ = forkJoin([
      this.organizationService.canViewOrganizations$,
      this.billingService.canViewBillingEntities$,
    ]).pipe(
      switchMap(([canViewOrganizations, canViewBillingEntities]) => {
        const organizations$ = canViewOrganizations ? this.organizationService.getAllMemoized() : of([]);
        const billingEntities$ = canViewBillingEntities ? this.fetchBilling$() : of([]);
        return forkJoin([of(canViewOrganizations), organizations$, of(canViewBillingEntities), billingEntities$]);
      }),
      switchMap(([canViewOrganizations, organizations, canViewBillingEntities, billingEntities]) => {
        return forkJoin([
          of(canViewOrganizations),
          of(organizations),
          of(canViewBillingEntities),
          of(billingEntities),
          this.fetchTeamsFromAllOrganizations(organizations),
        ]);
      }),
      map(([canViewOrganizations, organizations, canViewBillingEntities, billingEntities, teams]) => {
        return {
          canViewOrganizations: canViewOrganizations && organizations.length > 0,
          organizations,
          canViewBillingEntities: canViewBillingEntities && billingEntities ? billingEntities.length > 0 : false,
          billingEntities: billingEntities ?? [],
          billingEntitiesFailed: billingEntities === undefined,
          teams,
        } satisfies Payload;
      })
    );
  }

  private fetchBilling$(): Observable<BillingEntity[] | undefined> {
    return this.billingService.getAllMemoized().pipe(
      take(1),
      catchError(() => of(undefined)) // swallows all kinds of errors.
    );
  }

  private fetchTeamsFromAllOrganizations(organizations: Organization[]): Observable<Team[]> {
    // we can't use `getAllMemoized`, since we don't have the permission to list all teams in all namespaces at once.
    // so we have to iterate over every organization we know, list them per namespace and collect/reduce them.
    const allTeamsInAllNamespaces$: Observable<Team[]>[] = organizations.map((org) => {
      return this.teamService
        .getAllInNamespaceMemoized(org.metadata.name)
        .pipe(take(1), catchError(defaultIfStatusCode<Team[]>([], [401, 403])));
    });
    if (allTeamsInAllNamespaces$.length === 0) {
      return of([]);
    }

    return from(allTeamsInAllNamespaces$).pipe(
      combineLatestAll(),
      map((teamInAllNamespaces) => teamInAllNamespaces.flat())
    );
  }
}

interface Payload {
  canViewOrganizations: boolean;
  organizations: Organization[];
  canViewBillingEntities: boolean;
  billingEntities: BillingEntity[];
  billingEntitiesFailed: boolean;
  teams: Team[];
}
