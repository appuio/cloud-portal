import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faCancel, faSave } from '@fortawesome/free-solid-svg-icons';
import { BillingEntityCollectionService } from '../../store/billingentity-collection.service';
import { BillingEntity } from '../../types/billing-entity';
import { BillingForm } from './billingentity-form.types';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from '../../app-config.service';
import { MessageService } from 'primeng/api';
import { NavigationService } from '../../shared/navigation.service';
import { multiEmail, sameEntries } from './billingentity-form.util';
import { filter } from 'rxjs';

@Component({
  selector: 'app-billingentity-form',
  templateUrl: './billing-entity-form.component.html',
  styleUrls: ['./billing-entity-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingEntityFormComponent implements OnInit {
  @Input()
  billingEntity!: BillingEntity;

  form!: FormGroup<BillingForm>;

  faSave = faSave;
  faCancel = faCancel;
  countryOptions?: { code?: string; name: string }[] = [];
  emailSeparatorExp = /[, ]/;

  constructor(
    public billingService: BillingEntityCollectionService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private navigationService: NavigationService,
    private messageService: MessageService,
    private appConfig: AppConfigService
  ) {}

  ngOnInit(): void {
    this.countryOptions = this.appConfig.getConfiguration().countries;
    const spec = this.billingEntity.spec;
    const companyEmails = spec.emails?.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })) ?? [];
    const accountingEmails =
      spec.accountingContact?.emails?.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })) ?? [];
    const sameEmails = sameEntries(companyEmails, accountingEmails);
    const preselectedCountry = this.countryOptions.find((o) => o.name === spec.address?.country);
    this.form = this.formBuilder.nonNullable.group({
      displayName: new FormControl(spec.name ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      companyEmail: new FormControl<string[]>(companyEmails, {
        nonNullable: true,
        validators: [multiEmail, Validators.required],
      }),
      phone: new FormControl(spec.phone ?? '', { nonNullable: true, validators: [Validators.required] }),
      line1: new FormControl(spec.address?.line1 ?? '', { nonNullable: true, validators: [Validators.required] }),
      line2: new FormControl(spec.address?.line2 ?? '', { nonNullable: true }),
      postal: new FormControl(spec.address?.postalCode ?? '', { nonNullable: true, validators: [Validators.required] }),
      city: new FormControl(spec.address?.city ?? '', { nonNullable: true, validators: [Validators.required] }),
      country: new FormControl<{ name: string } | undefined>(preselectedCountry, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      accountingName: new FormControl(spec.accountingContact?.name ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      accountingEmail: new FormControl(
        {
          value: accountingEmails,
          disabled: sameEmails,
        },
        {
          nonNullable: true,
          validators: [multiEmail, Validators.required],
        }
      ),
      sameCompanyEmailsSelected: new FormControl(sameEmails, { nonNullable: true }),
    } satisfies BillingForm);

    this.form.controls.companyEmail.valueChanges
      .pipe(filter(() => this.form.controls.sameCompanyEmailsSelected.value))
      .subscribe((emails) => this.form.controls.accountingEmail.setValue(emails));

    this.form.controls.sameCompanyEmailsSelected.valueChanges.subscribe((isSelected) => {
      if (isSelected) {
        this.form.controls.accountingEmail.disable();
        this.form.controls.accountingEmail.setValue(this.form.controls.companyEmail.value);
      } else {
        this.form.controls.accountingEmail.enable();
        this.form.controls.accountingEmail.setValue(
          accountingEmails.length > 0 ? accountingEmails : this.form.controls.companyEmail.value
        );
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }
    const controls = this.form.controls;
    const be = structuredClone(this.billingEntity);
    be.spec = {
      ...be.spec,
      name: controls.displayName.value,
      phone: controls.phone.value,
      address: {
        ...be.spec.address,
        line1: controls.line1.value,
        line2: controls.line2.value,
        postalCode: controls.postal.value,
        city: controls.city.value,
        country: controls.country.value?.name,
      },
      emails: controls.companyEmail.value,
      accountingContact: {
        ...be.spec.accountingContact,
        name: controls.accountingName.value,
        emails: controls.accountingEmail.value,
      },
    };
    if (this.isNewBillingEntity(be)) {
      this.billingService.add(be).subscribe({
        next: (result) => this.saveOrUpdateSuccess(result),
        error: (err) => this.saveOrUpdateFailure(err),
      });
    } else {
      this.billingService.update(be).subscribe({
        next: (result) => this.saveOrUpdateSuccess(result),
        error: (err) => this.saveOrUpdateFailure(err),
      });
    }
  }

  cancel(): void {
    void this.router.navigate([this.navigationService.previousLocation('..')], {
      queryParams: { edit: undefined },
      queryParamsHandling: 'merge',
      relativeTo: this.activatedRoute,
    });
  }

  isNewBillingEntity(be?: BillingEntity): boolean {
    return be ? !!be.metadata.generateName : !!this.billingEntity.metadata.generateName;
  }

  private saveOrUpdateSuccess(be: BillingEntity): void {
    this.messageService.add({
      severity: 'success',
      summary: $localize`Successfully saved`,
    });
    void this.router.navigate(['..', be.metadata.name], {
      relativeTo: this.activatedRoute,
      queryParams: { edit: undefined },
      queryParamsHandling: 'merge',
    });
  }

  private saveOrUpdateFailure(err: Error): void {
    let detail = '';
    if ('message' in err) {
      detail = err.message;
    }
    this.messageService.add({
      severity: 'error',
      summary: $localize`Error`,
      sticky: true,
      detail,
    });
  }
}
