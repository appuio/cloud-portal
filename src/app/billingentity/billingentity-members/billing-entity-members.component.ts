import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingEntityCollectionService } from '../../store/billingentity-collection.service';
import { BillingEntity } from '../../types/billing-entity';
import { catchError, forkJoin, map, Observable, Subscription, take } from 'rxjs';
import { faClose, faSave, faWarning } from '@fortawesome/free-solid-svg-icons';
import { FormArray, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClusterRoleBinding } from '../../types/clusterrole-binding';
import { ClusterRolebindingCollectionService } from '../../store/clusterrolebinding-collection.service';
import { SharedModule } from 'primeng/api';
import { UserCollectionService } from '../../store/user-collection.service';
import { User } from 'src/app/types/user';
import { switchMap } from 'rxjs/operators';
import { defaultIfNotFound } from '../../store/kubernetes-collection.service';
import { ClusterRoleCollectionService } from '../../store/cluster-role-collection.service';
import { ClusterRole } from '../../types/clusterRole';
import { KubeObject } from '../../types/entity';
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
import { LetDirective, PushPipe } from '@ngrx/component';
import { NotificationService } from '../../core/notification.service';

interface Payload {
  billingEntity: BillingEntity;
  viewerRole: ClusterRole;
  adminRole: ClusterRole;
  adminBinding: ClusterRoleBinding;
  viewerBinding: ClusterRoleBinding;
}

@Component({
  selector: 'app-billingentity-members',
  templateUrl: './billing-entity-members.component.html',
  styleUrls: ['./billing-entity-members.component.scss'],
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
    PushPipe,
  ],
})
export class BillingEntityMembersComponent implements OnInit, OnDestroy {
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
  currentUser?: User;
  isRemovingOwnUser = false;

  readonly userNamePrefix = 'appuio#';
  subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService,
    private billingService: BillingEntityCollectionService,
    private roleService: ClusterRoleCollectionService,
    public rolebindingService: ClusterRolebindingCollectionService,
    private userService: UserCollectionService,
    private notificationService: NotificationService
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
    this.payload$ = forkJoin([
      this.billingService.canViewBilling(beName),
      this.billingService.canEditMembers(viewerClusterRoleBindingName),
      this.billingService.canEditMembers(adminClusterRoleBindingName),
    ]).pipe(
      switchMap(([canViewBE, canEditViewer, canEditAdmins]) => {
        if (!canViewBE) {
          this.notificationService.showErrorMessage($localize`You don't have permissions to view Billing ${beName}.`);
          this.router.navigateByUrl('/home');
        }
        if (!canEditViewer || !canEditAdmins) {
          this.notificationService.showErrorMessage(
            $localize`You don't have permissions to edit members of Billing ${beName}.`
          );
          this.router.navigateByUrl('/home');
        }

        return forkJoin([
          this.billingService.getByKeyMemoized(beName),
          this.rolebindingService
            .getByKeyMemoized(adminClusterRoleBindingName)
            .pipe(catchError(defaultIfNotFound(this.newRoleBinding(adminClusterRoleBindingName))), take(1)),
          this.rolebindingService
            .getByKeyMemoized(viewerClusterRoleBindingName)
            .pipe(catchError(defaultIfNotFound(this.newRoleBinding(viewerClusterRoleBindingName))), take(1)),
          this.userService.currentUser$.pipe(take(1)),
          this.createClusterRole$(
            adminClusterRoleBindingName,
            beName,
            ['*'],
            [adminClusterRoleBindingName, viewerClusterRoleBindingName]
          ),
          this.createClusterRole$(
            viewerClusterRoleBindingName,
            beName,
            ['get', 'watch'],
            [viewerClusterRoleBindingName]
          ),
        ]);
      }),
      map(([billingEntity, adminBinding, viewerBinding, currentUser, adminRole, viewerRole]) => {
        this.currentUser = currentUser;
        const payload = {
          billingEntity,
          adminBinding,
          adminRole,
          viewerBinding,
          viewerRole,
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

  save(payload: Payload): void {
    if (!this.form) {
      return;
    }

    const bindingClones = [payload.adminBinding, payload.viewerBinding].map((binding) => structuredClone(binding));
    const roleClones = [payload.adminRole, payload.viewerRole].map((role) => structuredClone(role));
    this.mapUsersToRoles(bindingClones, this.form.getRawValue().userRefs);
    const upsert$: Observable<KubeObject>[] = [];
    bindingClones.forEach((binding) => {
      upsert$.push(this.rolebindingService.upsert(binding));
    });
    roleClones.forEach((role) => {
      upsert$.push(this.roleService.upsert(role));
    });
    forkJoin(upsert$).subscribe({
      next: () => {
        this.notificationService.showSuccessMessage(
          $localize`Successfully saved Billing ${payload.billingEntity.metadata.name}.`
        );
        void this.router.navigate([this.navigationService.previousLocation()], { relativeTo: this.route });
      },
      error: (error) => {
        this.notificationService.showErrorMessage(
          $localize`Could not save Billing ${payload.billingEntity.metadata.name}. Please try again later.`
        );
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

  private newRoleBinding(clusterRoleBindingName: string): ClusterRoleBinding {
    return {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'ClusterRoleBinding',
      metadata: {
        name: clusterRoleBindingName,
      },
      roleRef: {
        name: clusterRoleBindingName,
        kind: 'ClusterRole',
        apiGroup: 'rbac.authorization.k8s.io',
      },
    };
  }

  private createClusterRole$(
    bindingName: string,
    beName: string,
    verbs: string[],
    resourceNames: string[]
  ): Observable<ClusterRole> {
    return this.roleService
      .getByKeyMemoized(bindingName)
      .pipe(catchError(defaultIfNotFound(this.newRole(bindingName, beName, verbs, resourceNames))), take(1));
  }

  private newRole(roleName: string, beName: string, verbs: string[], resourceNames: string[]): ClusterRole {
    return {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'ClusterRole',
      metadata: {
        name: roleName,
      },
      rules: [
        {
          verbs: verbs,
          apiGroups: ['rbac.authorization.k8s.io'],
          resources: ['clusterrolebindings'],
          resourceNames: resourceNames,
        },
        {
          verbs: ['get'],
          apiGroups: ['rbac.appuio.io'],
          resources: ['billingentities'],
          resourceNames: [beName],
        },
      ],
    };
  }
}
