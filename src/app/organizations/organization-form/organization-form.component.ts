import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { newOrganization, Organization } from '../../types/organization';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, SelectItem } from 'primeng/api';
import { OrganizationNameService } from '../organization-name.service';
import { OrganizationCollectionService } from '../../store/organization-collection.service';
import { BillingEntity } from '../../types/billing-entity';
import { NavigationService } from '../../shared/navigation.service';

@Component({
  selector: 'app-organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationFormComponent implements OnInit, OnDestroy {
  @Input()
  organization!: Organization;
  @Input()
  new = true;
  @Input()
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
  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private organizationNameService: OrganizationNameService,
    public organizationCollectionService: OrganizationCollectionService,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.billingOptions = this.billingEntities.map((be) => {
      return {
        value: be,
        label: be.spec.name ? `${be.spec.name} (${be.metadata.name})` : be.metadata.name,
      };
    });
    this.form = this.formBuilder.nonNullable.group({
      displayName: this.organization.spec.displayName,
      organizationId: new FormControl(this.organization.metadata.name, {
        validators: [Validators.required, Validators.pattern(this.organizationNameService.getValidationPattern())],
        nonNullable: true,
      }),
      billingEntity: new FormControl<SelectItem<BillingEntity> | undefined>(
        this.billingOptions.find((option) => option.value.metadata.name === this.organization.spec.billingEntityRef),
        {
          validators: [Validators.required],
          nonNullable: true,
        }
      ),
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
    this.organizationCollectionService.add(this.getOrgFromForm()).subscribe({
      next: () => this.saveOrUpdateSuccess(),
      error: (err) => this.saveOrUpdateFailure(err),
    });
  }

  private updateOrg(): void {
    this.organizationCollectionService
      .update(this.getOrgFromForm())
      .subscribe({ next: () => this.saveOrUpdateSuccess(), error: (err) => this.saveOrUpdateFailure(err) });
  }

  private getOrgFromForm(): Organization {
    const rawValue = this.form.getRawValue();
    return newOrganization(
      rawValue.organizationId,
      rawValue.displayName ?? '',
      rawValue.billingEntity?.value.metadata.name ?? ''
    );
  }

  private saveOrUpdateSuccess(): void {
    this.messageService.add({
      severity: 'success',
      summary: $localize`Successfully saved`,
    });
    void this.router.navigate([this.navigationService.previousLocation()], { relativeTo: this.activatedRoute });
  }

  private saveOrUpdateFailure(err: Error): void {
    let detail = '';
    if ('message' in err) {
      detail = err.message;
    }
    if ('reason' in err) {
      if ('AlreadyExists' === err.reason) {
        this.form.get('organizationId')?.setErrors({ alreadyExists: true });
        detail = $localize`Organization "${this.form.get('organizationId')?.value}" already exists.`;
      }
    }
    this.messageService.add({
      severity: 'error',
      summary: $localize`Error`,
      sticky: true,
      detail,
    });
  }
}
