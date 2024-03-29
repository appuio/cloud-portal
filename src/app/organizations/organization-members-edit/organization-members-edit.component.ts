import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faClose, faSave, faWarning } from '@fortawesome/free-solid-svg-icons';
import { OrganizationMembers } from '../../types/organization-members';
import { FormArray, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { combineLatestWith, forkJoin, map, Observable, take } from 'rxjs';
import { SharedModule } from 'primeng/api';
import { RoleBinding } from 'src/app/types/role-binding';
import { OrganizationMembersCollectionService } from '../../store/organizationmembers-collection.service';
import { RolebindingCollectionService } from '../../store/rolebinding-collection.service';
import { NavigationService } from '../../shared/navigation.service';
import { MessagesModule } from 'primeng/messages';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BackLinkDirective } from '../../shared/back-link.directive';
import { NgIf, NgFor } from '@angular/common';
import { LetDirective } from '@ngrx/component';
import { NotificationService } from '../../core/notification.service';
import { OrganizationCollectionService } from '../../store/organization-collection.service';
import { Organization } from '../../types/organization';
import { DisplayNamePipe } from '../../display-name.pipe';

interface Payload {
  members: OrganizationMembers;
  roleBindings: RoleBinding[];
  canEdit: boolean;
  organization: Organization;
}

@Component({
  selector: 'app-organization-members-edit',
  templateUrl: './organization-members-edit.component.html',
  styleUrls: ['./organization-members-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    LetDirective,
    NgIf,
    BackLinkDirective,
    FontAwesomeModule,
    ReactiveFormsModule,
    MessageModule,
    NgFor,
    InputTextModule,
    MultiSelectModule,
    ButtonModule,
    RippleModule,
    MessagesModule,
    SharedModule,
    DisplayNamePipe,
  ],
})
export class OrganizationMembersEditComponent implements OnInit {
  faClose = faClose;
  faSave = faSave;
  faWarning = faWarning;
  saving = false;
  form?: FormGroup<{
    userRefs: FormArray<
      FormGroup<{
        userName: FormControl<string>;
        selectedRoles: FormControl<string[]>;
      }>
    >;
  }>;
  payload$?: Observable<Payload>;

  // list of cluster roles that can be assigned by user - currently hard-coded as there's nothing
  // clearly identifying these (e.g. tag or special field)
  readonly allRoleNames = ['control-api:organization-admin', 'control-api:organization-viewer'];
  readonly newUserDefaultRoles = ['control-api:organization-viewer'];
  readonly userNamePrefix = 'appuio#';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private membersService: OrganizationMembersCollectionService,
    private rolebindingService: RolebindingCollectionService,
    private navigationService: NavigationService,
    private notificationService: NotificationService,
    private organizationService: OrganizationCollectionService
  ) {}

  get userRefs(): FormArray | undefined {
    return this.form?.get('userRefs') as FormArray;
  }

  ngOnInit(): void {
    const name = this.activatedRoute.snapshot.paramMap.get('name');
    if (!name) {
      throw new Error('name is required');
    }

    this.payload$ = this.membersService.getByKeyMemoized(`${name}/members`).pipe(
      combineLatestWith(
        this.membersService.canEditMembers(name),
        this.rolebindingService.getAllInNamespaceMemoized(name),
        this.organizationService.getByKeyMemoized(name)
      ),
      map(([members, canEdit, roleBindings, organization]) => {
        const payload = { members, canEdit, roleBindings, organization } satisfies Payload;
        this.initForm(payload);
        return payload;
      })
    );
  }

  initForm(payload: Payload): void {
    const userRoles = this.mapRolesToUsers(payload.roleBindings);
    const members =
      payload.members.spec.userRefs?.map(
        (userRef) =>
          new FormGroup({
            userName: new FormControl(
              { value: userRef.name, disabled: !payload.canEdit },
              { validators: Validators.required, nonNullable: true }
            ),
            selectedRoles: new FormControl(
              {
                value: userRoles[`${this.userNamePrefix}${userRef.name}`],
                disabled: !payload.canEdit,
              },
              { nonNullable: true }
            ),
          })
      ) ?? [];

    this.form = new FormGroup({
      userRefs: new FormArray(members),
    });

    if (payload.canEdit) {
      this.addEmptyFormControl();
    }
  }

  addEmptyFormControl(): void {
    const emptyFormControl = new FormControl();
    emptyFormControl.valueChanges.pipe(take(1)).subscribe(() => {
      emptyFormControl.addValidators(Validators.required);
      emptyRoleDropdown.setValue(this.newUserDefaultRoles);
      this.addEmptyFormControl();
    });
    const emptyRoleDropdown = new FormControl<string[]>([]);
    const emptyFormGroup = new FormGroup({
      userName: emptyFormControl,
      selectedRoles: emptyRoleDropdown,
    });
    this.userRefs?.push(emptyFormGroup);
  }

  mapRolesToUsers(roleBindings: RoleBinding[]): Record<string, string[]> {
    const userRoles: Record<string, string[]> = {};
    roleBindings.forEach((item) => {
      item.subjects.forEach((subj) => {
        if (!userRoles[subj.name]) {
          userRoles[subj.name] = [];
        }
        userRoles[subj.name].push(item.roleRef.name);
      });
    });
    return userRoles;
  }

  save(payload: Payload): void {
    if (!this.form) {
      return;
    }

    const userNames: Set<string> = new Set();
    const rolesToSubjects: Record<string, string[]> = {};

    this.form.getRawValue().userRefs?.forEach(({ userName, selectedRoles }) => {
      userName = userName?.trim();
      if (!userName) {
        return;
      }
      userNames.add(userName);
      selectedRoles?.forEach((role) => {
        if (!rolesToSubjects[role]) {
          rolesToSubjects[role] = [];
        }
        rolesToSubjects[role].push(userName);
      });
    });

    forkJoin([
      this.membersService.update(this.newOrganizationMembers(payload.members, Array.from(userNames))),
      ...payload.roleBindings.map((roleBinding) =>
        this.rolebindingService.update({
          metadata: { ...roleBinding.metadata },
          roleRef: { ...roleBinding.roleRef },
          subjects: rolesToSubjects[roleBinding.roleRef.name].map((sub) => {
            return {
              apiGroup: 'rbac.authorization.k8s.io',
              kind: 'User',
              name: `${this.userNamePrefix}${sub}`,
            };
          }),
        })
      ),
    ]).subscribe({
      next: () => {
        this.notificationService.showSuccessMessage(
          $localize`Successfully saved '${DisplayNamePipe.transform(payload.organization)}'.`
        );
        void this.router.navigate([this.navigationService.previousLocation()], { relativeTo: this.activatedRoute });
      },
      error: () => {
        this.notificationService.showErrorMessage(
          $localize`Could not save changes for '${DisplayNamePipe.transform(payload.organization)}'.`
        );
      },
    });
  }

  newOrganizationMembers(orgMembers: OrganizationMembers, userNames: string[]): OrganizationMembers {
    return {
      kind: 'OrganizationMembers',
      apiVersion: 'appuio.io/v1',
      metadata: {
        ...orgMembers.metadata,
      },
      spec: {
        userRefs: userNames.map((userRef) => ({ name: userRef })),
      },
    };
  }

  removeFormControl(index: number): void {
    this.userRefs?.removeAt(index);
  }
}
