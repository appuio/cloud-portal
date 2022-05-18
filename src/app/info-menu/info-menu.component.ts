import { Component, ChangeDetectionStrategy } from '@angular/core';
import { faQuestionCircle, faBook } from '@fortawesome/free-solid-svg-icons';
import { NavMenuItem } from '../app.component';

@Component({
  selector: 'app-info-menu',
  templateUrl: './info-menu.component.html',
  styleUrls: ['./info-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoMenuComponent {
  items: NavMenuItem[] = [
    {
      label: $localize`References`,
      icon: faBook,
      routerLink: ['references'],
    },
  ];

  faQuestion = faQuestionCircle;
}
