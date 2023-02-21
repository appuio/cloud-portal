import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faClose, faSave, faWarning } from '@fortawesome/free-solid-svg-icons';
import { OrganizationMembers } from '../../types/organization-members';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatestWith, forkJoin, map, Observable, Subscription, take } from 'rxjs';
import { KubernetesClientService } from '../../core/kubernetes-client.service';
import { MessageService } from 'primeng/api';
import { RoleBindingList } from 'src/app/types/role-bindings';
import { OrganizationMembersCollectionService } from '../../store/organizationmembers-collection.service';

@Component({
  selector: 'app-organization-members-edit',
  templateUrl: './organization-members-edit.component.html',
  styleUrls: ['./organization-members-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationMembersEditComponent implements OnInit, OnDestroy {
  private organizationMembers?: OrganizationMembers;
  roleBindings!: RoleBindingList;
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
  editPermission = false;
  organizationMembers$?: Observable<OrganizationMembers>;

  private subscriptions: Subscription[] = [];

  // list of cluster roles that can be assigned by user - currently hard-coded as there's nothing
  // clearly identifying these (e.g. tag or special field)
  readonly allRoleNames = ['control-api:organization-admin', 'control-api:organization-viewer'];
  readonly newUserDefaultRoles = ['control-api:organization-viewer'];
  readonly userNamePrefix = 'appuio#';

  constructor(
    private activatedRoute: ActivatedRoute,
    private kubernetesClientService: KubernetesClientService,
    private messageService: MessageService,
    private router: Router,
    private membersService: OrganizationMembersCollectionService
  ) {}

  get userRefs(): FormArray | undefined {
    return this.form?.get('userRefs') as FormArray;
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ roleBindings }) => {
      this.roleBindings = roleBindings;
    });

    const name = this.activatedRoute.snapshot.paramMap.get('name');
    if (!name) {
      throw new Error('name is required');
    }

    this.organizationMembers$ = this.membersService.getByKeyMemoized(`${name}/members`).pipe(
      combineLatestWith(this.membersService.canEditMembers(name)),
      map(([members, canEdit]) => {
        this.organizationMembers = members;
        this.editPermission = canEdit;
        this.initForm();
        return members;
      })
    );
  }

  initForm(): void {
    const userRoles = this.mapRolesToUsers();
    const members =
      this.organizationMembers?.spec.userRefs?.map(
        (userRef) =>
          new FormGroup({
            userName: new FormControl(
              { value: userRef.name, disabled: !this.editPermission },
              { validators: Validators.required, nonNullable: true }
            ),
            selectedRoles: new FormControl(
              {
                value: userRoles[`${this.userNamePrefix}${userRef.name}`],
                disabled: !this.editPermission,
              },
              { nonNullable: true }
            ),
          })
      ) ?? [];

    this.form = new FormGroup({
      userRefs: new FormArray(members),
    });

    if (this.editPermission) {
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

  mapRolesToUsers(): Record<string, string[]> {
    const userRoles: Record<string, string[]> = {};
    this.roleBindings.items.forEach((item) => {
      item.subjects.forEach((subj) => {
        if (!userRoles[subj.name]) {
          userRoles[subj.name] = [];
        }
        userRoles[subj.name].push(item.roleRef.name);
      });
    });
    return userRoles;
  }

  save(): void {
    if (!this.form || !this.organizationMembers) {
      return;
    }
    const userNames: string[] = this.form
      .getRawValue()
      .userRefs?.map((userDetails: { userName: string; selectedRoles: string[] }) => userDetails.userName)
      .filter((val: string) => val);

    const rolesToSubjects: Record<string, string[]> = {};
    this.form.getRawValue().userRefs?.forEach((userDetails: { userName: string; selectedRoles: string[] }) => {
      userDetails.selectedRoles?.forEach((role) => {
        if (!rolesToSubjects[role]) {
          rolesToSubjects[role] = [];
        }
        rolesToSubjects[role].push(userDetails.userName);
      });
    });

    forkJoin([
      this.membersService.update(this.newOrganizationMembers(this.organizationMembers, userNames)),
      ...this.roleBindings.items.map((roleBinding) =>
        this.kubernetesClientService.updateRoleBinding({
          metadata: { ...roleBinding.metadata },
          roleRef: { ...roleBinding.roleRef },
          subjects: rolesToSubjects[roleBinding.roleRef.name].map((sub) => {
            return { apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: `${this.userNamePrefix}${sub}` };
          }),
        })
      ),
    ]).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: $localize`Successfully saved`,
        });
        void this.router.navigate(['../..'], { relativeTo: this.activatedRoute });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: $localize`Error`,
          detail: error.message,
        });
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

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
