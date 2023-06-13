import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingEntityCollectionService } from '../../store/billingentity-collection.service';
import { BillingEntity } from '../../types/billing-entity';
import { forkJoin, map, Observable, Subscription, take } from 'rxjs';
import { faClose, faSave, faWarning } from '@fortawesome/free-solid-svg-icons';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ClusterRoleBinding } from '../../types/clusterrole-binding';
import { ClusterRolebindingCollectionService } from '../../store/clusterrolebinding-collection.service';
import { MessageService } from 'primeng/api';
import { UserCollectionService } from '../../store/user-collection.service';
import { User } from 'src/app/types/user';
import { switchMap } from 'rxjs/operators';
import { NavigationService } from '../../shared/navigation.service';

@Component({
  selector: 'app-billingentity-members',
  templateUrl: './billing-entity-members.component.html',
  styleUrls: ['./billing-entity-members.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingEntityMembersComponent implements OnInit, OnDestroy {
  viewModel$?: Observable<ViewModel>;

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
  currentUser?: User;
  isRemovingOwnUser = false;

  readonly userNamePrefix = 'appuio#';
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService,
    private billingService: BillingEntityCollectionService,
    public roleBindingService: ClusterRolebindingCollectionService,
    private messageService: MessageService,
    private userService: UserCollectionService
  ) {}

  ngOnInit(): void {
    const beName = this.route.snapshot.paramMap.get('name');
    if (!beName) {
      throw new Error('name is required');
    }
    const adminClusterRoleBindingName = this.getBindingName(beName, 'admin');
    const viewerClusterRoleBindingName = this.getBindingName(beName, 'viewer');

    // How to read the pipe below:
    //  First, get a set of permissions.
    //   -> Check if we're allowed to do something and error handling
    //  Second, we enrich the pipe with more entities, based on whether we're allowed to.
    //  Last, map the results to the payload and render the UI based on those.
    this.viewModel$ = forkJoin([
      this.billingService.canViewBilling(beName),
      this.billingService.canEditMembers(adminClusterRoleBindingName),
    ]).pipe(
      switchMap(([canViewBE, canEditAdmins]) => {
        if (!canViewBE) {
          this.messageService.add({
            severity: 'error',
            summary: `You don't have permissions to view Billing ${beName}.`,
          });
          void this.router.navigateByUrl('/home');
        }
        if (!canEditAdmins) {
          this.messageService.add({
            severity: 'error',
            summary: `You don't have enough permissions to edit members of Billing ${beName}.`,
          });
          void this.router.navigateByUrl('/home');
        }

        return forkJoin([
          this.billingService.getByKeyMemoized(beName),
          this.roleBindingService.getByKeyMemoized(adminClusterRoleBindingName),
          this.roleBindingService.getByKeyMemoized(viewerClusterRoleBindingName),
          this.userService.currentUser$.pipe(take(1)),
        ]);
      }),
      map(([billingEntity, adminBinding, viewerBinding, currentUser]) => {
        this.currentUser = currentUser;
        const payload = {
          billingEntity,
          adminBinding,
          viewerBinding,
        } satisfies ViewModel;
        this.initForm(payload);
        return payload;
      })
    );
  }

  get userRefs(): FormArray | undefined {
    return this.form?.get('userRefs') as FormArray;
  }

  initForm(payload: ViewModel): void {
    const userRoles = this.mapRolesToUsers([payload.viewerBinding, payload.adminBinding]);

    const members: FormGroup[] = [];
    userRoles.forEach((roles, subject) => {
      const userName = subject.replace(this.userNamePrefix, '');
      const control = new FormGroup({
        userName: new FormControl(userName, { validators: Validators.required, nonNullable: true }),
        selectedRoles: new FormControl(roles, { nonNullable: true }),
      });
      members.push(control);
      if (userName === this.currentUser?.metadata.name) {
        this.subscriptions.push(
          control.valueChanges.subscribe((value) => {
            this.isRemovingOwnUser = !value.selectedRoles?.includes(payload.adminBinding.roleRef.name);
          })
        );
      }
    });

    this.form = new FormGroup({
      userRefs: new FormArray(members),
    });

    this.addEmptyFormControl(payload.viewerBinding);
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
          const hasSelected = ref.selectedRoles.some((role) => role === binding.roleRef.name);
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

  save(payload: ViewModel): void {
    if (!this.form) {
      return;
    }

    const bindingClones = [payload.adminBinding, payload.viewerBinding].map((binding) => structuredClone(binding));
    this.mapUsersToRoles(bindingClones, this.form.getRawValue().userRefs);
    const update$ = bindingClones.map((binding) => this.roleBindingService.update(binding));
    forkJoin(update$).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: $localize`Successfully saved`,
        });
        const previous = this.navigationService.previousRoute('..');
        void this.router.navigate([previous.path], { relativeTo: this.route });
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
    if (!this.userRefs) {
      return;
    }
    const ref = this.userRefs.at(index);
    if (this.currentUser && this.currentUser.metadata.name === ref.getRawValue().userName) {
      this.isRemovingOwnUser = true;
    }
    this.userRefs.removeAt(index);
  }

  getBindingName(beName: string, role: 'admin' | 'viewer'): string {
    return `billingentities-${beName}-${role}`;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}

interface ViewModel {
  billingEntity: BillingEntity;
  adminBinding: ClusterRoleBinding;
  viewerBinding: ClusterRoleBinding;
}
