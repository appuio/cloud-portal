import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Organization } from '../../types/organization';
import { BillingEntity } from '../../types/billing-entity';
import { InvitationCollectionService } from '../../store/invitation-collection.service';
import { MessageService } from 'primeng/api';
import { Invitation, TargetRef } from '../../types/invitation';
import { v4 as uuidv4 } from 'uuid';
import { faClose, faGift } from '@fortawesome/free-solid-svg-icons';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { take } from 'rxjs';
import { Team } from '../../types/team';
import { RoleBindingPermissions } from '../../types/role-binding';
import { ClusterRoleBindingPermissions } from '../../types/clusterrole-binding';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationService } from '../../shared/navigation.service';

@Component({
  selector: 'app-invitation-form',
  templateUrl: './invitation-form.component.html',
  styleUrls: ['./invitation-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationFormComponent implements OnInit {
  @Input()
  organizations!: Organization[];
  @Input()
  canInviteOrganization = false;

  @Input()
  billingEntities!: BillingEntity[];
  @Input()
  canInviteBilling = false;

  @Input()
  teams!: Team[];

  faGift = faGift;
  faClose = faClose;
  form!: FormGroup<InvitationForm>;
  organizationOptions: OrganizationOption[] = [];
  billingOptions: BillingOption[] = [];

  constructor(
    public invitationService: InvitationCollectionService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.organizationOptions = this.organizations.map((organization) => {
      return {
        organization,
        displayName: organization.spec.displayName
          ? `${organization.spec.displayName} (${organization.metadata.name})`
          : organization.metadata.name,
      } satisfies OrganizationOption;
    });
    this.billingOptions = this.billingEntities.map((billingEntity) => {
      return {
        billingEntity,
        displayName: billingEntity.spec.name
          ? `${billingEntity.spec.name} (${billingEntity.metadata.name})`
          : billingEntity.metadata.name,
      } satisfies BillingOption;
    });
    this.form = this.formBuilder.nonNullable.group({
      email: new FormControl('', { nonNullable: true, validators: [Validators.email, Validators.required] }),
      note: new FormControl<string>('', { nonNullable: true }),
      organizationTargets: new FormArray<FormGroup<OrganizationTarget>>([]),
      billingTargets: new FormArray<FormGroup<BillingTarget>>([]),
    } satisfies InvitationForm);
    this.addEmptyOrganizationControl();
    this.addEmptyBillingControl();
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }
    const invitation: Invitation = {
      apiVersion: 'user.appuio.io/v1',
      kind: 'Invitation',
      metadata: {
        name: uuidv4(),
      },
      spec: {
        note: this.form.controls.note.value,
        email: this.form.controls.email.value,
        targetRefs: [],
      },
    };
    const targetRefs: TargetRef[] = [];

    this.form.controls.organizationTargets.controls.forEach((orgTarget) => {
      const org = orgTarget.controls.organization.value?.organization;
      if (!org) {
        return;
      }
      targetRefs.push({
        name: 'members',
        kind: 'OrganizationMembers',
        namespace: org.metadata.name,
        apiGroup: 'appuio.io',
      });
      orgTarget.value.teams?.forEach((team) => {
        targetRefs.push({
          name: team.metadata.name,
          namespace: team.metadata.namespace,
          kind: team.kind,
          apiGroup: 'appuio.io',
        });
      });
      if (orgTarget.controls.isAdmin.value) {
        targetRefs.push({
          name: 'control-api:organization-admin',
          namespace: org.metadata.name,
          apiGroup: RoleBindingPermissions.group,
          kind: 'RoleBinding',
        });
      }
      if (orgTarget.controls.isViewer.value) {
        targetRefs.push({
          name: 'control-api:organization-viewer',
          namespace: org.metadata.name,
          apiGroup: 'rbac.authorization.k8s.io',
          kind: 'RoleBinding',
        });
      }
    });
    this.form.controls.billingTargets.controls.forEach((beTarget) => {
      const be = beTarget.controls.billing.value?.billingEntity;
      if (!be) {
        return;
      }
      if (beTarget.value.isViewer) {
        targetRefs.push({
          name: `billingentities-${be.metadata.name}-viewer`,
          kind: 'ClusterRoleBinding',
          apiGroup: ClusterRoleBindingPermissions.group,
        });
      }
      if (beTarget.value.isAdmin) {
        targetRefs.push({
          name: `billingentities-${be.metadata.name}-admin`,
          kind: 'ClusterRoleBinding',
          apiGroup: ClusterRoleBindingPermissions.group,
        });
      }
    });
    if (targetRefs.length === 0) {
      this.form.setErrors({ atLeastOneSelected: 'Select at least one option' });
      return;
    }

    invitation.spec.targetRefs = targetRefs;
    this.invitationService.add(invitation).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Invitation successfully saved',
        });
        void this.router.navigate([this.navigationService.previousLocation('..')], { relativeTo: this.activatedRoute });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: err.message,
          sticky: true,
        });
      },
    });
  }

  addEmptyOrganizationControl(): void {
    const emptyFormControl = new FormGroup<OrganizationTarget>({
      organization: new FormControl<OrganizationOption | undefined>(undefined, { nonNullable: true }),
      isAdmin: new FormControl<boolean>(false, { nonNullable: true }),
      isViewer: new FormControl<boolean>(false, { nonNullable: true }),
      selectableTeams: new FormControl<Team[] | undefined>(undefined, { nonNullable: true }),
      teams: new FormControl<Team[] | undefined>(undefined, { nonNullable: true }),
    });

    emptyFormControl.controls.organization.valueChanges.pipe(take(1)).subscribe(() => {
      this.addEmptyOrganizationControl();
    });
    emptyFormControl.controls.teams.disable();
    emptyFormControl.controls.isViewer.disable();
    emptyFormControl.controls.isAdmin.disable();
    emptyFormControl.controls.organization.valueChanges.subscribe((org) => {
      emptyFormControl.controls.teams.reset();
      if (org) {
        emptyFormControl.controls.selectableTeams.setValue(
          this.teams.filter((team) => team.metadata.namespace === org?.organization.metadata.name)
        );
        emptyFormControl.controls.teams.enable();
        emptyFormControl.controls.isAdmin.enable();
        emptyFormControl.controls.isViewer.enable();
      } else {
        emptyFormControl.controls.selectableTeams.reset();
      }
    });

    this.form.controls.organizationTargets.push(emptyFormControl);
  }

  addEmptyBillingControl(): void {
    const emptyFormControl = new FormGroup<BillingTarget>({
      billing: new FormControl<BillingOption | undefined>(undefined, { nonNullable: true }),
      isAdmin: new FormControl<boolean>(false, { nonNullable: true }),
      isViewer: new FormControl<boolean>(false, { nonNullable: true }),
    });
    emptyFormControl.controls.isAdmin.setValidators(atLeastOneChecked(emptyFormControl.controls.isViewer));
    emptyFormControl.controls.isViewer.setValidators(atLeastOneChecked(emptyFormControl.controls.isAdmin));
    [emptyFormControl.controls.isViewer, emptyFormControl.controls.isAdmin].forEach((control) => {
      control.disable();
    });
    emptyFormControl.controls.billing.valueChanges.subscribe((be) => {
      [emptyFormControl.controls.isViewer, emptyFormControl.controls.isAdmin].forEach((control) => {
        if (be) {
          control.enable();
        }
      });
    });
    emptyFormControl.controls.billing.valueChanges.pipe(take(1)).subscribe(() => {
      this.addEmptyBillingControl();
    });
    this.form.controls.billingTargets.push(emptyFormControl);
  }

  removeOrganization(index: number): void {
    this.form.controls.organizationTargets.removeAt(index);
  }

  removeBilling(index: number): void {
    this.form.controls.billingTargets.removeAt(index);
  }
}

