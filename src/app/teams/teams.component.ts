import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatestWith, map, Observable, of, Subscription } from 'rxjs';
import { faAdd, faEdit, faInfoCircle, faTrash, faUserGroup, faWarning } from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { selectQueryParam } from '../store/router.selectors';
import { Team } from '../types/team';
import { JoinTeamDialogComponent } from './join-team-dialog/join-team-dialog.component';
import { ConfirmationService, SharedModule } from 'primeng/api';
import { OrganizationCollectionService } from '../store/organization-collection.service';
import { TeamCollectionService } from '../store/team-collection.service';
import { Organization } from '../types/organization';
import { switchMap } from 'rxjs/operators';
import { MessagesModule } from 'primeng/messages';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { NgIf, NgFor } from '@angular/common';
import { LetDirective } from '@ngrx/component';
import { NotificationService } from '../core/notification.service';
import { DisplayNamePipe } from '../display-name.pipe';

interface Payload {
  organization?: Organization;
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
  standalone: true,
  imports: [
    LetDirective,
    NgIf,
    ButtonModule,
    RippleModule,
    FontAwesomeModule,
    RouterLink,
    NgFor,
    MessagesModule,
    SharedModule,
    DisplayNamePipe,
  ],
})
export class TeamsComponent implements OnInit, OnDestroy {
  payload$?: Observable<Payload>;

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
    private teamService: TeamCollectionService,
    private notificationService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscribePayloads();

    this.subscriptions.push(
      this.store
        .select(selectQueryParam('showJoinDialog'))
        // eslint-disable-next-line ngrx/no-store-subscription
        .subscribe((showJoinDialog) => {
          if (showJoinDialog) {
            this.openJoinTeamDialog();
            void this.router.navigate([], {
              relativeTo: this.activatedRoute,
              queryParams: { showJoinDialog: undefined },
              queryParamsHandling: 'merge',
            });
          }
        })
    );
  }

  private subscribePayloads(): void {
    this.payload$ = this.organizationService.getAllMemoized().pipe(
      switchMap((orgs) => {
        if (orgs.length === 0) {
          return of(undefined);
        }
        return this.organizationService.selectedOrganization$;
      }),
      switchMap((org) => {
        if (!org) {
          return of({
            teams: [],
            canCreate: false,
            canDelete: false,
            canEdit: false,
          } satisfies Payload);
        }
        const organizationName = org.metadata.name;
        return this.teamService.getAllInNamespaceMemoized(organizationName).pipe(
          combineLatestWith(
            this.teamService.canCreate(organizationName),
            this.teamService.canEdit(organizationName),
            this.teamService.canDelete(organizationName)
          ),
          map(([teams, canCreate, canEdit, canDelete]) => {
            return {
              teams,
              organization: org,
              canEdit: canEdit,
              canCreate: canCreate,
              canDelete: canDelete,
            } satisfies Payload;
          })
        );
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
    const teamName = team.spec.displayName || team.metadata.name;
    this.confirmationService.confirm({
      header: 'Delete team',
      message: $localize`Are you sure that you want to delete the team '${teamName}'?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.subscriptions.push(
          this.teamService.delete(team).subscribe({
            next: (name) => {
              this.notificationService.showSuccessMessage($localize`Successfully deleted team '${name}'`);
              // After deleting, ensure that the displayed list doesn't contain the deleted element anymore.
              this.subscribePayloads();
              this.changeDetectorRef.markForCheck();
            },
            error: () => {
              this.notificationService.showErrorMessage($localize`Could not delete team '${teamName}'. `);
              this.subscribePayloads();
              this.changeDetectorRef.markForCheck();
            },
          })
        );
      },
    });
  }
}
