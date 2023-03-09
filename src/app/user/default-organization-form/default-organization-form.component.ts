import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatestWith, forkJoin, map, Observable, Subscription } from 'rxjs';
import { MessageService, SelectItem } from 'primeng/api';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { Organization } from '../../types/organization';
import { IdentityService } from '../../core/identity.service';
import { User } from '../../types/user';
import { OrganizationCollectionService } from '../../store/organization-collection.service';
import { OrganizationMembersCollectionService } from '../../store/organizationmembers-collection.service';
import { UserCollectionService } from '../../store/user-collection.service';

@Component({
  selector: 'app-default-organization-form',
  templateUrl: './default-organization-form.component.html',
  styleUrls: ['./default-organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultOrganizationFormComponent implements OnInit, OnDestroy {
  faSave = faSave;
  organizationSelectItems: SelectItem<string>[] = [];
  defaultOrganizationRefControl = new FormControl<SelectItem<string> | null>(null);
  form = new FormGroup({
    defaultOrganizationRef: this.defaultOrganizationRefControl,
  });

  private subscriptions: Subscription[] = [];
  user$?: Observable<User>;

  constructor(
    private identityService: IdentityService,
    private organizationService: OrganizationCollectionService,
    private orgMembersService: OrganizationMembersCollectionService,
    public userService: UserCollectionService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.user$ = this.userService.currentUser$.pipe(
      combineLatestWith(this.organizationService.getAllMemoized()),
      map(([user, orgs]) => {
        this.loadOrganizations(orgs, user);
        return user;
      })
    );
  }

  private loadOrganizations(organizationList: Organization[], user: User): void {
    const orgMembers$ = organizationList.map((organization) =>
      this.orgMembersService.getByKeyMemoized(`${organization.metadata.name}/members`)
    );

    const p = forkJoin(orgMembers$).subscribe((members) => {
      const username = this.identityService.getUsername();
      this.organizationSelectItems = organizationList
        .filter((o, index) => (members[index].spec.userRefs ?? []).map((userRef) => userRef.name).includes(username))
        .map((o) => ({
          value: o.metadata.name,
          label: o.spec.displayName ? `${o.spec.displayName} (${o.metadata.name})` : o.metadata.name,
        }));

      const organization = this.organizationSelectItems.find(
        (organization) => organization.value === user.spec.preferences?.defaultOrganizationRef
      );
      if (organization) {
        this.defaultOrganizationRefControl.setValue(organization);
      }
    });
    this.subscriptions.push(p);
  }

  save(user: User): void {
    if (!this.form.valid) {
      return;
    }
    const clone = structuredClone(user);
    clone.spec.preferences = {
      ...clone.spec.preferences,
      defaultOrganizationRef: this.form.value.defaultOrganizationRef?.value,
    };
    this.userService.update(clone).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: $localize`Successfully saved`,
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: $localize`Error`,
          detail: err.message,
          sticky: true,
        });
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
