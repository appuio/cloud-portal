import { Component, ChangeDetectionStrategy } from '@angular/core';
import { selectUser } from '../../store/app.selectors';
import { Store } from '@ngrx/store';
import { EntityState } from '../../types/entity';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSettingsComponent {
  EntityState = EntityState;

  constructor(private store: Store) {}

  user$ = this.store.select(selectUser);
}
