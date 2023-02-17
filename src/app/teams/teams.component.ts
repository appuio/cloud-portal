import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectFocusOrganizationName } from '../store/app.selectors';
import { map, Observable, Subscription } from 'rxjs';
import { Entity, EntityState } from '../types/entity';
import { faAdd, faEdit, faInfoCircle, faTrash, faUserGroup, faWarning } from '@fortawesome/free-solid-svg-icons';
import { Verb } from '../store/app.reducer';
import { DialogService } from 'primeng/dynamicdialog';
import { ActivatedRoute, Router } from '@angular/router';
import { selectQueryParam } from '../store/router.selectors';
import { Team } from '../types/team';
import { selectHasTeamPermission, selectTeams } from './store/team.selectors';
import { deleteTeam, loadTeamPermissions, loadTeams } from './store/team.actions';
import { JoinTeamDialogComponent } from './join-team-dialog/join-team-dialog.component';
import { ConfirmationService } from 'primeng/api';
import { OrganizationCollectionService } from '../store/organization-collection.service';
import { setFocusOrganization } from '../store/app.actions';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsComponent implements OnInit, OnDestroy {
  teams$: Observable<Entity<Team[]>> = this.store.select(selectTeams);
  hasCreatePermission$ = this.store.select(selectHasTeamPermission(Verb.Create));
  hasUpdatePermission$ = this.store.select(selectHasTeamPermission(Verb.Update));
  hasDeletePermission$ = this.store.select(selectHasTeamPermission(Verb.Delete));
  faInfo = faInfoCircle;
  faWarning = faWarning;
  faEdit = faEdit;
  faAdd = faAdd;
  faTrash = faTrash;
  faUserGroup = faUserGroup;
  subscriptions: Subscription[] = [];
  organizationName?: string;

  constructor(
    private store: Store,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private organizationService: OrganizationCollectionService
  ) {}

  ngOnInit(): void {
    // eslint-disable-next-line ngrx/no-store-subscription
    this.store.select(selectFocusOrganizationName).subscribe((organizationName) => {
      // special hook: If user has no default organization set, this selection never happens and teams do not get loaded.
      if (!organizationName) {
        this.subscriptions.push(
          this.organizationService.filteredEntities$.pipe(map((orgs) => orgs[0])).subscribe((org) => {
            this.organizationName = org.metadata.name;
            this.store.dispatch(setFocusOrganization({ focusOrganizationName: this.organizationName }));
          })
        );
      } else {
        this.organizationName = organizationName;
        // eslint-disable-next-line ngrx/avoid-dispatching-multiple-actions-sequentially
        this.store.dispatch(loadTeams());
        // eslint-disable-next-line ngrx/avoid-dispatching-multiple-actions-sequentially
        this.store.dispatch(loadTeamPermissions());
      }
    });

    this.subscriptions.push(
      this.store
        .select(selectQueryParam('showJoinDialog'))
        // eslint-disable-next-line ngrx/no-store-subscription
        .subscribe((showJoinDialog) => {
          if (showJoinDialog) {
            this.openJoinTeamDialog();
            this.router.navigate([], {
              relativeTo: this.activatedRoute,
              queryParams: { showJoinDialog: undefined },
              queryParamsHandling: 'merge',
            });
          }
        })
    );
  }

  isLoading(zones: Entity<Team[]>): boolean {
    return zones.state === EntityState.Loading;
  }

  isListEmpty(zones: Entity<Team[]>): boolean {
    return zones.state === EntityState.Loaded && zones.value.length === 0;
  }

  hasLoadingFailed(zones: Entity<Team[]>): boolean {
    return zones.state === EntityState.Failed;
  }

  openJoinTeamDialog(): void {
    this.dialogService.open(JoinTeamDialogComponent, {
      modal: true,
      closable: true,
      header: $localize`Join Team`,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  deleteTeam(team: Team): void {
    this.confirmationService.confirm({
      header: 'Delete team',
      message: $localize`Are you sure that you want to delete the team '${team.spec.displayName}'?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.dispatch(deleteTeam({ name: team.metadata.name }));
      },
    });
  }
}
