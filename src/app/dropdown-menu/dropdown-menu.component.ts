import { Component, ChangeDetectionStrategy, Input, TemplateRef } from '@angular/core';
import { faUserGear, faUser, faSignOut } from '@fortawesome/free-solid-svg-icons';

import { NavMenuItem } from '../app.component';

@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownMenuComponent {
  @Input()
  items: NavMenuItem[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() headerElement!: TemplateRef<any>;

  dropdownContainerId: string;

  faUser = faUser;
  faSignOut = faSignOut;
  faUserGear = faUserGear;

  constructor() {
    //unique id for the dropdown container because pStyleClass needs a css selector and
    //cannot handle a template reference
    this.dropdownContainerId = 'dropdown-container' + Math.random().toString(36).substring(2);
  }
}
