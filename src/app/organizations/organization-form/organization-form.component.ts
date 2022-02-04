import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Organization } from '../../types/organization';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { saveOrganization, saveOrganizationsFailure, saveOrganizationsSuccess } from '../store/organization.actions';
import { Actions, ofType } from '@ngrx/effects';
import { take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationFormComponent implements OnInit {
  @Input()
  organization!: Organization;
  @Input()
  new!: boolean;

  form!: FormGroup;
  faSave = faSave;
  saving = false;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private action: Actions,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      displayName: [this.organization.spec.displayName, Validators.required],
      name: [
        this.organization.metadata.name,
        [Validators.required, Validators.pattern('(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?')],
      ],
    });
  }

  save(): void {
    if (this.form.valid) {
      this.saving = true;
      this.handleActions();
      this.store.dispatch(
        saveOrganization({
          isNew: this.new,
          organization: {
            ...this.organization,
            metadata: {
              name: this.form.value.name,
            },
            spec: {
              ...this.organization.spec,
              displayName: this.form.value.displayName,
            },
          },
        })
      );
    }
  }

  private handleActions(): void {
    this.action
      .pipe(ofType(saveOrganizationsSuccess, saveOrganizationsFailure))
      .pipe(take(1))
      .subscribe((action) => {
        this.saving = false;
        if (action.type === saveOrganizationsFailure.type) {
          this.messageService.add({
            severity: 'error',
            summary: $localize`Error`,
            detail: action.error,
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