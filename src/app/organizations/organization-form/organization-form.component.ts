import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Organization } from '../../types/organization';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { saveOrganization, saveOrganizationFailure, saveOrganizationSuccess } from '../store/organization.actions';
import { Actions, ofType } from '@ngrx/effects';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { OrganizationNameService } from '../organization-name.service';

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

  form!: FormGroup<{ displayName: FormControl<string | undefined>; organizationId: FormControl<string> }>;
  faSave = faSave;
  saving = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private actions: Actions,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private messageService: MessageService,
    private organizationNameService: OrganizationNameService
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
    this.handleActions();
  }

  setNameFromDisplayName(displayName: string | undefined): void {
    const orgIdInput = this.form.get('organizationId');
    if (displayName && orgIdInput?.pristine) {
      const name = this.organizationNameService.tranformToKubeName(displayName);
      this.form.get('organizationId')?.setValue(name);
    }
  }

  save(): void {
    if (this.form.valid) {
      this.saving = true;
      this.store.dispatch(
        saveOrganization({
          isNew: this.new,
          organization: {
            kind: 'Organization',
            apiVersion: 'organization.appuio.io/v1',
            metadata: {
              name: this.form.getRawValue().organizationId,
            },
            spec: {
              displayName: this.form.getRawValue().displayName,
            },
          },
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private handleActions(): void {
    const handleActionsSubscription = this.actions
      .pipe(ofType(saveOrganizationSuccess, saveOrganizationFailure))
      .subscribe((action) => {
        this.saving = false;
        if (action.type === saveOrganizationFailure.type) {
          let detail = '';
          if ('message' in action.error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            detail = action.error.message;
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if ('AlreadyExists' === action.error.reason) {
            this.form.get('name')?.setErrors({ alreadyExists: true });
            detail = $localize`Organization "${this.form.get('name')?.value}" already exists.`;
          }
          this.messageService.add({
            severity: 'error',
            summary: $localize`Error`,
            detail,
          });
        } else {
          this.messageService.add({
            severity: 'success',
            summary: $localize`Successfully saved`,
          });
          void this.router.navigate(['..'], { relativeTo: this.activatedRoute });
        }
        this.changeDetectorRef.markForCheck();
      });
    this.subscriptions.push(handleActionsSubscription);
  }
}
