import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faClose, faSave } from '@fortawesome/free-solid-svg-icons';
import { OrganizationMembers } from '../../types/organization-members';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, take } from 'rxjs';
import { KubernetesClientService } from '../../core/kubernetes-client.service';
import { MessageService } from 'primeng/api';
import { RoleBindingList } from 'src/app/types/role-bindings';

@Component({
  selector: 'app-organization-members-edit',
  templateUrl: './organization-members-edit.component.html',
  styleUrls: ['./organization-members-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationMembersEditComponent implements OnInit {
  organizationMembers!: OrganizationMembers;
  roleBindings!: RoleBindingList;
  faClose = faClose;
  faSave = faSave;
  saving = false;
  form = new FormGroup({
    userRefs: new FormArray([]),
  });
  editPermission = false;

  readonly allRoleNames = ['control-api:organization-admin', 'control-api:organization-viewer'];
  readonly newUserDefaultRoles = ['control-api:organization-viewer'];
  readonly userNamePrefix = 'appuio#';

  constructor(
    private activatedRoute: ActivatedRoute,
    private kubernetesClientService: KubernetesClientService,
    private messageService: MessageService,
    private router: Router
  ) {}

  get userRefs(): FormArray {
    return this.form.get('userRefs') as FormArray;
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ organizationMembers, roleBindings }) => {
      this.organizationMembers = organizationMembers;
      this.roleBindings = roleBindings;
    });
    const userRoles = this.mapRolesToUsers();
    this.editPermission = this.organizationMembers.editMembers ?? false;
    const members = this.userRefs;
    this.organizationMembers.spec.userRefs?.forEach((userRef) => {
      members.push(
        new FormGroup({
          userName: new FormControl({ value: userRef.name, disabled: !this.editPermission }, Validators.required),
          selectedRoles: new FormControl({
            value: userRoles[`${this.userNamePrefix}${userRef.name}`],
            disabled: !this.editPermission,
          }),
        })
      );
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
    const emptyRoleDropdown = new FormControl([]);
    const emptyFormGroup = new FormGroup({
      userName: emptyFormControl,
      selectedRoles: emptyRoleDropdown,
    });
    this.userRefs.push(emptyFormGroup);
  }

  mapRolesToUsers(): Record<string, string[]> {
    const userRoles: Record<string, string[]> = {};
    this.roleBindings.items.forEach((item) => {
      item.subjects.forEach((subj) => {
        if (!userRoles[subj.name]) userRoles[subj.name] = [];
        userRoles[subj.name].push(item.roleRef.name);
      });
    });
    return userRoles;
  }

  save(): void {
    const userNames: string[] = this.form.value.userRefs
      .map((userDetails: { userName: string; selectedRoles: string[] }) => userDetails.userName)
      .filter((val: string) => val);

    const rolesToSubjects: Record<string, string[]> = {};
    this.form.value.userRefs.forEach((userDetails: { userName: string; selectedRoles: string[] }) => {
      userDetails.selectedRoles?.forEach((role) => {
        if (!rolesToSubjects[role]) rolesToSubjects[role] = [];
        rolesToSubjects[role].push(userDetails.userName);
      });
    });

    forkJoin([
      this.kubernetesClientService.updateOrganizationMembers({
        kind: 'OrganizationMembers',
        apiVersion: 'appuio.io/v1',
        metadata: {
          ...this.organizationMembers.metadata,
        },
        spec: {
          userRefs: userNames.map((userRef) => ({ name: userRef })),
        },
      }),
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

  removeFormControl(index: number): void {
    this.userRefs.removeAt(index);
  }
}
