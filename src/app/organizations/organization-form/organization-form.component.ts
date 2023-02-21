import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { newOrganization, Organization } from '../../types/organization';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { filter, map, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { OrganizationNameService } from '../organization-name.service';
import { OrganizationCollectionService } from '../../store/organization-collection.service';
import { EntityOp } from '@ngrx/data';
import { BillingEntity } from '../../types/billing-entity';

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

  form!: FormGroup<{ displayName: FormControl<string | undefined>; organizationId: FormControl<string> }>;
  faSave = faSave;
  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private messageService: MessageService,
    private organizationNameService: OrganizationNameService,
    public organizationCollectionService: OrganizationCollectionService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.nonNullable.group({
      displayName: this.organization.spec.displayName,
      organizationId: new FormControl(this.organization.metadata.name, {
        validators: [Validators.required, Validators.pattern(this.organizationNameService.getValidationPattern())],
        nonNullable: true,
      }),
    });
    if (this.new) {
      const sub = this.form.controls.displayName.valueChanges.subscribe((value) => this.setNameFromDisplayName(value));
      this.subscriptions.push(sub);
    }
    this.organizationCollectionService.errors$
      .pipe(
        filter((action) => action.payload.entityOp == EntityOp.SAVE_ADD_ONE_ERROR),
        map((action) => action.payload.data.error.error.error)
      )
      .subscribe((err: Error) => {
        let detail = '';
        console.debug('error!', err);
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
          detail,
        });
      });
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
    this.organizationCollectionService.add(this.getOrgFromForm()).subscribe(() => this.saveOrUpdateSuccess());
  }

  private updateOrg(): void {
    this.organizationCollectionService.update(this.getOrgFromForm()).subscribe(() => this.saveOrUpdateSuccess());
  }

  private getOrgFromForm(): Organization {
    return newOrganization(this.form.getRawValue().organizationId, this.form.getRawValue().displayName ?? '');
  }

  private saveOrUpdateSuccess(): void {
    this.messageService.add({
      severity: 'success',
      summary: $localize`Successfully saved`,
    });
    void this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  }
}
