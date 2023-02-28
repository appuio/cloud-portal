import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { map, Observable, Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api';
import { Store } from '@ngrx/store';
import { faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FormControl } from '@angular/forms';
import { OrganizationCollectionService } from '../store/organization-collection.service';

@Component({
  selector: 'app-organization-selection',
  templateUrl: './organization-selection.component.html',
  styleUrls: ['./organization-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationSelectionComponent implements OnInit, OnDestroy {
  organizations$?: Observable<SelectItem[]>;
  faSitemap = faSitemap;
  organizationControl = new FormControl<string>('', { nonNullable: true });

  private subscriptions: Subscription[] = [];

  constructor(private store: Store, private organizationService: OrganizationCollectionService) {}

  ngOnInit(): void {
    this.organizations$ = this.organizationService.getAllMemoized().pipe(
      map((orgs) =>
        orgs.map((o) => {
          return {
            value: o.metadata.name,
            label: o.spec.displayName ? `${o.spec.displayName} (${o.metadata.name})` : o.metadata.name,
          } as SelectItem;
        })
      )
    );
    this.subscriptions.push(
      this.organizationControl.valueChanges.subscribe((focusOrganizationName) => {
        this.organizationService.selectOrganization(focusOrganizationName);
      })
    );

    this.organizationService.selectedOrganization$.subscribe((org) => {
      this.organizationControl.setValue(org ? org.metadata.name : '', { emitEvent: false });
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
