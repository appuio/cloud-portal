import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api';
import { selectFocusOrganizationName, selectOrganizationSelectItems } from '../store/app.selectors';
import { Store } from '@ngrx/store';
import { faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FormControl } from '@angular/forms';
import { setFocusOrganization } from '../store/app.actions';

@Component({
  selector: 'app-organization-selection',
  templateUrl: './organization-selection.component.html',
  styleUrls: ['./organization-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationSelectionComponent implements OnInit, OnDestroy {
  organizations$: Observable<SelectItem[]> = this.store.select(selectOrganizationSelectItems);
  faSitemap = faSitemap;
  organizationControl = new FormControl<string>('', { nonNullable: true });

  private subscriptions: Subscription[] = [];

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.organizationControl.valueChanges.subscribe((focusOrganizationName) =>
        this.store.dispatch(setFocusOrganization({ focusOrganizationName }))
      )
    );

    this.subscriptions.push(
      this.store
        .select(selectFocusOrganizationName)
        // eslint-disable-next-line ngrx/no-store-subscription
        .subscribe((organizationName) =>
          this.organizationControl.setValue(organizationName ?? '', { emitEvent: false })
        )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
