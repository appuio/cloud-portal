import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { MessageService, SelectItem } from 'primeng/api';
import { faSave, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { saveUserPreferences, saveUserPreferencesFailure, saveUserPreferencesSuccess } from '../../store/app.actions';
import { selectUser } from '../../store/app.selectors';
import { KubernetesClientService } from '../../core/kubernetes-client.service';
import { Organization } from '../../types/organization';
import { IdentityService } from '../../core/identity.service';
import { User } from '../../types/user';
import { Entity } from '../../types/entity';
import { OrganizationCollectionService } from '../../store/organization-collection.service';
import {
  KubernetesCollectionService,
  KubernetesCollectionServiceFactory,
} from '../../store/kubernetes-collection.service';
import { OrganizationMembers } from '../../types/organization-members';
import { organizationMembersEntityKey } from '../../store/entity-metadata-map';

@Component({
  selector: 'app-default-organization-form',
  templateUrl: './default-organization-form.component.html',
  styleUrls: ['./default-organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultOrganizationFormComponent implements OnInit, OnDestroy {
  faSave = faSave;
  saving = false;
  organizationSelectItems: SelectItem<string>[] = [];
  defaultOrganizationRefControl = new FormControl<SelectItem<string> | null>(null);
  form = new FormGroup({
    defaultOrganizationRef: this.defaultOrganizationRefControl,
  });
  faSitemap = faSitemap;

  private subscriptions: Subscription[] = [];
  private orgMembersService: KubernetesCollectionService<OrganizationMembers>;

  constructor(
    private identityService: IdentityService,
    private kubernetesClientService: KubernetesClientService,
    private organizationService: OrganizationCollectionService,
    private orgMembersServiceFactory: KubernetesCollectionServiceFactory<OrganizationMembers>,
    private store: Store,
    private actions: Actions,
    private changeDetectorRef: ChangeDetectorRef,
    private messageService: MessageService
  ) {
    this.orgMembersService = orgMembersServiceFactory.create(organizationMembersEntityKey);
  }

  ngOnInit(): void {
    this.subscribeToUser();
    this.handleActions();
  }

  private loadOrganizations(organizationList: Organization[], user: Entity<User | null>): void {
    const getOrganizationMembersRequests = organizationList.map((organization) =>
      this.orgMembersService.getByKeyMemoized(`${organization.metadata.name}/members`)
    );

    forkJoin(getOrganizationMembersRequests).subscribe((members) => {
      const username = this.identityService.getUsername();
      this.organizationSelectItems = organizationList
        .filter((o, index) => (members[index].spec.userRefs ?? []).map((userRef) => userRef.name).includes(username))
        .map((o) => ({
          value: o.metadata.name,
          label: o.spec.displayName ? `${o.spec.displayName} (${o.metadata.name})` : o.metadata.name,
        }));

      const organization = this.organizationSelectItems.find(
        (organization) => organization.value === user.value?.spec.preferences?.defaultOrganizationRef
      );
      if (organization) {
        this.defaultOrganizationRefControl.setValue(organization);
      }
    });
  }

  private subscribeToUser(): void {
    this.subscriptions.push(
      // eslint-disable-next-line ngrx/no-store-subscription
      this.store.select(selectUser).subscribe((user) => {
        this.organizationService
          .getAllMemoized()
          .subscribe((organizationList) => this.loadOrganizations(organizationList, user));
      })
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
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private handleActions(): void {
    this.subscriptions.push(
      this.actions.pipe(ofType(saveUserPreferencesSuccess, saveUserPreferencesFailure)).subscribe((action) => {
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
      })
    );
  }
}
