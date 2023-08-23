import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { newOrganization, Organization } from '../../types/organization';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { OrganizationNameService } from '../organization-name.service';
import { OrganizationCollectionService } from '../../store/organization-collection.service';
import { BillingEntity } from '../../types/billing-entity';
import { NavigationService } from '../../shared/navigation.service';
import { PushPipe } from '@ngrx/component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { NgIf } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { NotificationService } from '../../core/notification.service';
import { DataServiceError } from '@ngrx/data';
import { DisplayNamePipe } from '../../display-name.pipe';

@Component({
  selector: 'app-organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    NgIf,
    MessageModule,
    DropdownModule,
    ButtonModule,
    RippleModule,
    FontAwesomeModule,
    PushPipe,
  ],
})
export class OrganizationFormComponent implements OnInit, OnDestroy {
  @Input({ required: true })
  organization!: Organization;
  @Input()
  new = true;
  @Input({ required: true })
  billingEntities!: BillingEntity[];
  @Input()
  canEditBe = false;

  form!: FormGroup<{
    displayName: FormControl<string | undefined>;
    organizationId: FormControl<string>;
    billingEntity: FormControl<SelectItem<BillingEntity> | undefined>;
  }>;

  billingOptions: SelectItem<BillingEntity>[] = [];

  faSave = faSave;
  subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private organizationNameService: OrganizationNameService,
    public organizationCollectionService: OrganizationCollectionService,
    private navigationService: NavigationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.billingOptions = this.billingEntities
      // Note: When implementing https://github.com/appuio/cloud-portal/issues/492 be sure that BE are sorted by display name in entity-metadata-map.ts by default
      .sort((a, b) => {
        const aName = a.spec.name ? a.spec.name : a.metadata.name;
        const bName = b.spec.name ? b.spec.name : b.metadata.name;
        return aName.localeCompare(bName, undefined, { sensitivity: 'base' });
      })
      .map((be) => {
        return {
          value: be,
          label: be.spec.name ? `${be.spec.name} (${be.metadata.name})` : be.metadata.name,
        };
      });
    let preselectedBe = this.billingOptions.find(
      (option) => option.value.metadata.name === this.organization.spec.billingEntityRef
    );
    if (!preselectedBe && this.billingEntities.length === 1 && this.new) {
      preselectedBe = this.billingOptions[0];
    }
    this.form = this.formBuilder.nonNullable.group({
      displayName: this.organization.spec.displayName,
      organizationId: new FormControl(this.organization.metadata.name, {
        validators: [Validators.required, Validators.pattern(this.organizationNameService.getValidationPattern())],
        nonNullable: true,
      }),
      billingEntity: new FormControl<SelectItem<BillingEntity> | undefined>(preselectedBe, {
        validators: [Validators.required],
        nonNullable: true,
      }),
    });
    if (this.new) {
      const sub = this.form.controls.displayName.valueChanges.subscribe((value) => this.setNameFromDisplayName(value));
      this.subscriptions.push(sub);
    }
  }

  setNameFromDisplayName(displayName: string | undefined): void {
    const orgIdInput = this.form.get('organizationId');
    if (displayName && orgIdInput?.pristine) {
      const name = this.organizationNameService.tranformToKubeName(displayName);
      this.form.get('organizationId')?.setValue(name);
    }
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }
    if (this.new) {
      this.addOrg();
    } else {
      this.updateOrg();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private addOrg(): void {
    const rawValue = this.form.getRawValue();
    const org = newOrganization(
      rawValue.organizationId,
      rawValue.displayName ?? '',
      rawValue.billingEntity?.value.metadata.name ?? ''
    );
    this.organizationCollectionService.add(org).subscribe({
      next: (org) => this.saveOrUpdateSuccess(org),
      error: (err) => this.saveOrUpdateFailure(err),
    });
  }

  private updateOrg(): void {
    const rawValue = this.form.getRawValue();
    const org = structuredClone(this.organization);
    org.spec = {
      displayName: rawValue.displayName ?? '',
      billingEntityRef: rawValue.billingEntity?.value.metadata.name,
    };
    this.organizationCollectionService.update(org).subscribe({
      next: (org) => this.saveOrUpdateSuccess(org),
      error: (err) => this.saveOrUpdateFailure(err),
    });
  }

  private saveOrUpdateSuccess(org: Organization): void {
    this.notificationService.showSuccessMessage(
      $localize`Successfully saved organization '${DisplayNamePipe.transform(org)}'.`
    );
    const firstTime = this.activatedRoute.snapshot.queryParamMap.get('firstTime') === 'y';
    if (firstTime) {
      void this.router.navigate(['zones'], {
        queryParams: { edit: undefined, firstTime: undefined },
        queryParamsHandling: 'merge',
      });
      return;
    }
    const previous = this.navigationService.previousRoute('..');
    void this.router.navigate([previous.path], { relativeTo: this.activatedRoute, queryParams: previous.queryParams });
  }

  private saveOrUpdateFailure(err: DataServiceError): void {
    const orgId = this.form.controls.organizationId.value;
    const name = this.form.controls.displayName.value || orgId;
    let message = $localize`Could not save organization '${name}'.`;
    if (409 === err.error?.status || err.message?.includes('already exists')) {
      this.form.controls.organizationId.setErrors({ alreadyExists: true });
      message = $localize`Organization with ID "${orgId}" already exists.`;
    }
    this.notificationService.showErrorMessage(message);
  }
}
