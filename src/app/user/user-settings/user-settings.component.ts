import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { UserCollectionService } from '../../store/user-collection.service';
import { Observable } from 'rxjs';
import { User } from '@sentry/angular';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSettingsComponent implements OnInit {
  user$?: Observable<User>;

  faWarning = faWarning;

  constructor(private userService: UserCollectionService) {}

  ngOnInit(): void {
    this.user$ = this.userService.currentUser$;
  }
}
