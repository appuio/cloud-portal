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

  form!: FormGroup<{ displayName: FormControl<string | undefined>; name: FormControl<string> }>;
  faSave = faSave;
  saving = false;
  private handleActionsSubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private actions: Actions,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.nonNullable.group({
      displayName: this.organization.spec.displayName,
      name: new FormControl(this.organization.metadata.name, {
        validators: [Validators.required, Validators.pattern('(([a-z0-9][-a-z0-9]*)?[a-z0-9])?')],
        nonNullable: true,
      }),
    });
    this.handleActions();
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
              name: this.form.getRawValue().name,
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
    this.handleActionsSubscription?.unsubscribe();
  }

  private handleActions(): void {
    this.handleActionsSubscription = this.actions
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
  }
}
