import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError, combineLatestWith, forkJoin, map, Observable, of } from 'rxjs';
import { SelectItem, SharedModule } from 'primeng/api';
import { faSave, faWarning } from '@fortawesome/free-solid-svg-icons';
import { Organization } from '../../types/organization';
import { IdentityService } from '../../core/identity.service';
import { User } from '../../types/user';
import { OrganizationCollectionService } from '../../store/organization-collection.service';
import { OrganizationMembersCollectionService } from '../../store/organizationmembers-collection.service';
import { UserCollectionService } from '../../store/user-collection.service';
import { switchMap } from 'rxjs/operators';
import { defaultIfStatusCode } from '../../store/kubernetes-collection.service';
import { MessagesModule } from 'primeng/messages';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { NgIf } from '@angular/common';
import { LetDirective, PushPipe } from '@ngrx/component';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    LetDirective,
    NgIf,
    ReactiveFormsModule,
    MessageModule,
    DropdownModule,
    ButtonModule,
    RippleModule,
    FontAwesomeModule,
    MessagesModule,
    SharedModule,
    PushPipe,
  ],
})
export class UserEditComponent implements OnInit {
  faSave = faSave;
  faWarning = faWarning;

  form = new FormGroup({
    defaultOrganizationRef: new FormControl<SelectItem<string> | undefined>(undefined),
  });

  payload$?: Observable<Payload>;

  constructor(
    private identityService: IdentityService,
    private organizationService: OrganizationCollectionService,
    private orgMembersService: OrganizationMembersCollectionService,
    public userService: UserCollectionService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const userName = this.identityService.getUsername();
    this.payload$ = this.userService.getByKeyMemoized(userName).pipe(
      catchError(defaultIfStatusCode(this.userService.newUser(userName), [401, 403, 404])),
      switchMap((user) => {
        if (user.metadata.resourceVersion) {
          return of(user);
        }
        // we only have a faked user in the store based on IDP, we need to get the real user object.
        // this case could happen if the user is a first-time user where the actual User object doesn't yet exist in Kubernetes.
        return this.userService.getByKey(userName);
      }),
      combineLatestWith(this.organizationService.getAllMemoized()),
      switchMap(([user, orgs]) => {
        return forkJoin([this.filterOrganizationsForMembership(orgs, userName), of(user)]);
      }),
      map(([selectItems, user]) => {
        this.form.controls.defaultOrganizationRef.setValue(
          selectItems.find((organization) => organization.value === user.spec.preferences?.defaultOrganizationRef)
        );
        return {
          organizationSelectItems: selectItems,
          user,
        } satisfies Payload;
      })
    );
  }

  private filterOrganizationsForMembership(
    organizationList: Organization[],
    userName: string
  ): Observable<SelectItem[]> {
    const orgMembers$ = organizationList.map((organization) =>
      this.orgMembersService.getByKeyMemoized(`${organization.metadata.name}/members`)
    );
    if (orgMembers$.length === 0) {
      return of([]);
    }

    return forkJoin(orgMembers$).pipe(
      map((members) =>
        organizationList
          .filter((o, index) => (members[index].spec.userRefs ?? []).map((userRef) => userRef.name).includes(userName))
          .map((o) => ({
            value: o.metadata.name,
            label: o.spec.displayName ? `${o.spec.displayName} (${o.metadata.name})` : o.metadata.name,
          }))
      )
    );
  }

  save(user: User): void {
    if (!this.form.valid) {
      return;
    }
    const clone = structuredClone(user);
    clone.spec.preferences = {
      ...clone.spec.preferences,
      defaultOrganizationRef: this.form.value.defaultOrganizationRef?.value,
    };
    this.userService.update(clone).subscribe({
      next: () => {
        this.notificationService.showSuccessMessage($localize`Saved successfully`);
      },
      error: () => {
        this.notificationService.showErrorMessage($localize`Could not save user preferences.`);
      },
    });
  }
}

interface Payload {
  organizationSelectItems: SelectItem<string>[];
  user: User;
}