interface InvitationForm {
  note: FormControl<string>;
  email: FormControl<string>;
  organizationTargets: FormArray<FormGroup<OrganizationTarget>>;
  billingTargets: FormArray<FormGroup<BillingTarget>>;
}

interface OrganizationTarget {
  organization: FormControl<OrganizationOption | undefined>;
  isViewer: FormControl<boolean>;
  isAdmin: FormControl<boolean>;
  teams: FormControl<Team[] | undefined>;
  selectableTeams: FormControl<Team[] | undefined>;
}

interface OrganizationOption {
  organization: Organization;
  displayName: string;
}

interface BillingOption {
  billingEntity: BillingEntity;
  displayName: string;
}

interface BillingTarget {
  billing: FormControl<BillingOption | undefined>;
  isViewer: FormControl<boolean>;
  isAdmin: FormControl<boolean>;
}

function atLeastOneChecked<T extends AbstractControl<boolean, boolean>>(
  other: FormControl<boolean>
): (control: T) => ValidationErrors | null {
  return (control): ValidationErrors | null => {
    if (!control.value && !other.value) {
      const err = {
        atLeastOneRequired: 'at least one is required',
      };
      other.setErrors(err);
      other.markAsDirty();
      return err;
    }
    if (control.value) {
      other.setErrors(null);
    }
    return null;
  };
}
