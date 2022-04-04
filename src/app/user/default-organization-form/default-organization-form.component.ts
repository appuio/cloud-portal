import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, SelectItem } from 'primeng/api';
import { faSave, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { saveUserPreferences, saveUserPreferencesFailure, saveUserPreferencesSuccess } from '../../store/app.actions';
import { selectOrganizationSelectItems, selectUser } from '../../store/app.selectors';

@Component({
  selector: 'app-default-organization-form',
  templateUrl: './default-organization-form.component.html',
  styleUrls: ['./default-organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultOrganizationFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  faSave = faSave;
  saving = false;
  organizations$: Observable<SelectItem[]> = this.store.select(selectOrganizationSelectItems);
  defaultOrganizationRefControl = new FormControl();
  faSitemap = faSitemap;

  private handleActionsSubscription?: Subscription;
  private userOrganizationSubscription?: Subscription;

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
    this.subscribeToUserAndOrganizationChanges();
    this.form = new FormGroup({
      defaultOrganizationRef: this.defaultOrganizationRefControl,
    });
    this.handleActions();
  }

  private subscribeToUserAndOrganizationChanges(): void {
    this.userOrganizationSubscription = combineLatest(this.store.select(selectUser), this.organizations$).subscribe(
      ([user, organizations]) => {
        const organization = organizations.find(
          (organization) => organization.value === user.value?.spec.preferences?.defaultOrganizationRef
        );
        if (organization) {
          this.defaultOrganizationRefControl.setValue(organization);
        }
      }
    );
  }

  save(): void {
    if (this.form.valid) {
      this.saving = true;
      this.store.dispatch(
        saveUserPreferences({
          defaultOrganizationRef: this.form.value.defaultOrganizationRef?.value ?? null,
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.handleActionsSubscription?.unsubscribe();
    this.userOrganizationSubscription?.unsubscribe();
  }

  private handleActions(): void {
    this.handleActionsSubscription = this.actions
      .pipe(ofType(saveUserPreferencesSuccess, saveUserPreferencesFailure))
      .subscribe((action) => {
        this.saving = false;
        if (action.type === saveUserPreferencesFailure.type) {
          this.messageService.add({
            severity: 'error',
            summary: $localize`Error`,
            detail: action.errorMessage,
          });
        } else {
          this.messageService.add({
            severity: 'success',
            summary: $localize`Successfully saved`,
          });
        }
        this.changeDetectorRef.markForCheck();
      });
  }
}
