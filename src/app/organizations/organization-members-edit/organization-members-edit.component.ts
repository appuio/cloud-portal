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
  usersRoles!: Record<string, string[]>;
  faClose = faClose;
  faSave = faSave;
  saving = false;
  form = new FormGroup({
    userRefs: new FormArray([]),
  });
  editPermission = false;
  //TODO get all available roles from API
  allRoles = ['control-api:organization-admin', 'control-api:organization-viewer'];

  constructor(
    private activatedRoute: ActivatedRoute,
    private kubernetesClientService: KubernetesClientService,
    private messageService: MessageService,
    private router: Router
  ) {}

  get userRefs(): FormArray {
    return this.form.get('userRefs') as FormArray;
  }

  userRoles: Record<string, string[]> = {};
  roleBindings!: RoleBindingList;

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ organizationMembers, roleBindings }) => {
      this.organizationMembers = organizationMembers;
      this.roleBindings = roleBindings;
    });
    this.roleBindings.items.forEach((item) => {
      item.subjects.forEach((subj) => {
        if (!this.userRoles[subj.name]) this.userRoles[subj.name] = [];
        this.userRoles[subj.name].push(item.roleRef.name);
      });
    });
    this.editPermission = this.organizationMembers.editMembers ?? false;
    const members = this.userRefs;
    this.organizationMembers.spec.userRefs?.forEach((userRef) => {
      members.push(
        new FormGroup({
          userName: new FormControl({ value: userRef.name, disabled: !this.editPermission }, Validators.required),
          selectedRoles: new FormControl(this.userRoles[`appuio#${userRef.name}`]),
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
      this.addEmptyFormControl();
    });
    const emptyFormGroup = new FormGroup({
      userName: emptyFormControl,
      selectedRoles: new FormControl([]),
    });
    this.userRefs.push(emptyFormGroup);
  }

  save(): void {
    const userNames: string[] = this.form.value.userRefs
      .map((userDetails: { userName: string; selectedRoles: string[] }) => userDetails.userName)
      .filter((val: string) => val);

    const allRoles: Record<string, string[]> = {};
    this.form.value.userRefs.forEach((userDetails: { userName: string; selectedRoles: string[] }) => {
      userDetails.selectedRoles?.forEach((role) => {
        if (!allRoles[role]) allRoles[role] = [];
        allRoles[role].push(userDetails.userName);
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
          subjects: allRoles[roleBinding.roleRef.name].map((sub) => {
            return { apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: `appuio#${sub}` };
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
