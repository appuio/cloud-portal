import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingEntityCollectionService } from '../../store/billingentity-collection.service';
import { BillingEntity } from '../../types/billing-entity';
import { combineLatestWith, forkJoin, map, Observable, take } from 'rxjs';
import { faClose, faSave, faWarning } from '@fortawesome/free-solid-svg-icons';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ClusterRoleBinding } from '../../types/clusterrole-binding';
import { ClusterRolebindingCollectionService } from '../../store/clusterrolebinding-collection.service';
import { MessageService } from 'primeng/api';

interface Payload {
  billingEntity: BillingEntity;
  canEdit: boolean;
  adminBinding: ClusterRoleBinding;
  viewerBinding: ClusterRoleBinding;
}

@Component({
  selector: 'app-billingentity-members',
  templateUrl: './billingentity-members.component.html',
  styleUrls: ['./billingentity-members.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingentityMembersComponent implements OnInit {
  payload$?: Observable<Payload>;

  faWarning = faWarning;
  faClose = faClose;
  faSave = faSave;

  form?: FormGroup<{
    userRefs: FormArray<
      FormGroup<{
        userName: FormControl<string>;
        selectedRoles: FormControl<string[]>;
      }>
    >;
  }>;

  // list of cluster roles that can be assigned by user - currently hard-coded as there's nothing
  // clearly identifying these (e.g. tag or special field)
  readonly userNamePrefix = 'appuio#';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingEntityCollectionService,
    public rolebindingService: ClusterRolebindingCollectionService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name');
    if (!name) {
      throw new Error('name is required');
    }
    const adminClusterRoleBindingName = `billingentities-${name}-admin`;
    const viewerClusterRoleBindingName = `billingentities-${name}-viewer`;
    this.payload$ = this.billingService.getByKeyMemoized(name).pipe(
      combineLatestWith(
        this.billingService.canEditMembers(adminClusterRoleBindingName),
        this.rolebindingService.getByKeyMemoized(adminClusterRoleBindingName),
        this.rolebindingService.getByKeyMemoized(viewerClusterRoleBindingName)
      ),
      map(([be, canEdit, adminCrb, viewerCrb]) => {
        const payload = {
          billingEntity: be,
          canEdit,
          adminBinding: adminCrb,
          viewerBinding: viewerCrb,
        } satisfies Payload;
        this.initForm(payload);
        return payload;
      })
    );
  }

  get userRefs(): FormArray | undefined {
    return this.form?.get('userRefs') as FormArray;
  }

  initForm(payload: Payload): void {
    const userRoles = this.mapRolesToUsers([payload.viewerBinding, payload.adminBinding]);

    const members: FormGroup[] = [];
    userRoles.forEach((roles, subject) => {
      members.push(
        new FormGroup({
          userName: new FormControl(
            { value: subject.replace(this.userNamePrefix, ''), disabled: !payload.canEdit },
            { validators: Validators.required, nonNullable: true }
          ),
          selectedRoles: new FormControl(
            {
              value: roles,
              disabled: !payload.canEdit,
            },
            { nonNullable: true }
          ),
        })
      );
    });

    this.form = new FormGroup({
      userRefs: new FormArray(members),
    });

    if (payload.canEdit) {
      this.addEmptyFormControl(payload.viewerBinding);
    }
  }

  addEmptyFormControl(viewerBinding: ClusterRoleBinding): void {
    const emptyFormControl = new FormControl();
    emptyFormControl.valueChanges.pipe(take(1)).subscribe(() => {
      emptyFormControl.addValidators(Validators.required);
      emptyRoleDropdown.setValue([viewerBinding.metadata.name]);
      this.addEmptyFormControl(viewerBinding);
    });
    const emptyRoleDropdown = new FormControl<string[]>([]);
    const emptyFormGroup = new FormGroup({
      userName: emptyFormControl,
      selectedRoles: emptyRoleDropdown,
    });
    this.userRefs?.push(emptyFormGroup);
  }

  mapRolesToUsers(roleBindings: ClusterRoleBinding[]): Map<string, string[]> {
    const userRoles: Map<string, string[]> = new Map();
    roleBindings.forEach((item) => {
      item.subjects?.forEach((subj) => {
        let roles = userRoles.get(subj.name);
        if (!roles) {
          roles = [];
        }
        roles.push(item.roleRef.name);
        userRoles.set(subj.name, roles);
      });
    });
    return userRoles;
  }

  mapUsersToRoles(roleBindings: ClusterRoleBinding[], userRefs: { userName: string; selectedRoles: string[] }[]): void {
    roleBindings.forEach((binding) => {
      binding.subjects = []; // reset to remove other unselected users.
      userRefs
        .filter((ref) => ref.userName)
        .forEach((ref) => {
          const hasSelected = ref.selectedRoles.some((role) => role === binding.metadata.name);
          if (hasSelected) {
            binding.subjects?.push({
              apiGroup: 'rbac.authorization.k8s.io',
              kind: 'User',
              name: `${this.userNamePrefix}${ref.userName}`,
            });
          }
        });
    });
  }

  save(payload: Payload): void {
    if (!this.form) {
      return;
    }

    const bindingClones = [payload.adminBinding, payload.viewerBinding].map((binding) => structuredClone(binding));
    this.mapUsersToRoles(bindingClones, this.form.getRawValue().userRefs);
    const update$ = bindingClones.map((binding) => this.rolebindingService.update(binding));
    forkJoin(update$).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: $localize`Successfully saved`,
        });
        void this.router.navigate(['../..'], { relativeTo: this.route });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: $localize`Error`,
          detail: error.message,
          sticky: true,
        });
      },
    });
  }

  removeFormControl(index: number): void {
    this.userRefs?.removeAt(index);
  }
}
