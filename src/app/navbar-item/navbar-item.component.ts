import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NavMenuItem } from '../app.component';

@Component({
  selector: 'app-navbar-item',
  templateUrl: './navbar-item.component.html',
  styleUrls: ['./navbar-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarItemComponent {
  @Input() menuItem!: NavMenuItem;
  @Input() light = false;
}
