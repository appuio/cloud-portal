import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatestWith, map, Observable, Subscription } from 'rxjs';
import { faAdd, faEdit, faInfoCircle, faTrash, faUserGroup, faWarning } from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { ActivatedRoute, Router } from '@angular/router';
import { selectQueryParam } from '../store/router.selectors';
import { Team } from '../types/team';
import { JoinTeamDialogComponent } from './join-team-dialog/join-team-dialog.component';
import { ConfirmationService } from 'primeng/api';
import { OrganizationCollectionService } from '../store/organization-collection.service';
import { TeamCollectionService } from '../store/team-collection.service';
import { Organization } from '../types/organization';

interface Payload {
  organization: Organization;
  teams: Team[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsComponent implements OnInit, OnDestroy {
  payload$?: Observable<Payload>;
  selectedOrganization?: Observable<Organization | undefined>;

  faInfo = faInfoCircle;
  faWarning = faWarning;
  faEdit = faEdit;
  faAdd = faAdd;
  faTrash = faTrash;
  faUserGroup = faUserGroup;
  subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private organizationService: OrganizationCollectionService,
    private teamService: TeamCollectionService
  ) {}

  ngOnInit(): void {
    this.selectedOrganization = this.organizationService.selectedOrganization$;
    this.selectedOrganization?.subscribe((org) => {
      console.log('org', org);
      if (!org) {
        return;
      }
      const organizationName = org.metadata.name;
      this.payload$ = this.teamService.getAllInNamespaceMemoized(organizationName).pipe(
        combineLatestWith(
          this.teamService.canEdit(organizationName),
          this.teamService.canEdit(organizationName),
          this.teamService.canDelete(organizationName)
        ),
        map(([teams, canCreate, canEdit, canDelete]) => {
          console.log('lol', teams, canCreate, canEdit, canDelete);
          return {
            teams,
            organization: org,
            canEdit: canEdit,
            canCreate: canCreate,
            canDelete: canDelete,
          } satisfies Payload;
        })
      );
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
        this.subscriptions.push(
          this.teamService.delete(team).subscribe({
            next: () => {
              console.log('deleted team', team.metadata.name);
            },
            error: (err) => {
              console.error('could not delete team:', err);
            },
          })
        );
      },
    });
  }
}
